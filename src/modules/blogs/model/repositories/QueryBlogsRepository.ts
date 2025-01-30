import { BlogsMongooseModel } from '../../../../app/config/db'
import { BlogsMappers } from '../mappers/BlogsMappers'
import { BlogViewModel } from '../types/BlogViewModel'
import { PaginationWithItems } from '../../../common/types'

export class QueryBlogsRepository {
  constructor(protected blogsMappers: BlogsMappers) {}

  async getAllBlogs(queryParams: any): Promise<PaginationWithItems<BlogViewModel[]>> {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } = queryParams
    let filter: Partial<Record<keyof BlogViewModel, any>> = {}

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' }
    }

    const foundBlogs = await BlogsMongooseModel
      .find(filter)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize)

    const totalCount = await BlogsMongooseModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / pageSize)
    const mappedBlogs = foundBlogs.map(this.blogsMappers.mapBlogToView)

    return {
      pageSize,
      pagesCount,
      totalCount,
      page: pageNumber,
      items: mappedBlogs,
    }
  }
  async getBlogById(blogId: string) {
    const foundBlog = await BlogsMongooseModel.findById(blogId)
    const viewModelBlog = foundBlog && this.blogsMappers.mapBlogToView(foundBlog)

    return viewModelBlog
  }
}
