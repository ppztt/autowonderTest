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
    getComplainType: async (req, res) => {
        const result = await ContentService.getComplainType()
        res.send({
            ...result
        })
    }
}

module.exports = ContentController