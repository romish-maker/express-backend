import { commentsRouter } from './router/commentsRouter'
import { commentsQueryRepository } from './model/repositories/commentsQueryRepository'
import { commentsMappers } from './model/mappers/commentsMappers'
import { LikeStatuses } from './model/enums/LikeStatuses'

import type { CommentDbModel } from './model/types/CommentDbModel'
import type { LikesDbModel } from './model/types/LikesDbModel'
import type { LikeInputModel } from './model/types/LikeInputModel'

export {
  commentsRouter,
  commentsQueryRepository,
  commentsMappers,
  LikeStatuses,
}

export type {
  CommentDbModel,
  LikesDbModel,
  LikeInputModel,
}
