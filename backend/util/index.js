const db = require('../config/mysql.config')

/**
 * 格式化日期
 * @param {Date} date 
 * @param {string} format 
 * @returns {string} 格式化后的日期
 * 
 */
function formatDate(date, format) {
    let time = new Date()
    if (!date) return ''
    if (typeof date === 'string') {
        time = new Date(date.replace(/-/g, '/').replace(/T|Z/g, ' ').trim())
    } else if (typeof date === 'object') {
        time = new Date(date)
    }
    const o = {
        'M+': time.getMonth() + 1, // 月份
        'd+': time.getDate(), // 日
        'h+': time.getHours(), // 小时
        'm+': time.getMinutes(), // 分
        's+': time.getSeconds(), // 秒
        'q+': Math.floor((time.getMonth() + 3) / 3), // 季度
        'S': time.getMilliseconds() // 毫秒
    }
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1, (time.getFullYear() + '').substr(4 - RegExp.$1.length))
    for (const k in o) {
        if (new RegExp('(' + k + ')').test(format)) format = format.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
    return format
  }
  function setTimeDateFmt(s) {  // 个位数补齐十位数
    return s < 10 ? '0' + s : s;
}

function createordernum() {
    const now = new Date()
    let month = now.getMonth() + 1
    let day = now.getDate()
    let hour = now.getHours()
    let minutes = now.getMinutes()
    let seconds = now.getSeconds()
    month = setTimeDateFmt(month)
    day = setTimeDateFmt(day)
    hour = setTimeDateFmt(hour)
    minutes = setTimeDateFmt(minutes)
    seconds = setTimeDateFmt(seconds)
    let orderCode = now.getFullYear().toString() + month.toString() + day + hour + minutes + seconds + (Math.round(Math.random() * 1000000)).toString();
    return orderCode;
    //基于年月日时分秒+随机数生成订单编号
}
/**
 * 将数据分页
 * @param {number[]} data 
 * @param {number} page 
 * @param {number} size 
 * @returns {number[]} 分页后的数据
 * 
 */
function pagination(data, page, size) {
    if (size === -1 || !size || isNaN(size)) {
        for (let i = 0; i < data.length; i++) {
            if (data[i].create_time || data[i].update_time) {
                data[i].create_time = formatDate(data[i].create_time, 'yyyy-MM-dd hh:mm:ss')
                data[i].update_time = formatDate(data[i].update_time, 'yyyy-MM-dd hh:mm:ss')
            }
        }
        return data
    }
    let result = []
    const start = (page - 1) * size
    const len = data.length
    if (start + size < len) {
        result = data.slice(start, start + size)
    } else {
        result = data.slice(start, len)
    }
    for (let i = 0; i < result.length; i++) {
        if (result[i].create_time || result[i].update_time) {
            result[i].create_time = formatDate(result[i].create_time, 'yyyy-MM-dd hh:mm:ss')
            result[i].update_time = formatDate(result[i].update_time, 'yyyy-MM-dd hh:mm:ss')
        }
    }
    return [...result]
}

/**
 * 处理sql语句带参数
 * @param {string} sql 
 * @param {Object} params 
 * @param {string} tableName 
 * @returns {string} 拼接起来的sql语句
 * 
 */

function handleSearch(sql, params, tableName) {
    // 用于匹配模糊搜索的
    const check = (val) => {
        if (val[0] === '%' || val[val.length - 1] === '%') {
            return true
        }
        return false
    }
    // 表示search已添加的参数个数
    let addSearch = 0
    let res = sql
    const keys = Object.keys(params)
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (!params[key]) continue
        if (key === 'start_time') {
            res = `${res} ${addSearch > 0 ? 'and' : 'where'} ${tableName ? tableName + '.' : ''}create_time >= '${params[key]}'`
            addSearch++
            continue
        }
        if (key === 'end_time') {
            res = `${res} ${addSearch > 0 ? 'and' : 'where'} ${tableName ? tableName + '.' : ''}create_time <= '${params[key]}'`
            addSearch++
            continue
        }
        res = `${res} ${addSearch > 0 ? 'and' : 'where'} ${key} ${check(params[key]) ? 'like' : '='}'${params[key]}'`
        addSearch++
    }
    return res
}

/**
 * 获取表总数据
 * @param {string} table - 表名
 * @returns {number} - 表数据总数
 * 
 */

async function totalCount(table) {
    try {
        const sql = `select count(*) as total from ${table}`
        const [countResult] = await db.query(sql)
        return countResult[0].total
    } catch (error) {
        console.log(error)
    }
}

/**
 * 根据id删除表数据
 * @param {string} tableName 
 * @param {number} id 
 * @returns {Object}
 */
async function delTableData(tableName, id) {
    try {
        const sql = `delete from ${tableName} where id=${id}`
        const [result] = await db.query(sql)
        if (result.affectedRows > 0) {
            return {
                result: true,
                message: '删除成功'
            }
        } else {
            return {
                result: false,
                message: '删除失败'
            }
        }
    } catch (error) {
        console.log(error)
    }
}

  module.exports = {
    formatDate,
    createordernum,
    pagination,
    handleSearch,
    totalCount,
    delTableData
  }