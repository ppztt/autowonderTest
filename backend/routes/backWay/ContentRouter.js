const ContentController = require('../../controllers/backWay/ContentController')
const express = require('express')
var ContentRouter = express.Router()

ContentRouter.get('/manage/article/get_article_list/', ContentController.getContentList)
ContentRouter.post('/manage/article/add_article/', ContentController.addContent)
ContentRouter.put('/manage/article/edit_article/:id', ContentController.editContent)
ContentRouter.delete('/manage/article/del_article/:id', ContentController.delContent)
module.exports = ContentRouter