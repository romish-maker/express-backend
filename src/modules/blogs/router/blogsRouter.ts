import { Router } from 'express'
import { authMiddleware } from '../../../app/config/middleware'
import { blogIdValidationMW, blogInputValidation } from '../validations/blogsValidations'
import { postForBlogsInputValidation } from '../../posts'
import { blogsController } from '../composition-root/blogsCompostitionRoot'

export const blogsRouter = Router()

blogsRouter.get('/', blogsController.getUsers.bind(blogsController))
blogsRouter.get('/:blogId', blogIdValidationMW, blogsController.getUser.bind(blogsController))
blogsRouter.get('/:blogId/posts', blogIdValidationMW, blogsController.getBlogById.bind(blogsController))
blogsRouter.post('/', authMiddleware, blogInputValidation(), blogsController.createBlog.bind(blogsController))
blogsRouter.post('/:blogId/posts', authMiddleware, blogIdValidationMW, postForBlogsInputValidation(), blogsController.createPostForBlog.bind(blogsController))
blogsRouter.put('/:blogId', authMiddleware, blogIdValidationMW, blogInputValidation(), blogsController.updateBlog.bind(blogsController))
blogsRouter.delete('/:blogId', authMiddleware, blogIdValidationMW, blogsController.deleteBlog.bind(blogsController))
