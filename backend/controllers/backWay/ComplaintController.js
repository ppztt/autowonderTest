const ComplaintService = require("../../services/backWay/ComplaintService")
const { formatDate } = require('../../util/index.js')

const ComplaintController = {
    add: async (req,res)=>{
        const file = req.file ? `/productuploads/${req.body.user_id}${req.body.user_name}${req.file.filename}` : ""
        const params = {
            user_id: req.body.user_id,
            company_id: req.body.company_id,
            desc: req.body.desc,
            name: req.body.title,
            status: 'handle',
            complaint_type: req.body.type,
            file,
            create_time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
        }
        //调用 service进行添加
        const result =  await ComplaintService.add(params)
        res.send({
            ...result
        })
    },
    auditComplaint: async (req,res) => {
        //调用 service进行添加
        try {
            const result = await ComplaintService.auditComplaint(req.body)
            if (result?.result) {
                res.send(result)
            } else {
                res.status(500).send(result)
            }
        } catch (error) {
            console.log(error)
            res.status(500).send({result: false, message: '系统错误'})
        }
    },
    getList: async (req,res)=>{
        req.query.order_num && (req.query.order_num = `%${req.query.order_num}%`)
        const result = await ComplaintService.getList(req.query)
        res.send({
            ...result
        })
    },
    getTypeList: async (req, res) => {
        const result = await ComplaintService.getTypeList(req.query)
        res.send({
            ...result
        })
    },

    delList:async (req,res)=>{
        const result = await ComplaintService.delList({id: Number(req.params.id)})
        res.send({
            ...result
        })
    },
    addComplainType: async (req, res) => {
        try {
            const result = await ComplaintService.addComplainType(req.body)
            res.send(result)
        } catch (error) {
            console.log(error)
        }
    },
    editComplainType: async (req, res) => {
        try {
            console.log(req, req.body)
            const result = await ComplaintService.editComplainType({id: req.params.id, ...req.body})
            res.send(result)
        } catch (error) {
            console.log(error)
        }
    },
    delComplainType: async (req, res) => {
        try {
            const result = await ComplaintService.delComplainType(req.params.id)
            res.send(result)
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = ComplaintController