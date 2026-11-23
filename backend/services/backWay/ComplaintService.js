const db = require('../../config/mysql.config')
const { formatDate, createordernum, pagination, handleSearch, totalCount, delTableData } = require("../../util")

const ComplaintService = {
    add: async (params) => {
        try {
            const sql = 'insert into complaint_form set ?'
            const order_num = createordernum()
            const data = {
                ...params,
                order_num
            }
            const [result] = db.query(sql, [data])
            if (result.affectedRows > 0) {
                return {
                    result: true,
                    message: '添加成功'
                }
            } else {
                return {
                    result: false,
                    message: '添加失败'
                }
            }
        } catch (error) {

        }
    },

    auditComplaint: async (params) => {
        try {
            const sql = 'UPDATE complain SET ? WHERE id = ?'
            const updateData = {
                result: params.result,
                status: 'completed',
                status_cn: '已完成',
                auditor: params.auditor,
                auditor_cn: params.auditor_cn
            }
            const [result] = await db.query(sql, [updateData, params.id])
            if (result.affectedRows > 0 && result.warningStatus === 0) {
                return {
                    result: true,
                    message: '处理成功'
                }
            } else {
                return {
                    result: false,
                    message: '系统错误'
                }
            }
        } catch (error) {
            console.log(error)
            return {
                result: false,
                message: '系统错误'
            }
        }
    },

    getList: async (params) => {
        try {
            const page = params.page
            const size = params.size
            delete params.page
            delete params.size
            const count = await totalCount('complain')
            const sql = handleSearch('select * from complain', params) +' ORDER BY create_time DESC'
            const [result] = await db.query(sql)
            const data = pagination(result, Number(page), Number(size))
            return {
                result: true,
                data,
                count
            }
        } catch (error) {
            console.log(error)
            return {
                result: false,
                message: '系统错误'
            }
        }
    },
    getTypeList: async (params) => {
        try {
            const page = params.page
            const size = params.size
            const sql = 'SELECT * FROM complaint_type'
            let [result] = await db.query(sql)
            const count = result.length
            const data = pagination(result, Number(page), Number(size))
            return {
                result: true,
                data,
                count
            }
        } catch (error) {
            console.log(error)
            return {
                result: false,
                message: '系统错误'
            }
        }
    },
    delList: async ({ id }) => {
        try {
            const result = await delTableData('complaint_form', id)
            return result
        } catch (error) {
            console.log(error)
        }
    },
    addComplainType: async (params) => {
        try {
            const sql = 'insert into complaint_type set ?'
            const searchSql = 'select * from complaint_type where type_name = ?'
            const [searchResult] = await db.query(searchSql, [params.type_name])
            if (searchResult.length > 0) {
                return {
                    result: false,
                    message: '类型名重复'
                }
            } else {
                const [result] = await db.query(sql, [params])
                if (result.affectedRows > 0 && result.warningStatus === 0) {
                    return {
                        result: true,
                        message: '添加成功'
                    }
                }
            }
        } catch (error) {
            console.log(error)
        }
    },
    editComplainType: async (params) => {
        try {
            const sql = 'UPDATE complaint_type SET ? WHERE id = ?'
            const updateData = {
                ...params
            }
            delete updateData.id
            const [result] = await db.query(sql, [updateData, params.id])
            if (result.affectedRows > 0 && result.warningStatus === 0) {
                return {
                    result: true,
                    message: '编辑成功'
                }
            }
        } catch (error) {
            console.log(error)
            return {
                result: false,
                message: '系统错误'
            }
        }
    },
    delComplainType: async ({ id }) => {
        try {
            const result = await delTableData('complaint_type', id)
            return result
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = ComplaintService