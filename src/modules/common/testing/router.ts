import { Router } from 'express'
import { HttpStatusCode } from '../enums'
import {
  AuthSessionsMongooseModel,
  BlogsMongooseModel,
  CommentsMongooseModel,
  LikesMongooseModel,
  PostsMongooseModel,
  RateLimitMongooseModel,
  UsersMongooseModel,
} from '../../../app/config/db'

export const testingRouter = Router()

testingRouter.delete('/all-data', async (req, res) => {
  await BlogsMongooseModel.deleteMany({})
  await PostsMongooseModel.deleteMany({})
  await UsersMongooseModel.deleteMany({})
  await AuthSessionsMongooseModel.deleteMany({})
  await CommentsMongooseModel.deleteMany({})
  await RateLimitMongooseModel.deleteMany({})
  await LikesMongooseModel.deleteMany({})

  res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})
