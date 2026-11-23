const UserService = require('./UserService')
const fs = require('fs')
const path = require('path');
const { formatDate, pagination, handleSearch, totalCount, delTableData } = require("../../util")
const db = require('../../config/mysql.config')

const MerchantService = {
    addMerchant: async (merchantDatas)=>{
        try {
            // 插入merchants表sql语句
            const sql = 'INSERT INTO merchants SET ?'
            const areaSql = 'select * from area'
            const [areaList] = await db.query(areaSql)
            merchantDatas.forEach(item => {
                item.address_cn = areaList.find(i => i.id === item.address).area_name
            })
            let bol = true
            // 多条数据处理
            let result
            await merchantDatas.forEach(async (company) => {
                // 插入数据
                [result] = await db.query(sql, company)
                console.log(result)
                bol = bol && result && result.affectedRows > 0
            })
            if (bol) {
                result = {
                    result: true,
                    message: '添加成功'
                }
            }
            return result
        } catch (error) {
            console.log(error, 'error')
        }
    },
    // 获取企业数据
    getMerchantData: async (params) => {
        try {
            const count = await totalCount('merchants')
            const page = Number(params.page)
            const size = Number(params.size)
            delete params.page
            delete params.size
            Object.keys(params).forEach(key => {
                params[key] = `%${params[key]}%`
            })
            const sql = handleSearch('SELECT * FROM merchants', params)
            const [result] = await db.query(sql)
            const data = pagination(result, page, size)
            return {
                result: true,
                data,
                count
            }
        } catch (error) {
            console.log(error)
            return {
                result: false,
                message: '系统异常'
            }
        }
    },
    updateMerchant: async(id, params)=>{
        try {
            const sql = `UPDATE merchants SET ? WHERE id = ${id}`
            const [result] = await db.query(sql, [params])
            if(result.warningStatus === 0) {
                return {
                    result: true,
                    message: '修改成功'
                }
            } else {
                return{
                    result: false
                }
            }
        } catch (error) {
            console.log(error)
        }
    },
    
    delMerchant: async ({id})=>{
        const result = await delTableData('merchants', id)
        return result
    },

    // 获取区域函数
    getRegion:async ({province, city, district})=>{
        try {
            let sql = 'SELECT code, name FROM region WHERE province = ? AND city = ? AND district = ?'
            let arr = [0, 0, 0]
            if (!province) {
                sql = 'SELECT code, name FROM region WHERE town = ? AND city = ? AND district = ?'
            } else if (province && !city) {
                sql = 'SELECT code, name FROM region WHERE province = ? AND city LIKE ? AND city != 0 AND district = ?'
                arr = [province, '%', 0]
            }else if (province && city && !district) {
                sql = 'SELECT code, name FROM region WHERE province = ? AND city = ? AND district != 0 AND district LIKE ? AND town = 0'
                arr = [province, city, '%']
            }else if (province && city && district) {
                sql = 'SELECT code, name FROM region WHERE province = ? AND city = ? AND district = ? AND town like ? AND town != 0 '
                arr = [province, city, district, '%']
            }
            const [result] = await db.query(sql, arr)
            return {
                result: true,
                code: 200,
                data: result
            }
        } catch (error) {
            console.log(error)
            return {
                result: false,
                message: '查询错误'
            }
        }
    },
    getModelFile: async (res) => {
        const filePath = path.join(__dirname, '../../public/images/model.xlsx'); // 替换为您的文件路径

        // 检查文件是否存在
        if (fs.existsSync(filePath)) {
            // res.setHeader('Content-Disposition', 'attachment; filename="导入模板.xlsx"'); // 替换为您的文件名和扩展名
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

            // 创建文件可读流
            const fileStream = fs.createReadStream(filePath)
            fileStream.pipe(res)
        } else {
            res.status(404).send('File not found');
        }
    },
    // 区域接口
    getAreaList: async (params) => {
        try {
            const sql = 'select * from area'
            const [result] = await db.query(sql)
            const data = pagination(result, params.page, params.size)
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
    },
    addArea: async (params) => {
        try {
            // 插入merchants表sql语句
            const sql = 'INSERT INTO area SET ?'
            const [result] = await db.query(sql, params)
            if (result.affectedRows > 0) {
                return {
                    result: true,
                    message: '添加成功'
                }
            }
        } catch (error) {
            return {
                result: false,
                message: '系统错误'
            }
        }
    },
    editArea: async (params) => {
        try {
            const sql = `update area set ? where id = ${params.id}`
            delete params.id
            const [result] = await db.query(sql, params)
            if (result.affectedRows > 0) {
                return {
                    result: true,
                    message: '添加成功'
                }
            }
        } catch (error) {
            return {
                result: false,
                message: '系统错误'
            }
        }
    },
    deleteArea: async (id)=>{
        const result = await delTableData('area', id)
        return result
    }
}

module.exports = MerchantService