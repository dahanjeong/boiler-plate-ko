const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const config = require('./config/key')
const { auth } = require('./middleware/auth')
const { User } = require('./models/User')

// application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
// application/json
app.use(bodyParser.json())
app.use(cookieParser())

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
})
.then(() => console.log('MongoDB connected.'))
.catch((err) => console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/api/hello', (req, res) => {
  res.send('Hello Client.')
})

app.post('/api/users/register', (req, res) => {
  // 회원가입 정보를 DB에 저장
  const user = new User(req.body) 
  
  user.save((err, userInfo) => {    
    if(err) return res.json({ success: false, err })
    return res.status(200).json({ success: true })
  })
})

app.post('/api/users/login', (req, res) => {
  // DB에 있는지 확인
  User.findOne({ email: req.body.email }, (err, user) => {
    if(!user) return res.json({ loginSucess: false, message: "Not exist user."})
    
    // 비밀번호 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch) return res.json({ loginSucess: false, message: "Password is wrong."})
      
      // Token 생성
      user.generateToken((err, user) => {
        if(err) return res.status(400).send(err)

        // Token을 Cookie에 저장
        res.cookie("x_auth", user.token).status(200).json({ loginSucess: true, userId: user._id })
      })
    })
    
  })
})

app.get('/api/users/auth', auth, (req, res) => {
   res.status(200).json({
     _id: req.user._id,
     isAdmin: req.user.role === 0 ? false : true,
     isAuth: true,
     email: req.user.email,
     name: req.user.name,
     lastname: req.user.lastname,
     role: req.user.role,
     image: req.user.image
   })
})

app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
    if(err) return res.json({ success: false, err })
    return res.status(200).send({ success: true })
  })
})


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})