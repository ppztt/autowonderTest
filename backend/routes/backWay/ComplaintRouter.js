var express = require('express');
const ComplaintController = require('../../controllers/backWay/ComplaintController');
var ComplaintRouter = express.Router();

const multer  = require('multer')
const upload = multer({ dest: 'public/complaintuploads/' })

//涉及文件上传, 普通post不行, 需要加上 multer中间件
ComplaintRouter.post("/manage/ticket/add",upload.single("file"),ComplaintController.add)
ComplaintRouter.get("/manage/ticket/get_ticket_list/",ComplaintController.getList)
ComplaintRouter.get("/manage/ticket/get_ticket_type/",ComplaintController.getTypeList)
ComplaintRouter.post("/manage/ticket/audit_ticket/", ComplaintController.auditComplaint)
ComplaintRouter.delete("/manage/ticket/del_ticket_list/:id",ComplaintController.delList)
// 工单类型
ComplaintRouter.post('/manage/ticket/add_ticket_type/', ComplaintController.addComplainType)
ComplaintRouter.put('/manage/ticket/edit_ticket_type/:id', ComplaintController.editComplainType)
ComplaintRouter.delete("/manage/ticket/del_ticket_type/:id",ComplaintController.delComplainType)

module.exports = ComplaintRouter