import { BlogInputModel } from '../types/BlogInputModel'
import { BlogViewModel } from '../types/BlogViewModel'
import { CommandBlogsRepository } from '../repositories/CommandBlogsRepository'
import { PostDbModel, PostInputModel } from '../../../posts'
import { QueryBlogsRepository } from '../repositories/QueryBlogsRepository'

export class BlogsService {
  constructor(
    protected queryBlogsRepository: QueryBlogsRepository,
    protected commandBlogsRepository: CommandBlogsRepository,
  ) {}
  async createBlog(payload: BlogInputModel): Promise<string> {
    const newBlog: Omit<BlogViewModel, 'id'> = {
      name: payload.name,
      description: payload.description,
      websiteUrl: payload.websiteUrl,
      isMembership: false,
      createdAt: new Date().toISOString(),
    }

    return this.commandBlogsRepository.createNewBlog(newBlog)
  }
  async createPostForBlog(payload: PostInputModel) {
    const blogToAddPostIn = await this.queryBlogsRepository.getBlogById(payload.blogId)
    const newPostData: PostDbModel = {
      blogId: payload.blogId,
      title: payload.title,
      shortDescription: payload.shortDescription,
      content: payload.content,
      blogName: blogToAddPostIn?.name ?? '',
      createdAt: new Date().toISOString(),
      likesCount: 0,
      dislikesCount: 0,
    }

    if (!blogToAddPostIn) return null

    return await this.commandBlogsRepository.createNewPostForBlog(newPostData)
  }
  async updateBlog(blogId: string, payload: BlogInputModel) {
    const updateData: BlogInputModel = {
      name: payload.name,
      description: payload.description,
      websiteUrl: payload.websiteUrl,
    }

    return this.commandBlogsRepository.updateBlog(blogId, updateData)
  }
  async deleteBlog(blogId: string) {
    return this.commandBlogsRepository.deleteBlog(blogId)
  }
}
