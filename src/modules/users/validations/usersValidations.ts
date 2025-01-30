import { body } from 'express-validator'
import { stringWithLengthValidation } from '../../common/validations'
import { inputValidationMiddleware } from '../../../app/config/middleware'
import { UsersMongooseModel } from '../../../app/config/db'

const loginValidation = stringWithLengthValidation('login', { min: 3, max: 10 })
  .matches(/^[a-zA-Z0-9_-]*$/).withMessage('Login should be latin letters and numbers')
  .custom(uniqueLoginCheck).withMessage('This login is already exists')

const emailValidation = body('email')
  .isString()
  .notEmpty()
  .isEmail().withMessage('Should be a valid email')
  .custom(uniqueEmailCheck).withMessage('This email is already exists')

const passwordValidation = stringWithLengthValidation('password', { min: 6, max: 20 })

export const userInputValidation = () => [
  emailValidation,
  loginValidation,
  passwordValidation,
  inputValidationMiddleware,
]

async function uniqueLoginCheck(login: string) {
  const user = await UsersMongooseModel.findOne({ 'userData.login': login })

  if (user) {
    throw new Error(`This login is already exists`)
  }
}

async function uniqueEmailCheck(email: string) {
  const user = await UsersMongooseModel.findOne({ 'userData.email': email })
  if (user) {
    throw new Error(`This login is already exists`)
  }
}
