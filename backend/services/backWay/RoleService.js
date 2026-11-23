const db = require('../../config/mysql.config')
const { formatDate, pagination, totalCount, delTableData, handleSearch } = require("../../util")

const RoleService = {
    getRoleList: async ({page, size, role_level, id}) => {
        try {
            // const sql = role_level ? 'SELECT * FROM roles where role_level=' + role_level  : 'SELECT * FROM roles'
            const sql = handleSearch('SELECT * FROM roles', {role_level, id}, 'roles')
            const count = await totalCount('roles')
            const [result] = await db.query(sql)
            const data = pagination(result, Number(page), Number(size))
            return {
                result: true,
                data,
                count
            }
        } catch (error) {
            console.log(error)
        }
    },
    addRole: async (params) => {
        try {
            // sql 语句
            const sql = 'INSERT INTO roles SET ?'
            // 添加创建时间字段
            params.create_time = formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
            const [roleResult] = await db.query(sql, [params])
            // affectedRows的意思为影响到的表行数，大于0则表示新增成功
            if (roleResult.affectedRows > 0) {
                return {
                    result: true,
                    code: 200
                }
            } else {
                return {
                    result: false
                }
            }
        } catch (error) {
            console.log(error)
        }
    },
    editRole: async (params) => {
        try {
            // 获取需要修改的id
            const role_id = params.id
            delete params.id
            // sql语句
            const sql = `UPDATE roles SET ? WHERE id = ${role_id}`
            // 进行修改
            const [results] = await db.query(sql, [params])
            // warningStatus主要来查看是否有异常情况，为0则表示没有任何异常，可以正常返回
            console.log(results)
            if(results.warningStatus === 0) {
                res = {
                    result: true,
                    message: '修改成功'
                }
            } else {
                res = {
                    result: false
                }
            }
            return res
        } catch (error) {
            console.log(error)
        }
    },
    delRole: async ({id}) => {
        try {
            // 删除仅需要唯一id，获取添加到sql语句中即可
            const result = await delTableData('roles', id)
            return result
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = RoleService