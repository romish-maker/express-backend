import mongoose from 'mongoose'
import { WithId } from 'mongodb'
import { BlogDbModel } from '../../../../modules/blogs'
import { PostDbModel } from '../../../../modules/posts'
import { CommentDbModel, LikesDbModel } from '../../../../modules/comments'
import { CommentatorInfoModel } from '../../../../modules/comments/model/types/CommentatorInfoModel'
import { ConfirmationInfoModel, UserDataModel, UserDbModel } from '../../../../modules/users'
import { AuthSessionsDbModel, RateLimitModel } from '../../../../modules/auth'

const CommentatorSchema = new mongoose.Schema<WithId<CommentatorInfoModel>>({
  userId: { type: String, required: true },
  userLogin: { type: String, required: true },
})
const UserDataSchema = new mongoose.Schema<WithId<UserDataModel>>({
  login: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date },
})
const ConfirmationInfoSchema = new mongoose.Schema<WithId<ConfirmationInfoModel>>({
  confirmationCode: { type: String, required: true },
  confirmationCodeExpirationDate: { type: Date, required: true },
  isConfirmed: { type: Boolean, required: true },
  passwordRecoveryCode: { type: String },
  passwordRecoveryCodeExpirationDate: { type: Date },
  isPasswordRecoveryConfirmed: { type: Boolean },
})

export const MongooseSchemas = {
  BlogsSchema: new mongoose.Schema<WithId<BlogDbModel>>({
    name: { type: String, required: true },
    description: { type: String, required: true },
    websiteUrl: { type: String, required: true },
    createdAt: { type: Date },
    isMembership: { type: Boolean },
  }),
  PostsSchema: new mongoose.Schema<WithId<PostDbModel>>({
    title: { type: String, required: true },
    shortDescription: { type: String, required: true },
    content: { type: String, required: true },
    blogName: { type: String, required: true },
    blogId: { type: String, required: true },
    createdAt: { type: Date },
    likesCount: { type: Number, required: true },
    dislikesCount: { type: Number, required: true },
  }),
  CommentsSchema: new mongoose.Schema<WithId<CommentDbModel>>({
    postId: { type: String, required: true },
    content: { type: String, required: true },
    commentatorInfo: CommentatorSchema,
    createdAt: { type: String, required: true },
    likesCount: { type: Number, required: true },
    dislikesCount: { type: Number, required: true },
  }),
  UsersSchema: new mongoose.Schema<WithId<UserDbModel>>({
    userData: UserDataSchema,
    confirmationData: ConfirmationInfoSchema,
  }),
  RateLimitSchema: new mongoose.Schema<WithId<RateLimitModel>>({
    ip: { type: String, required: true },
    url: { type: String, required: true },
    date: { type: Date, required: true },
  }),
  AuthSessionsSchema: new mongoose.Schema<WithId<AuthSessionsDbModel>>({
    ip: { type: String, required: true },
    deviceId: { type: String, required: true },
    deviceName: { type: String, required: true },
    userId: { type: String, required: true },
    iat: { type: Number },
    exp: { type: Number },
  }),
  LikesCommentsSchema: new mongoose.Schema<WithId<LikesDbModel>>({
    userId: { type: String, required: true },
    userLogin: { type: String, required: true },
    parentId: { type: String, required: true },
    status: { type: String, required: true },
    createdAt: { type: Date, required: true },
  })
}
