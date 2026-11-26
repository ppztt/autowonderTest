const ContentService = require('../../services/backWay/ContentService.js')

const ContentController = {
    getContentList: async (req, res) => {
        const result = await ContentService.getContentList(req.query)
        res.send({
            ...result
        })
    },
    addContent: async (req, res) => {
        const result = await ContentService.addContent(req.body)
        res.send({
            ...result
        })
    },
    editContent: async (req, res) => {
        const result = await ContentService.editContent({id: req.params.id, ...req.body})
        res.send({
            ...result
        })
    },
    delContent: async (req, res) => {
        const result = await ContentService.delContent({id: req.params.id})
        res.send({
            ...result
        })
    },
    // 资讯插图上传：成功返回后端相对路径，前端再拼 /api 前缀
    uploadImage: (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).send({
                    result: false,
                    message: '请选择要上传的图片'
                })
            }
            res.send({
                result: true,
                code: 200,
                data: {
                    url: `/newsuploads/${req.file.filename}`
                }
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                result: false,
                message: '图片上传失败'
            })
        }
    },
    getComplainType: async (req, res) => {
        const result = await ContentService.getComplainType()
        res.send({
            ...result
        })
    }
}

module.exports = ContentController