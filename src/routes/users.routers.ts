import express from 'express'
import {
  changePasswordController,
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  refreshTokenController,
  registerController,
  resendEmailVerifyController,
  resetPasswordController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  changePasswordValidator,
  forgotPasswordTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifyEmailTokenValidator
} from '~/middlewares/users.middlewares'
import { wrapAsync } from '~/utils/handles'
import { Request, Response } from 'express'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import { UpdateMeReqBody } from '~/models/requests/users.request'

const userRouter = express.Router()
// cho userRoute thêm 1 middleware
// middleware là 1 handler, nhưng đặc biệt là nó nằm ở giữa chứ k phải ở cuối
/* 
desc: login
path: users/login
method: post
body: {
  email: string,
  password: string
}
*/
userRouter.post('/login', loginValidator, wrapAsync(loginController))

// chuc nang dang ky
// register
/*
    desc: Register a new user
    path: /register
    method: post
    body: {
        email: string, 
        name: string,
        password: string,
        confirm_password: string
        date_of_birth: string nhung co dang ISO8601

    }
 */
userRouter.post(
  '/register',
  registerValidator,
  wrapAsync(registerController)
  //   (req, res, next) => {
  //     console.log('RQ1')
  //     // call server va server database rot mang, nen dan den bug
  //     // throw new Error('RQ1 rot mang')
  //     // next(new Error('RQ1 rot mang')) // next(error)

  //     // neu trong ham async ma van muon throw
  //     // try {
  //     //   throw new Error('RQ1 rot mang')
  //     // } catch (error) {
  //     //   next(error)
  //     // }

  //   },
  //   (req, res, next) => {
  //     console.log('RQ2')
  //     next()
  //   },
  //   (req, res, next) => {
  //     console.log('RQ3')
  //     res.json({ message: 'successfully' })
  //   },
)

/*
  desc: logout
  path: users/logout
  method: post
  header: {
    Authorization: 'Bearer <access_token>'
  }
  body: {
    refresh_token: 
  }
*/
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

/*
  desc: verify-email: khi nguoi dung vao email va bam vao link de verify email
                        ho se gui email_verify_token len cho minh thong qua query vi co dau ?
  method: get
  path: users/verify-email/?email_verify_token=string
*/
userRouter.get('/verify-email/', verifyEmailTokenValidator, wrapAsync(verifyEmailController))

/*
  decs: Resend Email Verifiy
  path: users/resend-email-verify
  chuc nang nay can dang nhap de su dung
  method: post
  headers: {
    authorization: 'Bearer <access_token>'
  }
*/
userRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendEmailVerifyController))

/*
  desc: forgot-password: khi ma minh bi quen mat khau thi minh se khong dang nhap duoc
                          thu duy nhat ma ta co the cung cap la email
  path: users/forgot-password
  method: post
  body: {
    email: string
  }
 */
userRouter.post('/forgot-password', forgotPasswordValidator, wrapAsync(forgotPasswordController))

/*
  desc: verify forgot password token to reset password
  kiem tra xem forgot password token con dung' va con hieu luc khong?
  path: /verify-forgot-password
  method: post
  body: {
    forgot_password_token: string
  }
*/

userRouter.post('/verify-forgot-password', forgotPasswordTokenValidator, wrapAsync(verifyForgotPasswordTokenController))

/*
  desc: reset password
  method: post
  path: users/reset-password
  body: {
    password: string,
    confirm_password: string,
    forgot_password_token: string
  }
*/
userRouter.post(
  '/reset-password',
  forgotPasswordTokenValidator, // kiem tra forgot_password_token
  resetPasswordValidator, // kiem tra password, confirm_password va forgot_password
  wrapAsync(resetPasswordController)
)

/*
  desc: get my profile
  path: users/me
  method: post
  header: {
    authorization: "Bearer <access_token>"
  }
*/

userRouter.post('/me', accessTokenValidator, wrapAsync(getMeController))

/*
des: update profile của user
path: '/me'
method: patch
Header: {Authorization: Bearer <access_token>}
body: {
  name?: string
  date_of_birth?: Date
  bio?: string // optional
  location?: string // optional
  website?: string // optional
  username?: string // optional
  avatar?: string // optional
  cover_photo?: string // optional}
*/

userRouter.patch(
  '/me', //
  // minh can 1 ham san loc request body o day
  filterMiddleware<UpdateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'avatar',
    'username',
    'cover_photo'
  ]),
  accessTokenValidator,
  updateMeValidator,
  wrapAsync(updateMeController)
)

/*
  desc: change-password
  path: users/change-password
  method: put
  headers:{
    Authorization: 'Bearer <access_token>'
  }
  body: {
    old_password: string,
    password: string,
    confirm_password: string
  }
*/
userRouter.put('/change-password', accessTokenValidator, changePasswordValidator, wrapAsync(changePasswordController))

/*  chuc nang nay dung khi ac het han, can lay ac moi (qua tang kem la rf moi)
  desc: refresh-token
  path: users/refresh-token
  method: post
  body: {
    refresh_token: string

  }
*/
userRouter.post(
  '/refresh-token', //
  refreshTokenValidator,
  wrapAsync(refreshTokenController)
)
export default userRouter
