import { BlogsService } from '../services/BlogsService'
import { QueryBlogsRepository } from '../repositories/QueryBlogsRepository'
import { PostInputModel, QueryPostsRepository } from '../../../posts'
import {
  PaginationAndSortQuery,
  RequestBody,
  RequestParamsBody,
  RequestParamsQuery,
  RequestQuery
} from '../../../common/types'
import { BlogQueryModel } from '../types/BlogQueryModel'
import { Request, Response } from 'express'
import { HttpStatusCode } from '../../../common/enums'
import { BlogInputModel } from '../types/BlogInputModel'
import { jwtService } from '../../../common/services'

export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected queryBlogsRepository: QueryBlogsRepository,
    protected queryPostsRepository: QueryPostsRepository,
  ) {}

  async getUsers(req: RequestQuery<Partial<BlogQueryModel>>, res: Response) {
    const blogsQuery = {
      searchNameTerm: req.query.searchNameTerm ?? null,
      sortBy: req.query.sortBy ?? 'createdAt',
      sortDirection: req.query.sortDirection ?? 'desc',
      pageNumber: Number(req.query.pageNumber) || 1,
      pageSize: Number(req.query.pageSize) || 10,
    }
    const blogs = await this.queryBlogsRepository.getAllBlogs(blogsQuery)

    res.status(HttpStatusCode.OK_200).send(blogs)
  }
  async getUser(req: Request, res: Response) {
    const foundBlogById = await this.queryBlogsRepository.getBlogById(req.params.blogId)

    if (!foundBlogById) {
      res.sendStatus(HttpStatusCode.NOT_FOUND_404)
      return
    }

    res.status(HttpStatusCode.OK_200).send(foundBlogById)
  }
  async getBlogById(req: RequestParamsQuery<{ blogId: string }, PaginationAndSortQuery<string>>, res: Response) {
    const token = req.headers.authorization?.split(' ')?.[1]
    const userId = token && await jwtService.getUserIdByToken(token)

    const foundBlogById = await this.queryBlogsRepository.getBlogById(req.params.blogId)

    if (!foundBlogById) {
      res.sendStatus(HttpStatusCode.NOT_FOUND_404)
      return
    }

    const query: Required<PaginationAndSortQuery> = {
      sortBy: req.query.sortBy ?? 'createdAt',
      sortDirection: req.query.sortDirection ?? 'desc',
      pageNumber: Number(req.query.pageNumber) || 1,
      pageSize: Number(req.query.pageSize) || 10,
    }

    const foundPostsById = await this.queryPostsRepository.getPosts(query, req.params.blogId, userId)
    res.status(HttpStatusCode.OK_200).send(foundPostsById)
  }
  async createBlog(req: RequestBody<BlogInputModel>, res: Response) {
    const newBlogData: BlogInputModel = {
      name: req.body.name,
      description: req.body.description,
      websiteUrl: req.body.websiteUrl,
    }
    const createdBlogId = await this.blogsService.createBlog(newBlogData)
    const newBlog = await this.queryBlogsRepository.getBlogById(createdBlogId)

    if (!newBlog) {
      res.sendStatus(HttpStatusCode.NOT_FOUND_404)
    }
    res.status(HttpStatusCode.CREATED_201).send(newBlog)
  }
  async createPostForBlog(req: RequestParamsBody<{ blogId: string }, Omit<PostInputModel, 'blogId'>>, res: Response) {
    const createdPostId = await this.blogsService.createPostForBlog({...req.body, blogId: req.params.blogId})

    if (!createdPostId) {
      res.sendStatus(HttpStatusCode.NOT_FOUND_404)

      return
    }

    const newPost = await this.queryPostsRepository.getPostById(createdPostId)
    res.status(HttpStatusCode.CREATED_201).send(newPost)
  }
  async updateBlog(req: RequestParamsBody<{ blogId: string }, BlogInputModel>, res: Response) {
    const isBlogUpdated = await this.blogsService.updateBlog(req.params.blogId, req.body)

    if (!isBlogUpdated) {
      res.sendStatus(HttpStatusCode.NOT_FOUND_404)
      return
    }
    res.sendStatus(HttpStatusCode.NO_CONTENT_204)
  }
  async deleteBlog(req: Request, res: Response) {
    const isDeleted = await this.blogsService.deleteBlog(req.params.blogId)

    if (!isDeleted) {
      res.sendStatus(HttpStatusCode.NOT_FOUND_404)
      return
    }
    res.sendStatus(HttpStatusCode.NO_CONTENT_204)
  }
}
