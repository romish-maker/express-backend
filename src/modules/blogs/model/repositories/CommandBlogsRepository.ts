import { BlogInputModel } from '../types/BlogInputModel'
import { BlogViewModel } from '../types/BlogViewModel'
import { BlogsMongooseModel, PostsMongooseModel } from '../../../../app/config/db'
import { PostDbModel } from '../../../posts'

export class CommandBlogsRepository {
  async createNewBlog(newBlog: Omit<BlogViewModel, 'id'>): Promise<string> {
    const result = await BlogsMongooseModel.create(newBlog)

    return result._id.toString()
  }
  async createNewPostForBlog(newPostData: PostDbModel) {
    const result = await PostsMongooseModel.create(newPostData)

    return result._id.toString()
  }
  async updateBlog(blogId: string, updateData: BlogInputModel) {
    const updateResult = await BlogsMongooseModel.updateOne({ _id: blogId }, updateData)

    return Boolean(updateResult.matchedCount)
  }
  async deleteBlog(blogId: string) {
    const deleteResult = await BlogsMongooseModel.deleteOne({ _id: blogId })

    return Boolean(deleteResult.deletedCount)
  }
}
