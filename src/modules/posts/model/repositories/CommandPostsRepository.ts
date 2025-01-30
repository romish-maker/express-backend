import { PostInputModel } from '../types/PostInputModel'
import { CommentsMongooseModel, LikesMongooseModel, PostsMongooseModel } from '../../../../app/config/db'
import { PostDbModel } from '../types/PostDbModel'
import { CommentDbModel, LikesDbModel } from '../../../comments'

export class CommandPostsRepository {
  async createPost(createdPostData: PostDbModel) {
    const result = await PostsMongooseModel.create(createdPostData)

    return result._id.toString()
  }
  async createCommentToPost(newComment: CommentDbModel) {
    const result = await CommentsMongooseModel.create(newComment)

    return result._id.toString()
  }
  async createLikeStatus(createLikeStatusDto: LikesDbModel) {
    const createResult = await LikesMongooseModel.create(createLikeStatusDto)

    return createResult._id.toString()
  }
  async updateLikeStatus(updatedLikeStatusDto: LikesDbModel, postId: string) {
    const updateResult = await LikesMongooseModel.updateOne({ userId: updatedLikeStatusDto.userId, parentId: postId }, updatedLikeStatusDto)

    return Boolean(updateResult.matchedCount)
  }
  async updatePost(updatePostData: PostInputModel, postId: string) {
    const updateResult = await PostsMongooseModel.updateOne({ _id: postId }, { $set: updatePostData })

    return Boolean(updateResult.matchedCount)
  }
  async deletePostById(postId: string) {
    const deleteResult = await PostsMongooseModel.deleteOne({ _id: postId })

    return Boolean(deleteResult.deletedCount)
  }
}
