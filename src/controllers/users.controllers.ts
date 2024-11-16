import { NextFunction, Request, response, Response } from 'express'
import {
  ChangPasswordReqBody,
  ForgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UpdateMeReqBody,
  VerifyEmailReqQuery,
  VerifyForgotPasswordTokenReqBody
} from '~/models/requests/users.request'
import usersServices from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { UserVerifyStatus } from '~/constants/enums'
import databaseServices from '~/services/database.services'
// controller la handlers co nhiem vu xu ly logic
// cac thong tin khi da vao controller thi phai clean

// registerController nhan vao thong tin dang ky cua nguoi dung
// va vao database de tao user moi luu vao

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body

  //   vao database va nhet vao collection users

  // kiem tra email duoc gui len co ton tai hay khong
  const isDup = await usersServices.checkEmailExist(email)
  if (isDup) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
    })
  }
  const result = await usersServices.register(req.body)
  res.status(HTTP_STATUS.CREATED).json({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  })
}

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response,
  next: NextFunction
) => {
  // can lay email va pw de tim xem user nao dang so huu

  // neu k co thi user nao ngung cuoc choi
  // neu co thi tao at va rf
  const { email, password } = req.body
  const result = await usersServices.login({ email, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  })
}

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  // xem thu user_id trong payload cua refresh_token va access_token co giong khong?
  const { refresh_token } = req.body
  const { user_id: user_id_at } = req.decode_authorization as TokenPayload
  const { user_id: user_id_rf } = req.decode_refresh_token as TokenPayload
  if (user_id_at != user_id_rf) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.UNAUTHORIZED, //401
      message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID
    })
  }
  // neu ma dung roi thi minh xem thu refresh_token nay co duoc quyen dung dich vu khong?
  await usersServices.checkRefreshToken({
    user_id: user_id_at,
    refresh_token
  })
  // khi nao co ma do trong database thi minh tien hanh logout (xoa rf khoi he thong)
  await usersServices.logout(refresh_token)
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.LOGOUT_SUCCESS
  })
}

export const verifyEmailController = async (
  req: Request<ParamsDictionary, any, any, VerifyEmailReqQuery>,
  res: Response,
  next: NextFunction
) => {
  // vao toi controller thi nghia la email_verify_token da duoc xac thuc
  const { email_verify_token } = req.query
  const { user_id } = req.decode_email_verify_token as TokenPayload
  // kiem tra xem user_id va email_verify_token co ton tai trong database hay khong ?
  const user = await usersServices.checkEmailVerifyToken({ user_id, email_verify_token })
  // kiem tra xem nguoi dung co phai unverify khong ?
  if (user.verify == UserVerifyStatus.Verified) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED
    })
  } else if (user.verify == UserVerifyStatus.Banned) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  } else {
    const result = await usersServices.verifyEmail(user_id)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
      result // ac va rf de ngta dang nhap luon
    })
  }
  // tien hanh verifyEmail
}

export const resendEmailVerifyController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response,
  next: NextFunction
) => {
  // lay user_id tim xem user nay con ton tai khong?
  const { user_id } = req.decode_authorization as TokenPayload
  const user = await usersServices.findUserById(user_id)
  // tim xem user co ton tai hay khong
  // tu user do xem thu no da verify bi ban hay la chua verify
  if (user.verify == UserVerifyStatus.Verified) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_VERIFIED
    })
  } else if (user.verify == UserVerifyStatus.Banned) {
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_HAS_BEEN_BANNED
    })
  } else {
    const result = await usersServices.resendEmailVerify(user_id)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_TOKEN_SUCCESS,
      result // ac va rf de ngta dang nhap luon
    })
  }
  // chua verify thi moi resendEmailVerify
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  // nguoi dung cung cap email cho minh
  const { email } = req.body
  // kiem tra xem email co ton tai trong database khong
  // neu co thi minh tao token va minh gui
  const hasEmail = await usersServices.checkEmailExist(email)
  if (!hasEmail) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.NOT_FOUND,
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  } else {
    // co thi minh tao token va minh gui
    await usersServices.forgotPassword(email)
    res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    })
  }
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>,
  res: Response,
  next: NextFunction
) => {
  // fe gui ma forgot_password_token de minh xac minh
  // minh da xac minh forgot_password_token la chuan o middleware
  // gio minh xac minh forgot_password_token con hieu luc voi user_id
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { forgot_password_token } = req.body
  await usersServices.checkForgotPasswordToken({
    user_id, //
    forgot_password_token
  })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESS
  })
}

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response,
  next: NextFunction
) => {
  // fe gui ma forgot_password_token de minh xac minh
  // minh da xac minh forgot_password_token la chuan o middleware
  // gio minh xac minh forgot_password_token con hieu luc voi user_id
  const { user_id } = req.decode_forgot_password_token as TokenPayload
  const { forgot_password_token, password } = req.body
  await usersServices.checkForgotPasswordToken({
    user_id, //
    forgot_password_token
  })
  await usersServices.resetPassword({ user_id, password })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
  })
}

export const getMeController = async (
  req: Request<ParamsDictionary, any, any>, //
  res: Response,
  next: NextFunction
) => {
  // dung user_id tim user va loai bo mot vai thong tin nhay cam truoc
  // khi res cho nguoi dung
  const { user_id } = req.decode_authorization as TokenPayload

  const userInfor = await usersServices.getMe(user_id)

  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    userInfor
  })
}

export const updateMeController = async (
  req: Request<ParamsDictionary, any, UpdateMeReqBody>, //
  res: Response,
  next: NextFunction
) => {
  // nguoi dung truyen len accessToken de minh biet ho la ai
  const { user_id } = req.decode_authorization as TokenPayload
  // Update nhung gi ma ho cung cap o body
  const payload = req.body
  // check verify
  const isVerified = await usersServices.checkEmailVerified(user_id)
  if (!isVerified) {
    throw new ErrorWithStatus({
      status: HTTP_STATUS.FORBIDDEN, // 403
      message: USERS_MESSAGES.USER_NOT_VERIFIED
    })
  }
  // neu da verified thi cap nhat
  const userInfor = await usersServices.updateMe({ user_id, payload })
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.UPDATE_PROFILE_SUCCESS,
    userInfor
  })
}

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangPasswordReqBody>, //
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_authorization as TokenPayload
  const { old_password, password } = req.body
  await usersServices.changePassword({
    user_id,
    old_password,
    password
  })
  // neeus dodoir thanfh coong thi
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
  })
}

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>, //
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decode_refresh_token as TokenPayload
  const { refresh_token } = req.body
  await usersServices.checkRefreshToken({ user_id, refresh_token })
  // neu kiem tra rf con hieu luc thi tien hanh rf token cho nguoi dung
  await usersServices.refreshToken({ user_id, refresh_token })
  // tra cho nguoi dung
  const result = await usersServices.refreshToken({ user_id, refresh_token }) //refreshToken chưa code
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  })
}
