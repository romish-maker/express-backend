import mongoose from 'mongoose'
import {
  BlogsMongooseModel,
  PostsMongooseModel,
  CommentsMongooseModel,
  UsersMongooseModel,
  RateLimitMongooseModel,
  AuthSessionsMongooseModel,
  LikesMongooseModel,
} from './mongoose/models'
import 'dotenv/config'
import { AppSettings } from '../../appSettings'

async function runDbMongoose() {
  const uri = AppSettings.MONGO_URI
  const dbName = AppSettings.DB_NAME
  if (!uri || !dbName) {
    throw new Error('!!! MONGODB_URI or DB_NAME not found')
  }

  try {
    await mongoose.connect(uri, { dbName })
    console.log("Pinged your deployment. You successfully connected to mongoose!")
  } catch (err) {
    console.dir('!!! Can\'t connect to mongoose!', err)
    await mongoose.disconnect()
    console.log('Mongoose work is finished successfully')
  }
}

const cleanup = async () => {
  await mongoose.disconnect()
  process.exit()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

export {
  runDbMongoose,
  BlogsMongooseModel,
  PostsMongooseModel,
  CommentsMongooseModel,
  UsersMongooseModel,
  RateLimitMongooseModel,
  AuthSessionsMongooseModel,
  LikesMongooseModel,
}
