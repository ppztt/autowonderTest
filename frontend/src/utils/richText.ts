// 富文本处理工具：HTML 判定 / 白名单清洗 / 纯文本提取 / 纯文本转 HTML / 截断
// 说明：为避免新增运行时依赖，这里使用浏览器原生 DOMParser 实现白名单清洗（等价于 DOMPurify 白名单策略）。

const KNOWN_TAG_RE =
    /<\/?(p|br|h[1-6]|div|span|strong|b|em|i|u|s|strike|blockquote|ol|ul|li|img|a|hr|pre|code|figure|figcaption|table|thead|tbody|tr|td|th)\b[^>]*>/i

const ALLOWED_TAGS = [
    'P', 'BR', 'H1', 'H2', 'H3', 'H4', 'H5',
    'STRONG', 'EM', 'U', 'S',
    'BLOCKQUOTE', 'OL', 'UL', 'LI',
    'SPAN', 'IMG', 'A'
]

const ALLOWED_ATTRS = ['class', 'style', 'src', 'alt', 'title', 'width', 'height', 'href', 'target', 'rel']

// 直接整体移除的标签（其内部文本也不保留）
const DROP_TAGS = [
    'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'BUTTON',
    'TEXTAREA', 'SELECT', 'OPTION', 'SVG', 'MATH', 'LINK', 'META', 'NOSCRIPT',
    'TEMPLATE', 'BASE', 'HEAD', 'TITLE'
]

const BLOCK_TAGS = [
    'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'OL', 'UL', 'LI',
    'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'PRE', 'FIGURE', 'SECTION', 'ARTICLE'
]

/** 是否为受支持的 HTML 富文本（用已知标签白名单判定，避免把 "a < b" 误判为 HTML） */
export function isHtmlContent(value?: string | null): boolean {
    if (!value) return false
    return KNOWN_TAG_RE.test(value)
}

/** HTML 转义 */
function escapeHtml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
}

function isSafeUrl(url: string): boolean {
    const u = (url || '').trim().toLowerCase()
    return u.startsWith('/') || u.startsWith('http://') || u.startsWith('https://')
}

function isUnsafeStyle(style: string): boolean {
    return /url\s*\(|expression\s*\(|javascript:/i.test(style)
}

function sanitizeChildren(parent: Node) {
    const children = Array.from(parent.childNodes)
    for (const child of children) {
        if (child.nodeType !== 1) continue
        const el = child as Element
        const tag = el.tagName.toUpperCase()

        if (DROP_TAGS.indexOf(tag) !== -1) {
            parent.removeChild(el)
            continue
        }

        if (ALLOWED_TAGS.indexOf(tag) === -1) {
            // 非白名单标签：先清洗其子节点，再用子节点替换自身（保留可见文本）
            sanitizeChildren(el)
            while (el.firstChild) {
                parent.insertBefore(el.firstChild, el)
            }
            parent.removeChild(el)
            continue
        }

        // 先递归清洗，再处理自身属性
        sanitizeChildren(el)
        const attrs = Array.from(el.attributes)
        for (const attr of attrs) {
            const name = attr.name.toLowerCase()
            let keep = ALLOWED_ATTRS.indexOf(name) !== -1
            if (keep && (name === 'src' || name === 'href')) {
                keep = isSafeUrl(el.getAttribute(attr.name) || '')
            }
            if (keep && name === 'style') {
                keep = !isUnsafeStyle(el.getAttribute(attr.name) || '')
            }
            if (!keep) {
                el.removeAttribute(attr.name)
            }
        }

        if (tag === 'IMG') {
            if (!isSafeUrl(el.getAttribute('src') || '')) {
                parent.removeChild(el)
                continue
            }
        }

        if (tag === 'A') {
            el.setAttribute('rel', 'noopener noreferrer')
            el.setAttribute('target', '_blank')
        }
    }
}

/** 按标签/属性白名单清洗 HTML，用于 dangerouslySetInnerHTML 前 */
export function sanitizeHtml(html?: string | null): string {
    if (!html) return ''
    if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
        return escapeHtml(html)
    }
    const doc = new window.DOMParser().parseFromString(html, 'text/html')
    const body = doc.body
    sanitizeChildren(body)
    return body.innerHTML
}

function collapseWhitespace(text: string): string {
    return text.replace(/[\s\u00a0]+/g, ' ').trim()
}

function collectText(node: Node, parts: string[]) {
    node.childNodes.forEach((child) => {
        if (child.nodeType === 3) {
            parts.push(child.textContent || '')
            return
        }
        if (child.nodeType !== 1) return
        const el = child as Element
        const tag = el.tagName.toUpperCase()
        if (tag === 'BR') {
            parts.push(' ')
            return
        }
        if (tag === 'IMG') {
            return
        }
        if (BLOCK_TAGS.indexOf(tag) !== -1) {
            parts.push(' ')
            collectText(el, parts)
            parts.push(' ')
            return
        }
        collectText(el, parts)
    })
}

/** 取可见纯文本：块级边界补空格，折叠连续空白 */
export function htmlToPlainText(value?: string | null): string {
    if (!value) return ''
    if (!isHtmlContent(value)) {
        return collapseWhitespace(value)
    }
    if (typeof window === 'undefined' || typeof window.DOMParser === 'undefined') {
        return collapseWhitespace(value.replace(/<[^>]*>/g, ' '))
    }
    const doc = new window.DOMParser().parseFromString(value, 'text/html')
    const parts: string[] = []
    collectText(doc.body, parts)
    return collapseWhitespace(parts.join(''))
}

/** 纯文本转 HTML：转义特殊字符，换行转 <br/>（用于历史纯文本在编辑器中回显） */
export function plainTextToHtml(text?: string | null): string {
    if (!text) return ''
    return escapeHtml(text).replace(/\r\n|\r|\n/g, '<br/>')
}

/** 截断可见文本，超出追加省略号（按 Unicode 字符计数） */
export function truncateText(text?: string | null, max: number = 100): string {
    if (!text) return ''
    const chars = Array.from(text)
    if (chars.length <= max) return text
    return chars.slice(0, max).join('') + '…'
}

/** 正文是否有效：去标签后有文字，或包含图片 */
export function hasRichContent(html?: string | null): boolean {
    if (!html) return false
    if (/<img\b/i.test(html)) return true
    return htmlToPlainText(html).length > 0
}
