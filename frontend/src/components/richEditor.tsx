import { FC, useMemo, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { message } from 'antd'

export interface RichEditorProps {
    value?: string
    onChange?: (html: string) => void
    /** 上传图片，返回可直接插入编辑器的 src（如 /api/newsuploads/xxx.png） */
    onUpload?: (file: File) => Promise<string>
    placeholder?: string
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ACCEPT_MIME_RE = /^image\/(jpeg|png|gif|webp)$/

const RichEditor: FC<RichEditorProps> = ({ value = '', onChange, onUpload, placeholder = '请输入' }) => {
    const quillRef = useRef<ReactQuill>(null)
    const onUploadRef = useRef(onUpload)
    onUploadRef.current = onUpload

    // 工具栏图片按钮：选择本地图片 -> 上传 -> 插入图片 URL（禁止 base64）
    const pickImage = () => {
        const editor = quillRef.current?.getEditor()
        if (!editor) return
        if (!onUploadRef.current) {
            message.error('图片上传未配置')
            return
        }
        // 打开文件框前记录当前选区
        const range = editor.getSelection(true)
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/jpeg,image/png,image/gif,image/webp'
        input.onchange = async () => {
            const file = input.files && input.files[0]
            if (!file) return
            if (!ACCEPT_MIME_RE.test(file.type)) {
                message.error('仅支持 jpg/jpeg/png/gif/webp 格式的图片')
                return
            }
            if (file.size > MAX_IMAGE_SIZE) {
                message.error('图片大小不能超过 5MB')
                return
            }
            try {
                const url = await onUploadRef.current!(file)
                const q = quillRef.current?.getEditor()
                if (!q) return
                const index = range ? range.index : q.getLength()
                q.insertEmbed(index, 'image', url, 'user')
                q.setSelection(index + 1, 0)
            } catch (e) {
                message.error('图片上传失败')
            }
        }
        input.click()
    }

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, false] }],
                ['bold', 'italic', 'underline', 'strike', 'blockquote', 'image'],
                [{ list: 'ordered' }, { list: 'bullet' }, { color: [] }, { background: [] }, { align: [] }]
            ],
            handlers: {
                image: pickImage
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [])

    const handleChange = (html: string) => {
        // 安全网：任何 base64 图片都拒绝写入正文
        if (/data:image\//i.test(html)) {
            message.warning('不支持粘贴或拖拽图片，请使用工具栏图片按钮上传')
            return
        }
        // 等价空值判定：Quill 空值为 <p><br></p>
        const textOnly = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
        const isEmpty = !/<img\b/i.test(html) && textOnly === ''
        onChange?.(isEmpty ? '' : html)
    }

    // 阻止粘贴/拖拽图片产生 base64，捕获阶段拦截，先于 Quill 处理
    const blockImageTransfer = (e: any) => {
        const dt = e.clipboardData || e.dataTransfer
        if (!dt) return
        const files = dt.files || []
        const items = dt.items || []
        let hasImage = false
        for (let i = 0; i < files.length; i++) {
            if (/^image\//.test(files[i].type)) hasImage = true
        }
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && /^image\//.test(items[i].type)) hasImage = true
        }
        if (hasImage) {
            e.preventDefault()
            e.stopPropagation()
            message.warning('请使用工具栏图片按钮上传图片')
        }
    }

    return (
        <div className="rich-editor" onPasteCapture={blockImageTransfer} onDropCapture={blockImageTransfer}>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={value}
                modules={modules}
                placeholder={placeholder}
                onChange={handleChange}
            />
        </div>
    )
}

export default RichEditor
