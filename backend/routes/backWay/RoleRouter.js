const RoleController = require('../../controllers/backWay/RoleController')
const express = require('express')
var RoleRouter = express.Router()

RoleRouter.get('/manage/group/get_list/', RoleController.getRoleList)
RoleRouter.post('/manage/group/add_group/', RoleController.addRole)
RoleRouter.put('/manage/group/edit_group/:id', RoleController.editRole)
RoleRouter.delete('/manage/group/del_group/:id', RoleController.delRole)
module.exports = RoleRouter