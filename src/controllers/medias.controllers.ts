import { Request, Response, NextFunction } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import mediasServices from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response, next: NextFunction) => {
  // __dirname: duong dan den folder chua file nay
  //   path.resolve('uploads'): la duong dan ma minh mong muon luu file vao
  // setup tam luoi' chan
  const urlImage = await mediasServices.handleUploadImage(req)
  res.status(HTTP_STATUS.OK).json({
    message: 'Upload file successfully',
    urlImage
  })
}

export const uploadVideoController = async (req: Request, res: Response, next: NextFunction) => {
  // __dirname: duong dan den folder chua file nay
  //   path.resolve('uploads'): la duong dan ma minh mong muon luu file vao
  // setup tam luoi' chan
  const urlVideo = await mediasServices.handleUploadVideo(req)
  res.status(HTTP_STATUS.OK).json({
    message: 'Upload file successfully',
    urlVideo
  })
}
