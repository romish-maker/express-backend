import { CommentInputModel } from '../types/CommentInputModel'
import { commentsQueryRepository } from '../repositories/commentsQueryRepository'
import { ResultToRouterStatus } from '../../../common/enums/ResultToRouterStatus'
import { commentsCommandRepository } from '../repositories/commentsCommandRepository'
import { CommentDbModel } from '../types/CommentDbModel'
import { operationsResultService } from '../../../common/services'
import { LikeInputModel } from '../types/LikeInputModel'
import { LikesDbModel } from '../types/LikesDbModel'
import { LikeStatuses } from '../enums/LikeStatuses'
import { usersQueryRepository } from '../../../users'

export const commentsService = {
  async updateComment(commentId: string, userId: string, payload: CommentInputModel) {
    const commentResult = await this.getCommentResult(commentId)

    if (commentResult.data?.commentatorInfo.userId && commentResult.data.commentatorInfo.userId !== userId) {
      return operationsResultService.generateResponse(ResultToRouterStatus.FORBIDDEN)
    }

    if (commentResult.status !== ResultToRouterStatus.SUCCESS) {
      return commentResult
    }

    const commentData = commentResult.data!
    const updatedComment: CommentDbModel = {
      postId: commentData.postId,
      content: payload.content,
      commentatorInfo: commentData.commentatorInfo,
      createdAt: commentData.createdAt,
      likesCount: commentData.likesCount,
      dislikesCount: commentData.dislikesCount,
    }

    const updateResult = await commentsCommandRepository.updateComment(commentId, updatedComment)
    if (!updateResult) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_FOUND)
    }

    return operationsResultService.generateResponse(ResultToRouterStatus.SUCCESS)
  },
  async updateCommentLikeStatus(commentId: string, userId: string, payload: LikeInputModel) {
    const commentResult = await this.getCommentResult(commentId)
    const user = await usersQueryRepository.getUserById(userId)

    if (!user) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_FOUND)
    }

    if (commentResult.status !== ResultToRouterStatus.SUCCESS) {
      return commentResult
    }

    const currentLikeStatus = await commentsQueryRepository.getLikeStatus(userId, commentId)
    let likesCountChange = 0
    let dislikesCountChange = 0

    if (currentLikeStatus) {
      const updatedLikeStatusDto: LikesDbModel = {
        userId: currentLikeStatus.userId,
        userLogin: currentLikeStatus.userLogin,
        parentId: currentLikeStatus.parentId,
        status: payload.likeStatus,
        createdAt: currentLikeStatus.createdAt,
      }
      await commentsCommandRepository.updateLikeStatus(updatedLikeStatusDto)

      const { dislikesCount, likesCount } = this.calculateChanges(currentLikeStatus.status, payload.likeStatus)
      likesCountChange = likesCount
      dislikesCountChange = dislikesCount
    } else {
      const createLikeStatusDto: LikesDbModel = {
        userId,
        userLogin: user.login,
        parentId: commentId,
        status: payload.likeStatus,
        createdAt: new Date(),
      }
      await commentsCommandRepository.createLikeStatus(createLikeStatusDto)

      likesCountChange = payload.likeStatus === LikeStatuses.LIKE ? 1 : 0
      dislikesCountChange = payload.likeStatus === LikeStatuses.DISLIKE ? 1 : 0
    }

    const commentData = commentResult.data!
    const likesCount = commentData.likesCount + likesCountChange
    const dislikesCount = commentData.dislikesCount + dislikesCountChange
    const updatedComment: CommentDbModel = {
      postId: commentData.postId,
      content: commentData.content,
      commentatorInfo: commentData.commentatorInfo,
      createdAt: commentData.createdAt,
      likesCount: likesCount >= 0 ? likesCount : 0,
      dislikesCount: dislikesCount >= 0 ? dislikesCount : 0,
    }

    const updateResult = await commentsCommandRepository.updateComment(commentId, updatedComment)
    if (!updateResult) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_FOUND)
    }

    return operationsResultService.generateResponse(ResultToRouterStatus.SUCCESS)
  },
  async deleteComment(commentId: string, userId: string) {
    const commentResult = await this.getCommentResult(commentId)

    if (commentResult.data?.commentatorInfo.userId && commentResult.data.commentatorInfo.userId !== userId) {
      return operationsResultService.generateResponse(ResultToRouterStatus.FORBIDDEN)
    }

    if (commentResult.status !== ResultToRouterStatus.SUCCESS) {
      return commentResult
    }

    const deleteResult = await commentsCommandRepository.deleteComment(commentId)
    if (!deleteResult) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_FOUND)
    }

    return operationsResultService.generateResponse(ResultToRouterStatus.SUCCESS)
  },
  async getCommentResult(commentId: string) {
    const commentResult = await commentsQueryRepository.getCommentDbModelById(commentId)

    if (commentResult.status === ResultToRouterStatus.NOT_FOUND) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_FOUND)
    }

    return commentResult
  },
  calculateChanges(currentStatus: LikeStatuses, changedStatus: LikeStatuses) {
    let likesCount = 0
    let dislikesCount = 0

    if (currentStatus === LikeStatuses.LIKE && changedStatus === LikeStatuses.DISLIKE) {
      likesCount = -1
      dislikesCount = 1
    }

    if (currentStatus === LikeStatuses.LIKE && changedStatus === LikeStatuses.NONE) {
      likesCount = -1
      dislikesCount = 0
    }

    if (currentStatus === LikeStatuses.DISLIKE && changedStatus === LikeStatuses.NONE) {
      likesCount = 0
      dislikesCount = -1
    }

    if (currentStatus === LikeStatuses.DISLIKE && changedStatus === LikeStatuses.LIKE) {
      likesCount = 1
      dislikesCount = -1
    }

    if (currentStatus === LikeStatuses.NONE && changedStatus === LikeStatuses.LIKE) {
      likesCount = 1
      dislikesCount = 0
    }

    if (currentStatus === LikeStatuses.NONE && changedStatus === LikeStatuses.DISLIKE) {
      likesCount = 0
      dislikesCount = -1
    }

    return { likesCount, dislikesCount }
  }
}
