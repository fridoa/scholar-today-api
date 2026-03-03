import FollowModel from "../models/follow.model";
import NotificationModel from "../models/notification.model";

export interface IFollowInfo {
  followed: boolean;
  isPending: boolean;
  followsYou: boolean;
  followersCount: number;
  followingCount: number;
}

export interface IFollowRequest {
  fromUserId: number;
  createdAt: Date;
}

const acceptedFilter = { status: { $ne: "pending" } };

const followService = {
  async toggle(followerId: number, followingId: number) {
    const existing = await FollowModel.findOne({ followerId, followingId });

    if (existing) {
      await FollowModel.deleteOne({ followerId, followingId });
      return { followed: false, isPending: false };
    }

    await FollowModel.create({ followerId, followingId, status: "pending" });

    NotificationModel.create({
      userId: followingId,
      fromUserId: followerId,
      type: "follow",
      message: "sent you a follow request",
    }).catch(() => {});

    return { followed: false, isPending: true };
  },

  async getInfo(followerId: number, followingId: number): Promise<IFollowInfo> {
    const isSelf = followerId === followingId;

    const [followDoc, reverse, followersCount, followingCount] = await Promise.all([
      isSelf ? null : FollowModel.findOne({ followerId, followingId }).select("status").lean(),
      isSelf ? null : FollowModel.exists({ followerId: followingId, followingId: followerId, ...acceptedFilter }),
      FollowModel.countDocuments({ followingId, ...acceptedFilter }),
      FollowModel.countDocuments({ followerId: followingId, ...acceptedFilter }),
    ]);

    return {
      followed: followDoc != null && followDoc.status !== "pending",
      isPending: followDoc?.status === "pending",
      followsYou: !!reverse,
      followersCount,
      followingCount,
    };
  },

  async getBatch(userIds: number[], currentUserId: number): Promise<Record<number, IFollowInfo>> {
    const [followsByMe, followsMe, countResults] = await Promise.all([
      FollowModel.find({ followerId: currentUserId, followingId: { $in: userIds } })
        .select("followingId status")
        .lean(),
      FollowModel.find({ followerId: { $in: userIds }, followingId: currentUserId, ...acceptedFilter })
        .select("followerId")
        .lean(),
      FollowModel.aggregate([
        { $match: { ...acceptedFilter, $or: [{ followingId: { $in: userIds } }, { followerId: { $in: userIds } }] } },
        {
          $facet: {
            followers: [{ $match: { followingId: { $in: userIds } } }, { $group: { _id: "$followingId", count: { $sum: 1 } } }],
            following: [{ $match: { followerId: { $in: userIds } } }, { $group: { _id: "$followerId", count: { $sum: 1 } } }],
          },
        },
      ]),
    ]);

    const followedSet = new Set(followsByMe.filter((f) => f.status !== "pending").map((f) => f.followingId));
    const pendingSet = new Set(followsByMe.filter((f) => f.status === "pending").map((f) => f.followingId));
    const followsYouSet = new Set(followsMe.map((f) => f.followerId));

    const followersMap = new Map<number, number>();
    const followingMap = new Map<number, number>();

    if (countResults[0]) {
      for (const r of countResults[0].followers) followersMap.set(r._id, r.count);
      for (const r of countResults[0].following) followingMap.set(r._id, r.count);
    }

    const result: Record<number, IFollowInfo> = {};
    for (const id of userIds) {
      result[id] = {
        followed: followedSet.has(id),
        isPending: pendingSet.has(id),
        followsYou: followsYouSet.has(id),
        followersCount: followersMap.get(id) ?? 0,
        followingCount: followingMap.get(id) ?? 0,
      };
    }

    return result;
  },

  async getPendingRequests(userId: number): Promise<IFollowRequest[]> {
    const requests = await FollowModel.find({ followingId: userId, status: "pending" }).select("followerId createdAt").sort({ createdAt: -1 }).lean();

    return requests.map((r) => ({ fromUserId: r.followerId, createdAt: r.createdAt! }));
  },

  async accept(fromUserId: number, toUserId: number): Promise<void> {
    await FollowModel.findOneAndUpdate({ followerId: fromUserId, followingId: toUserId, status: "pending" }, { status: "accepted" });

    NotificationModel.create({
      userId: fromUserId,
      fromUserId: toUserId,
      type: "follow",
      message: "accepted your follow request",
    }).catch(() => {});
  },

  async reject(fromUserId: number, toUserId: number): Promise<void> {
    await FollowModel.deleteOne({ followerId: fromUserId, followingId: toUserId, status: "pending" });
  },

  async getFriends(userId: number): Promise<number[]> {
    const following = await FollowModel.find({ followerId: userId, status: "accepted" }).select("followingId").lean();

    const followingIds = following.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    const mutuals = await FollowModel.find({
      followerId: { $in: followingIds },
      followingId: userId,
      status: "accepted",
    })
      .select("followerId")
      .lean();

    return mutuals.map((m) => m.followerId);
  },
};

export default followService;
