import path from 'path'
import fs from 'fs' // 1 module chua cac method xu ly file
import { Request } from 'express'
import formidable, { File } from 'formidable'
import { UPLOAD_IMAGE_TEMP_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir'

export const initFolder = () => {
  //   truy vet duong link nay xem co den duoc thu muc nao khong?
  //   neu ma tim khong duoc thi tao cai moi
  ;[UPLOAD_VIDEO_DIR, UPLOAD_IMAGE_TEMP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true //cho phep tao long cac thu muc
      })
    }
  })
}

// tao ham handleUploadSingleImage
// ham nay nhan vao req, ep req di qua luoi loc formidable
// sau đó, chỉ lây file image và return ra ngoài các file lưu được
export const handleUploadImage = async (req: Request) => {
  // chuẩn bị lưới lọc
  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: 4, // max la 1 file
    maxFileSize: 300 * 1024, // toi da la 300kb 1 file
    maxTotalFileSize: 300 * 1024 * 4,
    keepExtensions: true, // giu lai duoi cua file
    filter: ({ name, originalFilename, mimetype }) => {
      // name là tên của field đang chứa file
      // originalFilename: tên gốc ban đầu của file
      // mimetype: kiểu của file được up lên 'video/mp4' 'video/mkv'  image/png
      const valid = name == 'image' && Boolean(mimetype?.includes('image'))
      // người dùng có gửi lên mimetype không, nếu có thì kiếm tra xem có chứa 'image' không?
      // nếu người dùng có gửi lên mimetype -> true thì ép kiểu vẫn là true
      // nếu người dugnf không gửi lên -> null thì ép kiểu thành false
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid ') as any)
      }
      return valid
    }
  })
  // mình xài cái túi lọc trên
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!files.image) return reject(new Error('Image is empty'))
      return resolve(files.image as File[])
    })
  })
}

export const handleUploadVideo = async (req: Request) => {
  // chuẩn bị lưới lọc
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 1, // max la 1 file
    maxFileSize: 50 * 1024 * 1024, // toi da la 50mb 1 file
    keepExtensions: true, // giu lai duoi cua file
    filter: ({ name, originalFilename, mimetype }) => {
      // name là tên của field đang chứa file
      // originalFilename: tên gốc ban đầu của file
      // mimetype: kiểu của file được up lên 'video/mp4' 'video/mkv'  image/png
      const valid = name == 'video' && Boolean(mimetype?.includes('video'))
      // người dùng có gửi lên mimetype không, nếu có thì kiếm tra xem có chứa 'video' không?
      // nếu người dùng có gửi lên mimetype -> true thì ép kiểu vẫn là true
      // nếu người dugnf không gửi lên -> null thì ép kiểu thành false
      if (!valid) {
        form.emit('error' as any, new Error('File type is not valid ') as any)
      }
      return valid
    }
  })
  // mình xài cái túi lọc trên
  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err)
      if (!files.video) return reject(new Error('Video is empty'))
      return resolve(files.video as File[])
    })
  })
}

// getNameFromFullnameFile: ham nhan vao full ten anh.sang.png ---> anh-sang
// tra ra asd
export const getNameFromFullnameFile = (filename: string) => {
  const nameArr = filename.split('.')
  nameArr.pop()
  return nameArr.join('-')
}
