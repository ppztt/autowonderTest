const db = require('../../config/mysql.config')
const { formatDate, pagination, totalCount, delTableData, handleSearch } = require("../../util")

const ContentService = {
    getContentList: async (params) => {
        try {
            // 使用%% 模糊搜索
            const page = params.page
            const size = params.size
            delete params.page
            delete params.size
            params.title && (params.title = `%${params.title}%`)
            const sql = handleSearch('SELECT * FROM knowledge', params)
            let [result] = await db.query(sql)
            let data = pagination(result, Number(page), Number(size))
            const count = await totalCount('knowledge')
            return {
                result: true,
                data,
                count
            }
        } catch (error) {
            console.log(error)
        }
    },
    addContent: async (params) => {
        try {
            // sql 语句
            const sql = 'INSERT INTO knowledge SET ?'
            const typeSql = 'select * from complaint_type'
            const [typeList] = await db.query(typeSql)
            // 按 complaint_type 回填中文类型名（修复历史笔误 complain_type 导致的 undefined.type_name 异常）
            const matchedType = typeList.find(item => Number(item.id) === Number(params.complaint_type))
            if (matchedType) {
                params.complaint_type_cn = matchedType.type_name
            }
            const [result] = await db.query(sql, [params])
            // affectedRows的意思为影响到的表行数，大于0则表示新增成功
            if (result.affectedRows > 0) {
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
    editContent: async (params) => {
        try {
            // 获取需要修改的id
            const content_id = params.id
            delete params.id
            // sql语句
            const sql = `UPDATE knowledge SET ? WHERE id = ${content_id}`
            // 进行修改
            const [results] = await db.query(sql, [params])
            // warningStatus主要来查看是否有异常情况，为0则表示没有任何异常，可以正常返回
            if(results.warningStatus === 0) {
                res = {
                    result: true,
                    message: '修改成功'
                }
            } else {
                res = {
                    result: false,
                    message: '系统错误'
                }
            }
            return res
        } catch (error) {
            console.log(error)
            return {
                result: false,
                message: '系统错误'
            }
        }
    },
    delContent: async ({id}) => {
        try {
            // 删除仅需要唯一id，获取添加到sql语句中即可
            const result = await delTableData('knowledge', id)
            return result
        } catch (error) {
            console.log(error)
        }
    },
    getComplainType: async () => {
        try {
            const sql = 'select * from complaint_type'
            const [result] = await db.query(sql)
            return {
                result: true,
                data: result
            }
        } catch(e) {

        }
    }
}

module.exports = ContentService