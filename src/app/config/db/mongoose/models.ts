import mongoose from 'mongoose'
import { BlogDbModel } from '../../../../modules/blogs'
import { WithId } from 'mongodb'
import { Collections } from '../config'
import { MongooseSchemas } from './schemas'
import { PostDbModel } from '../../../../modules/posts'
import { CommentDbModel, LikesDbModel } from '../../../../modules/comments'
import { UserDbModel } from '../../../../modules/users'
import { AuthSessionsDbModel, RateLimitModel } from '../../../../modules/auth'

export const BlogsMongooseModel = mongoose.model<WithId<BlogDbModel>>(Collections.BLOGS, MongooseSchemas.BlogsSchema)
export const PostsMongooseModel = mongoose.model<WithId<PostDbModel>>(Collections.POSTS, MongooseSchemas.PostsSchema)
export const CommentsMongooseModel = mongoose.model<WithId<CommentDbModel>>(Collections.COMMENTS, MongooseSchemas.CommentsSchema)
export const UsersMongooseModel = mongoose.model<WithId<UserDbModel>>(Collections.USERS, MongooseSchemas.UsersSchema)
export const RateLimitMongooseModel = mongoose.model<WithId<RateLimitModel>>(Collections.RATE_LIMIT, MongooseSchemas.RateLimitSchema)
export const AuthSessionsMongooseModel = mongoose.model<WithId<AuthSessionsDbModel>>(Collections.SESSIONS, MongooseSchemas.AuthSessionsSchema)
export const LikesMongooseModel = mongoose.model<WithId<LikesDbModel>>(Collections.LIKES, MongooseSchemas.LikesCommentsSchema)
