var express = require('express');

const UserController = require('../../controllers/backWay/UserController')
var UserRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/avataruploads/' })
/* GET home page. */
UserRouter.post('/manage/member/login', UserController.login)
// 新增用户
UserRouter.post('/manage/member/add_member/',upload.single('file'), UserController.addUser)
UserRouter.get("/manage/member/get_member_list",UserController.getUserList)
UserRouter.get("/manage/member/list/:id",UserController.getUserList)
UserRouter.delete("/manage/member/del_member/:id",UserController.delUser)
UserRouter.post('/manage/member/edit_member/:id', UserController.editUserInfo)
UserRouter.post('/manage/member/update_self/:id',upload.single('file'), UserController.updateSelfInfo)
UserRouter.post('/manage/member/reset_password/:id', UserController.resetPassword)
// 数据中心
UserRouter.get('/manage/member/get_data_collect', UserController.getDataCollect)

module.exports = UserRouter;
