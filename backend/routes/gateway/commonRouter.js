var express = require('express');

const CommonController = require('../../controllers/gateway/commonController.js')
var CommonRouter = express.Router();
const multer  = require('multer')
const upload = multer({ dest: 'public/avataruploads/' })
/* GET home page. */
CommonRouter.post('/portal/member/login', CommonController.gatewayLogin)
CommonRouter.post('/portal/member/register', CommonController.gatewayRegister)
CommonRouter.post('/portal/ticket/add_ticket', CommonController.postComplain)
CommonRouter.get('/portal/ticket/get_ticket_list', CommonController.getComplainList)
// CommonRouter.post('/portal/member/add_member/',upload.single('file'), CommonController.addUser)
// CommonRouter.post('/manage/member/update_self/:id',upload.single('file'), CommonController.updateSelfInfo)

module.exports = CommonRouter
