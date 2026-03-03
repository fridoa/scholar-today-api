import FollowModel from "../models/follow.model";
import NotificationModel from "../models/notification.model";

export interface IFollowInfo {
  followed: boolean;
  isFriend: boolean;
  followsYou: boolean;
  followersCount: number;
  followingCount: number;
}

const followService = {
  async toggle(followerId: number, followingId: number) {
    const existing = await FollowModel.findOne({ followerId, followingId });

    if (existing) {
      await FollowModel.deleteOne({ followerId, followingId });
      NotificationModel.deleteOne({ userId: followingId, fromUserId: followerId, type: "follow" }).catch(() => {});
      return { followed: false };
    }

    await FollowModel.create({ followerId, followingId });

    NotificationModel.create({
      userId: followingId,
      fromUserId: followerId,
      type: "follow",
      message: "started following you",
    }).catch(() => {});

    return { followed: true };
  },

  async getInfo(followerId: number, followingId: number): Promise<IFollowInfo> {
    const isSelf = followerId === followingId;

    const [followDoc, reverse, followersCount, followingCount] = await Promise.all([
      isSelf ? null : FollowModel.exists({ followerId, followingId }),
      isSelf ? null : FollowModel.exists({ followerId: followingId, followingId: followerId }),
      FollowModel.countDocuments({ followingId }),
      FollowModel.countDocuments({ followerId: followingId }),
    ]);

    const followed = !!followDoc;
    const followsYou = !!reverse;
    return {
      followed,
      isFriend: followed && followsYou,
      followsYou,
      followersCount,
      followingCount,
    };
  },

  async getBatch(userIds: number[], currentUserId: number): Promise<Record<number, IFollowInfo>> {
    const [followsByMe, followsMe, countResults] = await Promise.all([
      FollowModel.find({ followerId: currentUserId, followingId: { $in: userIds } })
        .select("followingId")
        .lean(),
      FollowModel.find({ followerId: { $in: userIds }, followingId: currentUserId })
        .select("followerId")
        .lean(),
      FollowModel.aggregate([
        { $match: { $or: [{ followingId: { $in: userIds } }, { followerId: { $in: userIds } }] } },
        {
          $facet: {
            followers: [{ $match: { followingId: { $in: userIds } } }, { $group: { _id: "$followingId", count: { $sum: 1 } } }],
            following: [{ $match: { followerId: { $in: userIds } } }, { $group: { _id: "$followerId", count: { $sum: 1 } } }],
          },
        },
      ]),
    ]);

    const followedSet = new Set(followsByMe.map((f) => f.followingId));
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
        isFriend: followedSet.has(id) && followsYouSet.has(id),
        followsYou: followsYouSet.has(id),
        followersCount: followersMap.get(id) ?? 0,
        followingCount: followingMap.get(id) ?? 0,
      };
    }

    return result;
  },

  async getFollowers(userId: number): Promise<number[]> {
    const followers = await FollowModel.find({ followingId: userId }).select("followerId").lean();
    return followers.map((f) => f.followerId);
  },

  async getFriends(userId: number): Promise<number[]> {
    const following = await FollowModel.find({ followerId: userId }).select("followingId").lean();

    const followingIds = following.map((f) => f.followingId);
    if (followingIds.length === 0) return [];

    const mutuals = await FollowModel.find({
      followerId: { $in: followingIds },
      followingId: userId,
    })
      .select("followerId")
      .lean();

    return mutuals.map((m) => m.followerId);
  },
};

export default followService;
