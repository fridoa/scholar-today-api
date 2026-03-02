import FollowModel from "../models/follow.model";
import NotificationModel from "../models/notification.model";

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

  async getStatus(followerId: number, followingId: number) {
    const [exists, reverse] = await Promise.all([FollowModel.exists({ followerId, followingId }), FollowModel.exists({ followerId: followingId, followingId: followerId })]);
    return { followed: !!exists, followsYou: !!reverse };
  },

  async getCounts(userId: number) {
    const [followersCount, followingCount] = await Promise.all([FollowModel.countDocuments({ followingId: userId }), FollowModel.countDocuments({ followerId: userId })]);
    return { followersCount, followingCount };
  },
};

export default followService;
