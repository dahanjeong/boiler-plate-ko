const { User } = require('../models/User')

// 인증 처리
let auth = (req, res, next) => {
    // Cookie에서 Token 확인
    let token = req.cookies.x_auth    

    // Token 복호화 및 사용자 확인
    User.findByToken(token, (err, user) => {
        if(err) throw err
        if(!user) return res.json({ isAuth: false, error: true })

        // index.js에서 사용할 수 있도록 설정
        req.token = token
        req.user = user
        next()
    })    
}

module.exports = { auth }