import { reUrl, get, post, put, del } from '../index'

const Merchant = {
    getMerchantList: (params: any) => {
        return get(`${reUrl}/manage/vendor/get_vendor_list/`, params)
    },
    addMerchant: (params: any) => {
        return post(`${reUrl}/manage/vendor/add_vendor/`, params)
    },
    editMerchant: (id: Number | string, params: any) => {
        return put(`${reUrl}/manage/vendor/edit_vendor/${id}`, params)
    },
    delMerchant: (id: Number | string) => {
        return del(`${reUrl}/manage/vendor/del_vendor/${id}`)
    },
    getAreaList: (params: any) => {
        return get(`${reUrl}/manage/vendor/get_area_list/`, params)
    },
    addArea: (params: any) => {
        return post(`${reUrl}/manage/vendor/add_area/`, params)
    },
    editArea: (id: number, params: any) => {
        return put(`${reUrl}/manage/vendor/edit_area/${id}`, params)
    },
    delArea: (id: number) => {
        return del(`${reUrl}/manage/vendor/delete_area/${id}`)
    }
}
export default Merchant