const db = require('../../config/mysql.config')
const { formatDate, pagination, totalCount, handleSearch, delTableData } = require("../../util")
const UserService = {
    // 用户登录
    login: async ({ user_name, password }) => {
        try {
            const sql = 'SELECT * FROM `users` WHERE `user_name` = ? AND `password` = ?'
            const [results] = await db.query(sql, [user_name, password])
            return results
        } catch (error) {
            console.log(error)
        }
    },
    addUser: async (params) => {
        try {
            const diff = 'SELECT * FROM `users` WHERE `user_name` = ?'
            const [result] = await db.query(diff, [params.user_name])
            if (result.length) {
                return {
                    result: false,
                    message: '用户名重复'
                }
            } else {
                const sql = 'INSERT INTO users SET ?'
                let userData = { ...params }
                const [result] = await db.query(sql, userData)
                let res = {}
                if (result.affectedRows > 0) {
                    res = {
                        result: true,
                        message: '添加成功'
                    }
                } else {
                    res = {
                        result: false,
                        message: '注册失败'
                    }
                }
                return res
            }
        } catch (error) {
            console.log(error)
        }
    },
    // 获取用户列表
    getUserList: async ({ id, page, size, user_name, role_level }) => {
        try {
            const count = await totalCount('users')
            const query = {
                user_name,
                role_level
            }
            const sql = handleSearch('select * from users', query)
            let [result] = await db.query(sql)
            result.forEach(item => {
                delete item.password
                // item.role_level_name = roleList.find(role => item.role_level === role.role_level).role_name
            })
            if (id) {
                result = [result.find(item => item.id === Number(id))]
            }
            let data = pagination(result, Number(page), Number(size))
            return {
                result: true,
                data,
                count
            }
        } catch (error) {
            console.log(error)
        }
    },
    delUser: async ({ id }) => {
        const result = await delTableData('users', id)
        return result
    },
    editUserInfo: async ({ id, user_name, phone, email, merchant_id, merchant_name, sex, role_level, desc, role_name }) => {
        try {
            const updateSql = 'UPDATE users SET ? WHERE id = ?'
            const updateData = {
                user_name,
                phone,
                email,
                sex,
                merchant_id,
                role_level,
                desc,
                merchant_name,
                role_name
            }
            let res = null
            const [results] = await db.query(updateSql, [updateData, id])
            if (results.warningStatus === 0) {
                const sql = 'SELECT * FROM `users` WHERE `id` = ?'
                const [results] = await db.query(sql, [id])
                delete results[0].password
                res = {
                    result: true,
                    message: '修改成功',
                    data: pagination(results, 1, -1)[0]
                }
            } else {
                res = {
                    result: false,
                    message: '服务器错误'
                }
            }
            return res
        } catch (error) {

        }
    },
    updateSelfInfo: async ({ id, user_name, phone, email, password, new_password, sex, avatar }) => {
        try {
            const sql = 'SELECT * FROM `users` WHERE `id` = ?'
            const [results] = await db.query(sql, [id])
            const oldPassword = results[0].password
            if (password !== oldPassword) {
                return { result: false, message: '密码错误，请重新输入！', data: null }
            }
            else {
                const updateSql = 'UPDATE users SET ? WHERE id = ?'
                const updateData = {
                    user_name,
                    phone,
                    email,
                    sex
                }
                if (new_password) {
                    updateData.password = new_password
                }
                if (avatar) {
                    updateData.avatar = avatar
                }
                let res = null
                const [results] = await db.query(updateSql, [updateData, id])
                if (results.warningStatus === 0) {
                    const sql = 'SELECT * FROM `users` WHERE `id` = ?'
                    const [results] = await db.query(sql, [id])
                    delete results[0].password
                    res = {
                        result: true,
                        message: '修改成功',
                        data: pagination(results, 1, -1)[0]
                    }
                } else {
                    res = {
                        result: false,
                        message: '服务器错误'
                    }
                }
                return res
            }
        } catch (error) {
            console.log(error)
        }
    },
    resetPassword: async (id) => {
        try {
            const updateSql = 'UPDATE users SET ? WHERE id = ?'
            const param = {
                password: 123456
            }
            const [result] = await db.query(updateSql, [param, id])
            if (result.warningStatus === 0) {
                return {
                    result: true,
                    message: '重置成功'
                }
            }
        } catch (error) {
            console.log(error)
        }
    },
    getDataCollect: async (params) => {
        try {
            const user_id = params.id
            const userSql = `select * from users where id = ${user_id}`
            const [[userInfo]] = await db.query(userSql)
            const merchantSql = userInfo.area_id ? `select count(*) as total from merchants where address = ${userInfo.area_id}` : 'select count(*) as total from merchants'
            const [merchantTotal] = await db.query(merchantSql)
            const complainSql = userInfo.area_id ? `select * from complain where area_id = ${userInfo.area_id}` : 'select * from complain'
            const [complainList] = await db.query(complainSql)
            return {
                result: true,
                data: {
                    merchant_count: merchantTotal[0].total || 0,
                    complain_count: complainList.length || 0,
                    running_complain: complainList.filter(item => item.status === 'running').length || 0,
                    completed_complain: complainList.filter(item => item.status === 'completed').length || 0
                }
            }
        } catch (error) {
            console.log(error)
            return {
                result: false,
                message: '系统错误'
            }
        }
    }
}

module.exports = UserService