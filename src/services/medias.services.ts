import { Request } from 'express'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameFromFullnameFile, handleUploadImage, handleUploadVideo } from '~/utils/file'
import fs from 'fs'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/Other'
class MediasServices {
  async handleUploadImage(req: Request) {
    const files = await handleUploadImage(req) // lay file trong req
    const result = await Promise.all(
      files.map(async (file) => {
        // do lai ten cua file
        const newFilename = getNameFromFullnameFile(file.newFilename) + '.jpg'
        const newPath = UPLOAD_IMAGE_DIR + '/' + newFilename
        const infor = await sharp(file.filepath).jpeg().toFile(newPath)
        // xoa buc hinh trong thu muc tam
        fs.unlinkSync(file.filepath)
        const urlImage: Media = {
          url: `http://localhost:3000/static/image/${newFilename}`,
          type: MediaType.Image
        }
        return urlImage
      })
    )
    return result
  }

  async handleUploadVideo(req: Request) {
    const files = await handleUploadVideo(req) // lay file trong req
    const result = await Promise.all(
      files.map(async (file) => {
        const urlVideo: Media = {
          url: `http://localhost:3000/static/video/${file.newFilename}`,
          type: MediaType.Video
        }
        return urlVideo
      })
    )
    return result
  }
}

const mediasServices = new MediasServices()
export default mediasServices
