// viet ham validate nhan vao checkSchema
// va tra ra middleware xu ly loi

import { ValidationChain, validationResult } from 'express-validator'
import { RunnableValidationChains } from 'express-validator/lib/middlewares/schema'
import { Request, Response, NextFunction } from 'express'
import { EntityError, ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req) // run thi moi chep loi vao req
    const errors = validationResult(req) // lay danh sach loi tu req ra
    if (errors.isEmpty()) {
      return next()
    } else {
      const errorsObject = errors.mapped() // danh sách các lỗi dạng object
      const entityError = new EntityError({ errors: {} }) // đây là object lỗi mà mình muốn thay thế
      for (const key in errorsObject) {
        // lấy msg trong từng trường dữ liệu của errorObject ra
        const { msg } = errorsObject[key]
        // nêý nsg có dạng ErrorWithStatus và có Status khác 422 thì mình next(arr) nó ra trước
        if (msg instanceof ErrorWithStatus && msg.status != HTTP_STATUS.UNPROCESSABLE_ENTITY) {
          return next(msg)
        }
        // nếu không phải dạng đặc biệt thì mình bỏ vào entityError
        entityError.errors[key] = msg
      }
      next(entityError)
    }
  }
}
