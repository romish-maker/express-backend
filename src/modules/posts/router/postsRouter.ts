import { Router } from 'express'
import { authMiddleware, jwtAuthMiddleware, sortingAndPaginationMiddleware } from '../../../app/config/middleware'
import {
  commentInputValidation,
  LikeInputValidation,
  postIdValidationMW,
  postInputValidation
} from '../validations/postsValidations'
import { postsController } from '../composition-root/postsCompositionRoot'

export const postsRouter = Router()

postsRouter.get('/', postsController.getPosts.bind(postsController))
postsRouter.get('/:postId', postIdValidationMW, postsController.getPostById.bind(postsController))
postsRouter.get(
  '/:postId/comments',
  postIdValidationMW,
  sortingAndPaginationMiddleware(),
  postsController.getPostComments.bind(postsController),
)
postsRouter.post('/', authMiddleware, postInputValidation(),  postsController.createPost.bind(postsController))
postsRouter.post(
  '/:postId/comments',
  postIdValidationMW,
  jwtAuthMiddleware,
  commentInputValidation(),
  postsController.createCommentToPost.bind(postsController),
)
postsRouter.put('/:postId', authMiddleware, postIdValidationMW, postInputValidation(),  postsController.updatePost.bind(postsController))
postsRouter.put('/:postId/like-status', jwtAuthMiddleware, postIdValidationMW, LikeInputValidation(),  postsController.updatePostLikeStatus.bind(postsController))
postsRouter.delete('/:postId', authMiddleware, postIdValidationMW, postsController.deletePost.bind(postsController))
