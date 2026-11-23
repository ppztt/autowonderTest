

# init

```
npm install -g express

npm install -g express-generator

express -e 项目名称
```



# 1.后端服务创建思路

```
由routes下分文件夹处理不同请求
再到controller中去处理数据，调用service层
最后由service层调用数据库，增删改查后返回结果
利用jsonwebtoken包去生成token
```



# 2.创建Model模型，基于mongoose

```js
const mongoose = require('mongoose')
// 限制mongoose的字段
const Schema = mongoose.Schema
// users模型--> user的集合
const UserType = {
    username: String,
    password: String,
    gender: Number, // 0 男 1 女
    introduction: String,
    avater: String,
    role: Number // 1管理员 2编辑
}
const UserModel = mongoose.model('user', new Schema(UserType))

module.exports = UserModel

```

# 3.处理请求（在controller中处理）

```js
const UserService = require('../../services/admin/UserService')


const UserController = {
    login: async (req, res)=>{
        const result = await UserService.login(req.body)
        if(result.length == 0){
            res.send({
                code: '-1',
                error: '用户名密码不匹配'
            })
        }else{
            res.send({
                ActionType: 'ok'
            })
        }
    }
}

module.exports = UserController
```



# 4.链接数据库

```js
const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/company-system')
```

# 5.登录流程

1. 前端注册，后端在数据库中保存用户名与密码；
2. 登录时，后端根据前端传递的信息在数据库中查询是否存在，密码是否正确，成功通过之后创建用户token，放置在Authoization返回给前端保存，后端设置一个中间件，在调用接口前验证token，登录接口和注册接口除外，正确了之后返回新的token，过期返回401交给前端处理

# 6.修改用户信息

```js
// UserRouter.js
UserRouter.post('/admin/user/updateUserInfo',upload.single('file'), UserController.updateUserInfo)
// UserController.js
updateUserInfo: async (req, res) => {
        const token = req.headers['authorization'].split(" ")[1];
        let avatar = req.file ? `/avataruploads/${req.file.filename}` : ""
        let userInfo = { _id: JWT.verify(token)._id, ...req.body, gender: Number(req.body.gender), avatar }
        await UserService.updateUserInfo(userInfo)
        if (avatar) {
            res.send({
                code: 200,
                data: {
                    ...req.body, gender: Number(req.body.gender),
                    avatar
                }
            })
        } else {
            res.send({
                code: 200,
                data: {
                    ...req.body, gender: Number(req.body.gender),
                }
            })
        }
    },
// UserService.js
    updateUserInfo: async ({ _id, username, introduction, gender, avatar }) => {
        if (avatar) {
            return UserModel.updateOne({ _id }, { username, introduction, gender, avatar })
        } else {
            return UserModel.updateOne({ _id }, { username, introduction, gende })
        }
    },
```

# 7.新增用户

```js
// UserService.js    
	addUserInfo: async ({ username, password, role, gender, introduction, avatar }) => {
        return UserModel.create({
            username, password, role: Number(role), gender: Number(gender), introduction, avatar
        })
    }
```

# 9.查询信息

```js
// UserService.js
getList: async () => {
        return UserModel.find({}, ["username", "role", "avatar", "introduction", "gender"])
}
```

# 10.删除用户

```js
// UserRouter.js
UserRouter.delete("/admin/user/list/:id",UserController.delUser)
// UserController.js
delUser: async (req, res) =>{
    await UserService.delUser({_id: req.params.id})
     res.send({
         code: 200,
     })
}
// UserService.js
delUser: async ({_id})=>{
    return UserModel.deleteOne({_id})
}
```

