import express, { Router } from 'express'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { serveImageController, serveVideoController } from '~/controllers/static.controllers'
const staticRouter = Router()

// staticRouter.use('/image', express.static(UPLOAD_IMAGE_DIR))

staticRouter.get('/image/:filename', serveImageController)

staticRouter.get('/video/:filename', serveVideoController)

export default staticRouter
