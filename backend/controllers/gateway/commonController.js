const CommonService = require('../../services/gateway/commonService')
const JWT = require('../../util/JWT')

const CommonController = {
    gatewayLogin: async (req, res) => {
        console.log(123)
        try {
            const result = await CommonService.gatewayLogin(req.body)
            if (result.length === 0) {
                res.send({
                    result: false,
                    message: '用户名或密码不匹配'
                })
            } else {
                const token = JWT.generate({
                    _id: result[0]._id,
                    username: result[0].username,
                }, "1d")
                res.header('Authorization', token)
                delete result[0].password
                res.send({
                    code: 200,
                    result: true,
                    data: {
                        ...result[0]
                    }
                })
            }
        } catch (error) {
            console.log(error)
        }
    },
    gatewayRegister: async (req, res) => {
        try {
            const result = await CommonService.gatewayRegister(req.body)
            if (result.result) {
                res.send(result)
            } else {
                res.status(500).send(result)
            }
        } catch (error) {
            console.log(error)
        }
    },
    postComplain: async (req, res) => {
        try {
            const result = await CommonService.postComplain(req.body)
            if (result.result) {
                res.send(result)
            } else {
                res.status(500).send(result)
            }
        } catch (error) {
            console.log(error)
        }
    },
    getComplainList: async (req, res) => {
        try {
            const result = await CommonService.getComplainList({id: req.query.id})
            if (result.result) {
                res.send(result)
            } else {
                res.status(500).send(result)
            }
        } catch (error) {
            console.log(error)
        }
    }
}
module.exports = CommonController