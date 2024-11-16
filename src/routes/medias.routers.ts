import { Router } from 'express'
import { uploadImageController, uploadVideoController } from '~/controllers/medias.controllers'
import { wrapAsync } from '~/utils/handles'
const mediaRouter = Router()

// route giup nguoi dung upload mo hinh
mediaRouter.post('/upload-img', wrapAsync(uploadImageController))
mediaRouter.post('/upload-video', wrapAsync(uploadVideoController))
export default mediaRouter
