import FollowModel from "../models/follow.model";
import NotificationModel from "../models/notification.model";

export interface IFollowInfo {
  followed: boolean;
  followsYou: boolean;
  followersCount: number;
  followingCount: number;
}

const followService = {
  async toggle(followerId: number, followingId: number) {
    const existing = await FollowModel.findOne({ followerId, followingId });

    if (existing) {
      await FollowModel.deleteOne({ followerId, followingId });
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

  /** Merged: status + counts in one query */
  async getInfo(followerId: number, followingId: number): Promise<IFollowInfo> {
    const isSelf = followerId === followingId;

    const [exists, reverse, followersCount, followingCount] = await Promise.all([
      isSelf ? null : FollowModel.exists({ followerId, followingId }),
      isSelf ? null : FollowModel.exists({ followerId: followingId, followingId: followerId }),
      FollowModel.countDocuments({ followingId }),
      FollowModel.countDocuments({ followerId: followingId }),
    ]);

    return {
      followed: !!exists,
      followsYou: !!reverse,
      followersCount,
      followingCount,
    };
  },

  /** Batch: get info for multiple users at once */
  async getBatch(userIds: number[], currentUserId: number): Promise<Record<number, IFollowInfo>> {
    // Get all follow relationships involving current user and target users
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
        followsYou: followsYouSet.has(id),
        followersCount: followersMap.get(id) ?? 0,
        followingCount: followingMap.get(id) ?? 0,
      };
    }

    return result;
  },
};

export default followService;
