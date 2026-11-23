const RoleService = require('../../services/backWay/RoleService.js')

const RoleController = {
    getRoleList: async (req, res) => {
        const result = await RoleService.getRoleList(req.query)
        res.send({
            ...result
        })
    },
    addRole: async (req, res) => {
        const result = await RoleService.addRole(req.body)
        res.send({
            ...result
        })
    },
    editRole: async (req, res) => {
        const result = await RoleService.editRole({id: req.params.id, ...req.body})
        res.send({
            ...result
        })
    },
    delRole: async (req, res) => {
        const result = await RoleService.delRole({id: req.params.id})
        res.send({
            ...result
        })
    }
}

module.exports = RoleController