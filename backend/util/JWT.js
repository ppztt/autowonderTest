// 生成token，验证token的方法
const JsonWebToken = require('jsonwebtoken')
const secret = 'ttwl'
const JWT = {
    generate(value, exprires) {
        return JsonWebToken.sign(value, secret, { expiresIn: exprires })
    },
    verify(token) {
        // 发生错误会直接报错，得捕获一下
        try {
            return JsonWebToken.verify(token, secret)
        } catch (error) {
            return false
        }
    }
}

module.exports = JWT