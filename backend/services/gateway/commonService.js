const db = require('../../config/mysql.config')
const { createordernum, pagination } = require('../../util')
const statusMap = {
    running: '进行中',
    completed: '已完成'
}
const commonService = {
    gatewayLogin: async ({ user_name, password }) => {
        try {
            const sql = 'SELECT * FROM `gateway_users` WHERE `user_name` = ? AND `password` = ?'
            const [results] = await db.query(sql, [user_name, password])
            return results
        } catch (error) {
            console.log(error)
        }
    },
    gatewayRegister: async ({ user_name, password, phone, email }) => {
        try {
            const diff = 'SELECT * FROM `gateway_users` WHERE `user_name` = ?'
            const [result] = await db.query(diff, [user_name])
            if (result.length) {
                return {
                    result: false,
                    message: '用户名重复'
                }
            } else {
                const sql = 'INSERT INTO gateway_users SET ?'
                let userData = { user_name, password, phone, email }
                const [result] = await db.query(sql, userData)
                if (result.affectedRows > 0 && result.warningStatus === 0) {
                    return {
                        result: true,
                        message: '注册成功'
                    }
                } else {
                    return {
                        result: false,
                        message: '注册失败'
                    }
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
    // 发起工单
    postComplain: async (params) => {
        try {
            const sql = 'INSERT INTO complain SET ?'
            const orderSql = 'select * from complain where order_num = ?'
            let order_num = createordernum()
            let [orderResult] = await db.query(orderSql, [order_num])
            while (orderResult.length > 0) {
                order_num = createordernum()
                [orderResult] = await db.query(orderSql, [order_num])
            }
            const [result] = await db.query(sql, [{ ...params, order_num, status: 'running', status_cn: '进行中' }])
            if (result.affectedRows > 0 && result.warningStatus === 0) {
                return {
                    result: true,
                    message: '添加成功'
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
    getComplainList: async ({ id, page, size }) => {
        try {
            const sql = 'select * from complain where user_id = ?'
            const [result] = await db.query(sql, [id])
            const data = pagination(result, page, size)
            return {
                result: true,
                data,
                count: result.length
            }
        } catch (error) {
            return {
                result: false,
                message: '系统错误'
            }
        }
    }
}
module.exports = commonService