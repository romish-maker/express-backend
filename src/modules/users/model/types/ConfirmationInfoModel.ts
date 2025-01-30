export type ConfirmationInfoModel = {
  confirmationCode: string
  confirmationCodeExpirationDate: Date
  isConfirmed: boolean
  passwordRecoveryCode?: string
  passwordRecoveryCodeExpirationDate?: Date
  isPasswordRecoveryConfirmed?: boolean
}
