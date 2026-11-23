import { roleType } from '@/type/userType'
import { reUrl, get, del, post, put } from '../index'

const Role = {
    getRoleList: (params: Object) => {
        return get(`${reUrl}/manage/group/get_list/`, params)
    },
    delRole: (id: number | string) => {
        return del(`${reUrl}/manage/group/del_group/${id}`)
    },
    addRole: (params: object) => {
        return post(`${reUrl}/manage/group/add_group/`, params)
    },
    editRole: (params: roleType) => {
        return put(`${reUrl}/manage/group/edit_group/${params.id}`, params)
    }
}
export default Role