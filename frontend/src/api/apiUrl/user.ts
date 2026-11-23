import { reUrl, get, post, del } from '../index'

const User = {
    userLogin: (params: Object) => {
        return post(`${reUrl}/manage/member/login`, params)
    },
    getUserList: (params: Object) => {
        return get(`${reUrl}/manage/member/get_member_list`, params)
    },
    addUser: (params: Object) => {
        return post(`${reUrl}/manage/member/add_member`, params)
    },
    delUser: (id: number) => {
        return del(`${reUrl}/manage/member/del_member/${id}`)
    },
    editUser: (id: number, params: Object, config: object) => {
        return post(`${reUrl}/manage/member/edit_member/${id}`, params, config)
    },
    updateSelf: (id: number, params: Object, config: object) => {
        return post(`${reUrl}/manage/member/update_self/${id}`, params, config)
    },
    resetPassword: (id: number, params: Object, config: object) => {
        return post(`${reUrl}/manage/member/reset_password/${id}`, params, config)
    },
    // 数据中心接口
    getDateCenter: (params: {id: number}) => {
        return get(`${reUrl}/manage/member/get_data_collect`, params)
    }
}
export default User
