import { BlogsMappers } from '../model/mappers/BlogsMappers'
import { QueryBlogsRepository } from '../model/repositories/QueryBlogsRepository'
import { CommandBlogsRepository } from '../model/repositories/CommandBlogsRepository'
import { BlogsService } from '../model/services/BlogsService'
import { BlogsController } from '../model/controllers/BlogsController'
import { queryPostsRepository } from '../../posts'

const blogsMappers = new BlogsMappers()

export const queryBlogsRepository = new QueryBlogsRepository(blogsMappers)
const commandBlogsRepository = new CommandBlogsRepository()

const blogsService = new BlogsService(queryBlogsRepository, commandBlogsRepository)

export const blogsController = new BlogsController(blogsService, queryBlogsRepository, queryPostsRepository)
