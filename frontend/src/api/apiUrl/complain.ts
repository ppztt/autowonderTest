import { del, get, post, put, reUrl } from '../index'

const Complain = {
    getComplainList: (params: any) => {
        return get(`${reUrl}/manage/ticket/get_ticket_list/`, params)
    },
    delComplainList: (id: Number) => {
        return del(`${reUrl}/manage/ticket/del_ticket_list/${id}`)
    },
    auditComplain: (params: any) => {
        return post(`${reUrl}/manage/ticket/audit_ticket/`, params)
    },
    // 工单类型接口
    getComplaintType: (params: any) => {
        return get(`${reUrl}/manage/ticket/get_ticket_type/`, params)
    },
    delComplainType: (id: Number) => {
        return del(`${reUrl}/manage/ticket/del_ticket_type/${id}`)
    },
    addComplainType: (params: any) => {
        return post(`${reUrl}/manage/ticket/add_ticket_type/`, params)
    },
    editComplainType: (id: Number, params: any) => {
        return put(`${reUrl}/manage/ticket/edit_ticket_type/${id}`, params)
    }
}

export default Complain