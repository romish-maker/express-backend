import { CommandPostsRepository } from '../repositories/CommandPostsRepository'
import { PostInputModel } from '../types/PostInputModel'
import { PostDbModel } from '../types/PostDbModel'
import { CommentInputModel } from '../types/CommentInputModel'
import { ResultToRouterStatus } from '../../../common/enums/ResultToRouterStatus'
import { CommentDbModel, LikeInputModel, LikesDbModel, LikeStatuses } from '../../../comments'
import { QueryPostsRepository } from '../repositories/QueryPostsRepository'
import { usersQueryRepository, UsersQueryRepository } from '../../../users'
import { PostViewModel } from '../types/PostViewModel'
import { operationsResultService } from '../../../common/services'

export class PostsService {
  constructor(
    protected queryPostsRepository: QueryPostsRepository,
    protected commandPostsRepository: CommandPostsRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async createPost(payload: PostInputModel) {
    const blogData = await this.queryPostsRepository.getPostBlogById(payload.blogId)

    if (!blogData) return false

    const createdPostData: PostDbModel = {
      title: payload.title,
      shortDescription: payload.shortDescription,
      content: payload.content,
      blogId: payload.blogId,
      blogName: blogData.name,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
    }

    return this.commandPostsRepository.createPost(createdPostData)
  }
  async createCommentToPost(postId: string, userId: string, payload: CommentInputModel) {
    const post = await this.queryPostsRepository.getPostById(postId)
    const user = await this.usersQueryRepository.getUserById(userId)

    if (!(post && user)) {
      return {
        status: ResultToRouterStatus.NOT_FOUND
      }
    }

    const newComment: CommentDbModel = {
      postId,
      content: payload.content,
      commentatorInfo: {
        userId,
        userLogin: user.login,
      },
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
    }

    const commentId = await this.commandPostsRepository.createCommentToPost(newComment)

    return {
      status: ResultToRouterStatus.SUCCESS,
      data: { commentId },
    }
  }
  async updatePost(payload: PostInputModel, postId: string) {
    const foundBlog = await this.queryPostsRepository.getPostBlogById(payload.blogId)

    if (!foundBlog) return false

    const updatePostData: PostInputModel = {
      title: payload.title,
      shortDescription: payload.shortDescription,
      content: payload.content,
      blogId: payload.blogId,
    }

    return this.commandPostsRepository.updatePost(updatePostData, postId)
  }
  async updatePostLikeStatus(payload: LikeInputModel, post: PostViewModel, userId: string) {
    const user = await usersQueryRepository.getUserById(userId)
    if (!user) {
      return operationsResultService.generateResponse(ResultToRouterStatus.NOT_FOUND)
    }

    const currentLikeStatus = await this.queryPostsRepository.getLikeStatus(userId, post.id)
    let likesCountChange: number
    let dislikesCountChange: number

    if (currentLikeStatus) {
      const updatedLikeStatusDto: LikesDbModel = {
        userId: currentLikeStatus.userId,
        userLogin: currentLikeStatus.userLogin,
        parentId: currentLikeStatus.parentId,
        status: payload.likeStatus,
        createdAt: currentLikeStatus.status === payload.likeStatus ? currentLikeStatus.createdAt : new Date(),
      }
      await this.commandPostsRepository.updateLikeStatus(updatedLikeStatusDto, post.id)

      const { dislikesCount, likesCount } = this.calculateChanges(currentLikeStatus.status, payload.likeStatus)
      likesCountChange = likesCount
      dislikesCountChange = dislikesCount
    } else {
      const createLikeStatusDto: LikesDbModel = {
        userId,
        userLogin: user.login,
        parentId: post.id,
        status: payload.likeStatus,
        createdAt: new Date(),
      }
      await this.commandPostsRepository.createLikeStatus(createLikeStatusDto)

      likesCountChange = payload.likeStatus === LikeStatuses.LIKE ? 1 : 0
      dislikesCountChange = payload.likeStatus === LikeStatuses.DISLIKE ? 1 : 0
    }

    const likesCount = (post.extendedLikesInfo?.likesCount ?? 0) + likesCountChange
    const dislikesCount = (post.extendedLikesInfo?.dislikesCount ?? 0) + dislikesCountChange

    const updatePostData: PostInputModel = {
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      likesCount: likesCount >= 0 ? likesCount : 0,
      dislikesCount: dislikesCount >= 0 ? dislikesCount : 0,
    }

    return this.commandPostsRepository.updatePost(updatePostData, post.id)
  }
  async deletePostById(postId: string) {
    return this.commandPostsRepository.deletePostById(postId)
  }
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
