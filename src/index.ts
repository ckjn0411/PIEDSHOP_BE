import express from 'express'
import userRouter from './routes/users.routers'
import databaseServices from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middleware'
import mediaRouter from './routes/medias.routers'
import { initFolder } from './utils/file'
import staticRouter from './routes/static.routers'

console.log(new Date(2005, 10, 5).toISOString())

const app = express()

const PORT = 3000
databaseServices.connect()
initFolder()
// cho server chay middlewares chuyen json
app.use(express.json())
// tạo userRoute
// app.get('/', (req, res) => {
//   res.send('Hello world')
// })
// handler
// cho server kết nối userRoute
app.use('/users', userRouter)
app.use('/medias', mediaRouter)
app.use('/static', staticRouter) //serving
// cho server mở port ở 3000
// localhost:3000/users/login req.body {email va password}

// xử lý lỗi tổng
app.use(defaultErrorHandler)
app.listen(PORT, () => {
  console.log('Server BE đang chạy trên PORT: ' + PORT)
})
