import { createHash } from 'crypto'
import dotenv from 'dotenv'
// chuan bi ham ma hoa 1 noi dung nao do theo ma sha256
function sha256(content: string) {
  return createHash('sha256').update(content).digest('hex')
}

// viet ham hashPassword
export function hashPassword(password: string) {
  return sha256(password + process.env.PASSWORD_SECRET)
}
