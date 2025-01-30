import { CommandPostsRepository } from '../model/repositories/CommandPostsRepository'
import { PostsService } from '../model/services/PostsService'
import { usersQueryRepository } from '../../users'
import { PostsController } from '../model/controllers/PostsController'
import { PostsMappers } from '../model/mappers/PostsMappers'
import { QueryPostsRepository } from '../model/repositories/QueryPostsRepository'

const postsMappers = new PostsMappers()

export const queryPostsRepository = new QueryPostsRepository(postsMappers)
const commandPostsRepository = new CommandPostsRepository()

const postsService = new PostsService(queryPostsRepository, commandPostsRepository, usersQueryRepository)

export const postsController = new PostsController(postsService, queryPostsRepository)
