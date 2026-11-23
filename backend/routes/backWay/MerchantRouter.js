var express = require('express');
const MerchantController = require('../../controllers/backWay/MerchantController');
var MerchantRouter = express.Router();

// const multer  = require('multer')
// const upload = multer({ dest: 'public/newsuploads/' })

//涉及文件上传, 普通post不行, 需要加上 multer中间件
MerchantRouter.get("/manage/vendor/get_vendor_list/", MerchantController.getMerchant)
MerchantRouter.post("/manage/vendor/add_vendor/", MerchantController.addMerchant)
MerchantRouter.get("/manage/vendor/region", MerchantController.getRegion)
MerchantRouter.post("/manage/vendor/model_file", MerchantController.getModelFile)
MerchantRouter.delete("/manage/vendor/del_vendor/:id",MerchantController.delMerchant)
MerchantRouter.put("/manage/vendor/edit_vendor/:id",MerchantController.updateMerchant)
// 区域接口
MerchantRouter.get('/manage/vendor/get_area_list/', MerchantController.getAreaList)
MerchantRouter.post('/manage/vendor/add_area/', MerchantController.addArea)
MerchantRouter.put('/manage/vendor/edit_area/', MerchantController.editArea)
MerchantRouter.delete('/manage/vendor/delete_area/:id', MerchantController.deleteArea)

module.exports = MerchantRouter