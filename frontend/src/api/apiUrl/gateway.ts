import { get, post, reUrl } from "../index"

const gateway = {
    gatewayLogin: (params: any) => {
        return post(reUrl + '/portal/member/login', params)
    },
    gatewayRegister: (params: any) => {
        return post(`${reUrl}/portal/member/register`, params)
    },
    postComplain: (params: any) => {
        return post(`${reUrl}/portal/ticket/add_ticket`, params)
    },
    getComplainList: (params: any) => {
        return get(`${reUrl}/portal/ticket/get_ticket_list`, params)
    }
}

export default gateway