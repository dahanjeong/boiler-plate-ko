const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const jwt = require('jsonwebtoken')


const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5,
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: {
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})

// 비밀번호 암호화        
userSchema.pre('save', function(next) {
    let user = this
    
    if(user.isModified('password')) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if(err) return next(err)
    
            bcrypt.hash(user.password, salt, (err, hash) => {
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

// 비밀번호 일치 확인
userSchema.methods.comparePassword = function(plain, cb) {
    bcrypt.compare(plain, this.password, (err, isMatch) => {
        if(err) return cb(err)
        cb(null, isMatch)
    })
}

// Token 생성
userSchema.methods.generateToken = function(cb) {
    let user = this

    let token = jwt.sign(user._id.toHexString(), '1234')
    user.token = token
    user.save((err, user) => {
        if(err) return cb(err)
        cb(null, user)
    })        
}

// 인증
userSchema.statics.findByToken = (token, cb) => {
    // Token Decoding
    jwt.verify(token, '1234', (err, decoded) => {
        // 사용자 확인
        User.findOne({ "_id" : decoded, "token": token }, (err, user) => {
            if(err) return cb(err)
            cb(null, user)
        })
    })
}

const User = mongoose.model('User', userSchema)

module.exports = { User }