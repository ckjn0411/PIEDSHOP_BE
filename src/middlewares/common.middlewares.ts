import { pick } from 'lodash'
import { Request, Response, NextFunction } from 'express'

// ham mode lai request body theo mang cac key minh muon
export const filterMiddleware = <T>(filterKeys: Array<keyof T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, filterKeys)
    next()
  }
}
