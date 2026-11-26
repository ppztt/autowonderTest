const ContentController = require('../../controllers/backWay/ContentController')
const express = require('express')
const multer = require('multer')
const path = require('path')
var ContentRouter = express.Router()

// 资讯插图上传：仅允许图片类型，单文件 <= 5MB，落盘保留扩展名
const ALLOWED_IMAGE_MIME = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp'
}
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 使用绝对路径，避免受进程启动目录影响
        cb(null, path.join(__dirname, '../../public/newsuploads'))
    },
    filename: (req, file, cb) => {
        const ext = ALLOWED_IMAGE_MIME[file.mimetype] || '.png'
        cb(null, `article_${Date.now()}_${Math.floor(Math.random() * 1e9)}${ext}`)
    }
})
const imageUpload = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_IMAGE_MIME[file.mimetype]) {
            cb(null, true)
        } else {
            const err = new Error('INVALID_IMAGE_TYPE')
            err.code = 'INVALID_IMAGE_TYPE'
            cb(err)
        }
    }
})

// 上传中间件把 multer 错误统一转成 JSON，避免返回 HTML 错误页
const uploadImageMiddleware = (req, res, next) => {
    imageUpload.single('file')(req, res, (err) => {
        if (!err) return next()
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).send({ result: false, message: '图片大小不能超过 5MB' })
        }
        if (err.code === 'INVALID_IMAGE_TYPE' || err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).send({ result: false, message: '仅支持 jpg/jpeg/png/gif/webp 格式的图片' })
        }
        console.log(err)
        return res.status(500).send({ result: false, message: '图片上传失败' })
    })
}

ContentRouter.get('/manage/article/get_article_list/', ContentController.getContentList)
ContentRouter.post('/manage/article/add_article/', ContentController.addContent)
ContentRouter.put('/manage/article/edit_article/:id', ContentController.editContent)
ContentRouter.delete('/manage/article/del_article/:id', ContentController.delContent)
// 需要 token：走 app.js 全局鉴权，不加入白名单
ContentRouter.post('/manage/article/upload_image', uploadImageMiddleware, ContentController.uploadImage)
module.exports = ContentRouter
