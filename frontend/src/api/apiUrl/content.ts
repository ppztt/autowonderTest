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
    },
    // 资讯插图上传：不手工设置 Content-Type，交给浏览器自动带 multipart boundary
    uploadArticleImage: (file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        return post(`${reUrl}/manage/article/upload_image`, formData)
    }
}

export default Content