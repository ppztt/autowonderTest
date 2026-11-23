const MerchantService = require("../../services/backWay/MerchantService")


const MerchantController = {
    getMerchant: async (req, res) => {
        const result = await MerchantService.getMerchantData(req.query)
        res.send({
            ...result
        })
    },
    addMerchant: async (req, res) => {
        const result = await MerchantService.addMerchant(req.body)
        res.send({
            ...result
        })
    },
    updateMerchant: async (req, res) => {
        try {
            const result = await MerchantService.updateMerchant(req.params.id, req.body)
            res.send({
                ...result
            })
        } catch (error) {
            console.log(error)
            res.status(500).send({
                result: false,
                message: '系统错误'
            })
        }
    },

    delMerchant: async (req, res) => {
        const result = await MerchantService.delMerchant({ id: req.params.id })
        res.send({
            ...result
        })
    },
    getRegion: async (req, res) => {
        const result = await MerchantService.getRegion({ province: req.query.province, city: req.query.city, district: req.query.district })
        res.send({
            ...result
        })
    },
    publish: async (req, res) => {
        await MerchantService.publish({
            ...req.body,
            editTime: new Date()
        })
        res.send({
            ActionType: "OK",
        })
    },
    getModelFile: async (req, res) => {
        await MerchantService.getModelFile(res)
        // file.pipe(res)
    },
    // 区域接口
    getAreaList: async (req, res) => {
        try {
            const result = await MerchantService.getAreaList(req.query)
            if (result.result) {
                res.send(result)
            } else {
                res.status(500).send(result)
            }
        } catch (error) {
            res.status(500).send({
                message: '系统错误'
            })
        }
    },
    addArea: async (req, res) => {
        try {
            const result = await MerchantService.addArea(req.body)
            if (result.result) {
                res.send(result)
            } else {
                res.status(500).send(result)
            }
        } catch (error) {
            res.status(500).send({
                message: '系统错误'
            })
        }
    },
    editArea: async (req, res) => {
        try {
            const result = await MerchantService.editArea({ id: req.params.id, ...req.body })
            if (result.result) {
                res.send(result)
            } else {
                res.status(500).send(result)
            }
        } catch (error) {
            res.status(500).send({
                message: '系统错误'
            })
        }
    },
    deleteArea: async (req, res) => {
        try {
            const result = await MerchantService.deleteArea(req.params.id)
            if (result.result) {
                res.send(result)
            } else {
                res.status(500).send(result)
            }
        } catch (error) {
            res.status(500).send({
                message: '系统错误'
            })
        }
    }
}

module.exports = MerchantController