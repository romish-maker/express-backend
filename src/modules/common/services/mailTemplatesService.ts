export const mailTemplatesService = {
  getRegistrationMailTemplate(userEmail: string, confirmationCode: string) {
    return {
      from: '"Romish Kuvatov" <romiskuvatov@gmail.com>',
      to: userEmail,
      subject: 'Verify your registration on "Romish backend"',
      html: `<h1>Thanks for your registration on "Romish Backend"</h1>
             <p>To finish registration please follow the link:
                 <a href='https://google.com?code=${confirmationCode}'>complete registration</a>
             </p>`,
    };
  },
  getResendRegistrationMailTemplate(userEmail: string, confirmationCode: string) {
    return {
      from: '"Romish Kuvatov" <romiskuvatov@gmail.com>',
      to: userEmail,
      subject: 'We resend your registration email for "Romish backend"',
      html: `<h1>We resend your email confirmation on "Romish Backend"</h1>
             <p>To finish registration please follow the link:
                 <a href='https://google.com?code=${confirmationCode}'>complete registration</a>
             </p>`,
    };
  },
  getPasswordRecoveryMailTemplate(userEmail: string, confirmationCode: string) {
    return {
      from: '"Romish Kuvatov" <romiskuvatov@gmail.com>',
      to: userEmail,
      subject: 'Password recovery for "Romish backend"',
      html: `<h1>Recovery your password on "Blogs inc. JoyMe"</h1>
             <p>To finish password recovery please follow the link:
                 <a href='https://google.com/password-recovery?recoveryCode=${confirmationCode}'>complete registration</a>
             </p>
             <p>
                If you have not registreted at "Blogs inc. JoyMe" just ignore this message
             </p>
`,
    };
  },
}
