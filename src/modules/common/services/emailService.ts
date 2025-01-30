import nodemailer from 'nodemailer'
import { AppSettings } from '../../../app/appSettings'
import { MailOptions } from 'nodemailer/lib/sendmail-transport'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: AppSettings.SEND_MAIL_SERVICE_EMAIL,
    pass: AppSettings.SEND_MAIL_SERVICE_PASSWORD,
  }
})

export const emailService = {
  async sendEmail(emailTemplate: MailOptions) {
    const info = await transporter.sendMail(emailTemplate)

    return info
  }
}


