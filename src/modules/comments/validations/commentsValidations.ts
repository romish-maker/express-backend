import { notEmptyString, stringWithLengthValidation } from '../../common/validations'
import { inputValidationMiddleware } from '../../../app/config/middleware'
import { LikeStatuses } from '../model/enums/LikeStatuses'

const commentValidation = stringWithLengthValidation('content', { max: 300, min: 20 })
const likeInputValidation = notEmptyString('likeStatus').custom(validateLikeInput).withMessage('Not a like status enum')

export const commentInputValidation = () => [ commentValidation, inputValidationMiddleware ]
export const LikeInputValidation = () => [ likeInputValidation, inputValidationMiddleware ]

const validLikeValues = [LikeStatuses.LIKE, LikeStatuses.DISLIKE, LikeStatuses.NONE]
async function validateLikeInput(likeStatus: unknown) {
  const isLikeStatusValid = typeof likeStatus === 'string' && validLikeValues.includes(likeStatus as LikeStatuses)

  if (!isLikeStatusValid) {
    throw new Error(`Invalid like status`)
  }
}
