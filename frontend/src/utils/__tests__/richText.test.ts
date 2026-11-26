import {
    isHtmlContent,
    sanitizeHtml,
    htmlToPlainText,
    plainTextToHtml,
    truncateText,
    hasRichContent
} from '../richText'

describe('isHtmlContent', () => {
    it('识别已知 HTML 标签', () => {
        expect(isHtmlContent('<p>hello</p>')).toBe(true)
        expect(isHtmlContent('<h2>标题</h2><ul><li>a</li></ul>')).toBe(true)
        expect(isHtmlContent('<p><br></p>')).toBe(true)
    })
    it('不把普通文本里的 < 误判为 HTML', () => {
        expect(isHtmlContent('a < b\nc > d')).toBe(false)
        expect(isHtmlContent('')).toBe(false)
    })
})

describe('sanitizeHtml', () => {
    it('移除 script / 事件属性 / javascript: 链接', () => {
        const dirty =
            '<script>alert(1)</script><img src="x" onerror="alert(1)"><p onclick="alert(1)">hi</p><a href="javascript:alert(1)">x</a>'
        const clean = sanitizeHtml(dirty)
        expect(clean).not.toMatch(/<script/i)
        expect(clean).not.toMatch(/onerror/i)
        expect(clean).not.toMatch(/onclick/i)
        expect(clean).not.toMatch(/javascript:/i)
        expect(clean).toContain('hi')
        expect(clean).toContain('x')
    })
    it('保留 class / style / 合法 img src', () => {
        const html = '<p class="ql-align-center"><span style="color: red;">红</span><img src="/api/newsuploads/a.png"></p>'
        const clean = sanitizeHtml(html)
        expect(clean).toContain('ql-align-center')
        expect(clean).toContain('color: red')
        expect(clean).toContain('src="/api/newsuploads/a.png"')
    })
    it('拒绝 data: 图片', () => {
        const clean = sanitizeHtml('<img src="data:image/png;base64,AAA">')
        expect(clean).not.toMatch(/data:image/i)
    })
    it('给链接补 rel/target', () => {
        const clean = sanitizeHtml('<a href="https://example.com">link</a>')
        expect(clean).toContain('rel="noopener noreferrer"')
        expect(clean).toContain('target="_blank"')
    })
})

describe('htmlToPlainText', () => {
    it('块级边界补空格并折叠空白', () => {
        expect(htmlToPlainText('<p>foo</p><p>bar</p>')).toBe('foo bar')
        expect(htmlToPlainText('<p>  a\n\tb </p>')).toBe('a b')
    })
    it('history 纯文本原样折叠空白', () => {
        expect(htmlToPlainText('line1\nline2')).toBe('line1 line2')
    })
})

describe('plainTextToHtml', () => {
    it('转义特殊字符并保留换行', () => {
        expect(plainTextToHtml('a < b & c\n第二行')).toBe('a &lt; b &amp; c<br/>第二行')
    })
})

describe('truncateText', () => {
    it('超出按字符截断并追加省略号', () => {
        const s = 'x'.repeat(120)
        const r = truncateText(s, 100)
        expect(Array.from(r)).toHaveLength(101)
        expect(r.endsWith('…')).toBe(true)
        expect(truncateText('short', 100)).toBe('short')
    })
})

describe('hasRichContent', () => {
    it('Quill 空值判空', () => {
        expect(hasRichContent('<p><br></p>')).toBe(false)
        expect(hasRichContent('<p></p>')).toBe(false)
        expect(hasRichContent('')).toBe(false)
        expect(hasRichContent('   ')).toBe(false)
    })
    it('有文字或有图片判为有效', () => {
        expect(hasRichContent('<p>文字</p>')).toBe(true)
        expect(hasRichContent('<p><img src="/api/newsuploads/a.png"></p>')).toBe(true)
    })
})
