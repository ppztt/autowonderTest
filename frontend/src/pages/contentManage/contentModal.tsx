import { Modal, Form, Input, Select, message } from "antd"
import React, { useEffect, useState } from "react"
import $request from '@/api/api'
import { reUrl } from '@/api/index'
import RichEditor from '@/components/richEditor'
import { hasRichContent, isHtmlContent, plainTextToHtml } from '@/utils/richText'

const ContentModal: React.FC<any> = ({ isEdit, isShow, changeShow, currentInfo, typeList }) => {
    const layout = {
        labelCol: { span: 4 },
        wrapperCol: { span: 18 },
    }
    const [contentForm] = Form.useForm<any>()
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const baseInfo = {
        id: -1,
        title: '',
        content: '',
        complaint_type: null
    }
    // 富文本插图：选择本地图片 -> 上传 -> 返回可直接插入编辑器的地址
    const handleUpload = async (file: File) => {
        const res: any = await $request.Content.uploadArticleImage(file)
        if (res && res.result && res.data && res.data.url) {
            return `${reUrl}${res.data.url}`
        }
        throw new Error((res && res.message) || '图片上传失败')
    }
    const handleConfirm = async () => {
        setIsLoading(true)
        try {
            const value = await contentForm.validateFields()
            const params: any = { ...value }
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}')
            params.creator = userInfo.user_name
            params.creator_id = userInfo.id
            params.complaint_type_cn = typeList.find((item: any) => item.value === params.complaint_type)?.label || ''
            const res = isEdit
                ? await $request.Content.editContent(currentInfo.id, params)
                : await $request.Content.addContent(params)
            if (res && res.result) {
                message.success(isEdit ? '编辑成功' : '新增成功')
                changeShow(false)
            } else {
                message.error((res && res.message) || (isEdit ? '编辑失败' : '新增失败'))
            }
        } catch (err: any) {
            // 表单校验失败时 Form 已展示错误，这里只提示请求异常
            if (!(err && err.errorFields)) {
                message.error(typeof err === 'string' ? err : '提交失败，请稍后重试')
            }
        } finally {
            // 无论成功、业务失败、校验失败还是请求异常，都必须复位 loading
            setIsLoading(false)
        }
    }
    const closeModal = () => {
        contentForm.resetFields()
        setIsLoading(false)
        changeShow(false)
    }
    const handleCancel = () => {
        changeShow(false)
    }
    useEffect(() => {
        if (isEdit) {
            // 历史纯文本需转义后转 HTML 回显，避免 Quill 丢失换行或误解析 <
            const rawContent = currentInfo?.content || ''
            const htmlContent = isHtmlContent(rawContent) ? rawContent : plainTextToHtml(rawContent)
            contentForm.setFieldsValue({ ...currentInfo, content: htmlContent })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit])
    return (
        <Modal
            title={isEdit ? '编辑资讯' : '新增资讯'}
            open={isShow}
            width={900}
            onOk={handleConfirm}
            okText="确定"
            cancelText="取消"
            afterClose={closeModal}
            onCancel={handleCancel}
            confirmLoading={isLoading}>
            <Form
                {...layout}
                form={contentForm}
                style={{ width: '100%' }}
                initialValues={baseInfo}>
                <Form.Item name="title" label="资讯标题" rules={[{ required: true, message: '请输入资讯标题' }]}>
                    <Input placeholder="请输入资讯标题" />
                </Form.Item>
                <Form.Item name="complaint_type" label="资讯类型" rules={[{ required: true, message: '请选择资讯类型' }]}>
                    <Select
                        allowClear
                        style={{ width: 200 }}
                        placeholder="请选择资讯类型"
                        options={typeList}
                    />
                </Form.Item>
                <Form.Item
                    name="content"
                    label="资讯内容"
                    rules={[
                        {
                            validator: (_: any, val: string) =>
                                hasRichContent(val)
                                    ? Promise.resolve()
                                    : Promise.reject(new Error('请输入资讯内容'))
                        }
                    ]}>
                    <RichEditor onUpload={handleUpload} placeholder="请输入资讯内容" />
                </Form.Item>
            </Form>
        </Modal>
    )
}

export default ContentModal
