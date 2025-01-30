import { inputValidationMiddleware } from '../../../app/config/middleware'
import { isValidId, stringWithLengthValidation } from '../../common/validations'
import { NextFunction } from 'express'
import { HttpStatusCode } from '../../common/enums'

const nameValidation = stringWithLengthValidation('name', { min: 1, max: 15 })

const descriptionValidation = stringWithLengthValidation('description', { min: 1, max: 500 })

const websiteUrlValidation = stringWithLengthValidation('websiteUrl', { min: 1, max: 100 })
  .isURL().withMessage('Must be a valid URL')

export const blogInputValidation = () => [nameValidation, descriptionValidation, websiteUrlValidation, inputValidationMiddleware]

export function blogIdValidationMW(req: any, res: any, next: NextFunction) {
  if (!isValidId(req.params.blogId)) {
    res.sendStatus(HttpStatusCode.NOT_FOUND_404)

    return
  }

  next()
}
