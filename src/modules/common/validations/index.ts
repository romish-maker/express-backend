import { body } from 'express-validator'
import { ObjectId } from 'mongodb'
import { NextFunction } from 'express'
import { HttpStatusCode } from '../enums'

export const stringWithLengthValidation = (field: string, options: { max: number, min: number }) => {
  const { min, max } = options

  return body(field)
    .isString().withMessage('Must be string').trim()
    .isLength({min, max}).withMessage(`Not more than ${max} symbols, not less that ${min}`)
}

export const notEmptyString = (field: string, message?: string) => {
  return body(field)
    .isString()
    .trim()
    .notEmpty()
    .withMessage(message ?? 'Should not be an empty string')
}

export const isValidId = (id: string) => ObjectId.isValid(id)

export function entityIdValidationMW(req: any, res: any, next: NextFunction) {
  if (!isValidId(req.params.postId)) {
    res.sendStatus(HttpStatusCode.NOT_FOUND_404)

    return
  }

  next()
}
