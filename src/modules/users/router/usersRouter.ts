import { Response, Router } from 'express'
import { RequestBody, RequestQuery } from '../../common/types'
import { UsersQueryModel } from '../model/types/UsersQueryModel'
import { usersQueryRepository } from '../model/repositories/usersQueryRepository'
import { authMiddleware } from '../../../app/config/middleware'
import { UserInputModel } from '../model/types/UserInputModel'
import { usersService } from '../model/services/usersService'
import { HttpStatusCode } from '../../common/enums'
import { userInputValidation } from '../validations/usersValidations'

export const usersRouter = Router()

usersRouter.get('/', authMiddleware, async (req: RequestQuery<UsersQueryModel>, res) => {
  const foundUsers = await usersQueryRepository.getUsers(req.query)

  res.status(HttpStatusCode.OK_200).send(foundUsers)
})

usersRouter.get('/:userId', authMiddleware, async (req, res) => {
  const foundUser = await usersQueryRepository.getUserById(req.params.userId)

  if (!foundUser) {
    return res.sendStatus(HttpStatusCode.NOT_FOUND_404)
  }

  return res.status(HttpStatusCode.OK_200).send(foundUser)
})

usersRouter.post('/', authMiddleware, userInputValidation(), async (req: RequestBody<UserInputModel>, res: Response) => {
  const createdUserId = await usersService.createUser(req.body)

  const newUser = await usersQueryRepository.getUserById(createdUserId)

  if (!newUser) {
    return res.sendStatus(HttpStatusCode.NOT_FOUND_404)
  }

  return res.status(HttpStatusCode.CREATED_201).send(newUser)
})

usersRouter.delete('/:userId', authMiddleware, async (req, res) => {
  const isDeleted = await usersService.deleteUser(req.params.userId)

  if (!isDeleted) {
    return res.sendStatus(HttpStatusCode.NOT_FOUND_404)
  }

  return res.sendStatus(HttpStatusCode.NO_CONTENT_204)
})
