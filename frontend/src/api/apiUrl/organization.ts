import { reUrl, get } from '../index'

const Role = {
    getOrganizationList: (params: Object) => {
        return get(`${reUrl}/manage/org/get_list/`, params)
    }
}
export default Role