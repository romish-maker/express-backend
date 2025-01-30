import express from 'express'
import cookieParser from 'cookie-parser'
import { app } from '../../app'

export function initAppMiddleware() {
  const parseBodyMiddleware = express.json()
  const cookieParserMiddleware = cookieParser()

  app.use(parseBodyMiddleware)
  app.use(cookieParserMiddleware)
}
