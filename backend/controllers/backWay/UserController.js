const UserService = require('../../services/backWay/UserService')
const JWT = require('../../util/JWT')

const UserController = {
    // 登录接口
    login: async (req, res) => {
        try {
            const result = await UserService.login(req.body)
            if(result.length === 0) {
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
                console.log(res)
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
        }
    },
    addUser: async (req, res) => {
        const { role_level } = req.body
        const avatar = req.file ? `/avataruploads/${req.file.filename}` : ""
        const result = await UserService.addUser({ ...req.body, password: 123456, role_level: Number(role_level) })
        res.send({
            ...result
        })
    },
    getUserList: async (req, res) => {
        const result = await UserService.getUserList(req.query)
        res.send({
            ...result
        })
    },
    delUser: async (req, res) =>{
        const result = await UserService.delUser(req.params)
        res.send({
            ...result
        })
    },
    editUserInfo: async (req, res) =>{
        const result = await UserService.editUserInfo({...req.body, id: req.params.id, sex: Number(req.body.sex || 0)})
        res.send({
            ...result
        })
    },
    updateSelfInfo: async (req, res) => {
        let avatar = req.file ? `/avataruploads/${req.file.filename}` : ""
        const result = await UserService.updateSelfInfo({...req.body, id: req.params.id, sex: Number(req.body.sex || 0), avatar})
        res.send({
            ...result
        })
    },
    resetPassword: async(req, res) => {
        const result = await UserService.resetPassword(req.query.id)
        res.send({
            ...result
        })
    },
    // 数据中心
    getDataCollect: async (req, res) => {
        try {
            const result = await UserService.getDataCollect(req.query)
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

module.exports = UserController