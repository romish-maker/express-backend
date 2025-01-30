import { UserDbModel } from '../../users'
import { add } from 'date-fns'

export function createTestUserInputData() {
  return {
    email: 'myTestEmail@mail.com',
    login: 'myTestLoginAcc',
    password: 'myPass!#123',
  }
}

export function createTestUserFromDb(options: { code?: string, expDate?: Date, isConfirmed?: boolean } = {}): UserDbModel {
  const { code, expDate, isConfirmed } = options
  return {
    userData: {
      email: 'myTestEmail@mail.com',
      login: 'myTestLoginAcc',
      passwordHash: 'passHash!@%#^$^!@%$#^%@!$#^',
    },
    confirmationData: {
      confirmationCode: code ?? '1234-1234-1234-1234',
      confirmationCodeExpirationDate: expDate ?? add(new Date(), { minutes: 5 }),
      isConfirmed: isConfirmed ?? false,
    },
  }
}
