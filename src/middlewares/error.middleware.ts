// file định nghĩa làm handler tổng
// nơi tạo ra các lỗi từ hệ thống sẽ đổ về đây
import { Request, Response, NextFunction } from 'express'
import { omit } from 'lodash'
import HTTP_STATUS from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Errors'

// lỗi từ validate đổ về sẽ có mã 422 mình có thể tận dụng
//      đôi khi trong validate có lỗi đặc biệt có dạng ErrorWithStatus
// lỗi từ controller có thể là lỗi do mình ErrorWStatus
//      lỗi rớt mạng thì k có status
export const defaultErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  //  loi cua toan bo he thong se do ve day
  if (error instanceof ErrorWithStatus) {
    res.status(error.status).json(omit(error, ['status']))
  } else {
    // loi khac ErrorWithStatus, nghia la loi bth, loi k co status
    // loi co tum lum thu stack, name, k co status
    Object.getOwnPropertyNames(error).forEach((key) => {
      Object.defineProperty(error, key, {
        enumerable: true
      })
    })
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      message: error.message,
      errorInfor: omit(error, ['stack'])
    })
  }
}
