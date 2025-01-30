import { NextFunction, Request, Response } from 'express'
import { HttpStatusCode } from '../../../modules/common/enums'
import { RateLimitModel } from '../../../modules/auth'
import { RateLimitMongooseModel } from '../db'

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const currentTime = new Date();
  const rateLimitData: RateLimitModel = {
    ip: req.ip ?? 'no_ip',
    url: req.originalUrl,
    date: currentTime,
  }
  await RateLimitMongooseModel.create(rateLimitData)

  // Calculate the timestamp for the start of the last 10 seconds
  const tenSecondsAgo = new Date(currentTime.getTime() - 10 * 1000);

  const urlSessions = await RateLimitMongooseModel.find({
    ip: rateLimitData.ip,
    url: rateLimitData.url,
    date: { $gte: tenSecondsAgo },
  })
  const urlCount = urlSessions.length

  if (urlCount > 5) {
    return res.sendStatus(HttpStatusCode.TOO_MANY_REQUESTS_429)
  }

  return next()
}
