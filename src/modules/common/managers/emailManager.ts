import { emailService, mailTemplatesService } from '../services'

export const emailManager = {
  async sendRegistrationEmail(email: string, confirmationCode: string) {
    const emailTemplate = mailTemplatesService.getRegistrationMailTemplate(email, confirmationCode)

    return await emailService.sendEmail(emailTemplate)
  },
  async resendRegistrationEmail(email: string, confirmationCode: string) {
    const emailTemplate = mailTemplatesService.getResendRegistrationMailTemplate(email, confirmationCode)

    return await emailService.sendEmail(emailTemplate)
  },
  async sendPasswordRecoveryEmail(email: string, confirmationCode: string) {
    const emailTemplate = mailTemplatesService.getPasswordRecoveryMailTemplate(email, confirmationCode)

    return await emailService.sendEmail(emailTemplate)
  },
}
