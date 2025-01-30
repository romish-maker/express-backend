import { NextFunction, Request, Response } from 'express'
import { HttpStatusCode } from '../../../modules/common/enums'

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization || !req.headers.authorization.includes('Basic')) {
    res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)

    return
  }

  const authBase64 = req.headers.authorization.split(' ')?.[1]
  const [login, password] = Buffer.from(authBase64, 'base64')?.toString('ascii')?.split(':') || []

  if (login !== 'admin' || password !== 'qwerty') {
    res.sendStatus(HttpStatusCode.UNAUTHORIZED_401)

    return
  }

  next()
}
