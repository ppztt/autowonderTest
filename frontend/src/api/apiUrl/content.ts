import { reUrl, get, post, put, del } from '../index'

const Content = {
    getContentList: (params: any) => {
        return get(`${reUrl}/manage/article/get_article_list/`, params)
    },
    addContent: (params: any) => {
        return post(`${reUrl}/manage/article/add_article/`, params)
    },
    editContent: (id: number | string, params: any) => {
        return put(`${reUrl}/manage/article/edit_article/${id}`, params)
    },
    delContent: (id: number | string) => {
        return del(`${reUrl}/manage/article/del_article/${id}`)
    }
}

export default Content