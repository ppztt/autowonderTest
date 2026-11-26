import React from "react"
import { Breadcrumb } from 'antd'
import { useLocation } from "react-router-dom"
import routes from "@/router/routes"

// 按路径逐级匹配路由，避免用 includes 时先命中 '/manage/login' 导致 children 为 undefined 而崩溃
const matchBreadcrumb = (pathname: string): any[] => {
    const segs = (pathname || '').split('/').filter(item => item)
    if (!segs.length) return []
    const list = routes as any[]
    const root = list.find((r: any) => r && r.path === '/' + segs[0])
    if (!root) return []
    const crumbs: any[] = [root]
    let children: any[] = root.children || []
    for (let i = 1; i < segs.length; i++) {
        const child = children.find((c: any) => c && c.path === segs[i])
        if (!child) break
        crumbs.push(child)
        children = child.children || []
    }
    return crumbs
}

const LocalBreadcrumb: React.FC = () => {
    const location = useLocation()
    const crumbs = matchBreadcrumb(location?.pathname || '')
    return (
        <Breadcrumb>
            {crumbs.map((item: any, index: number) => (
                <Breadcrumb.Item key={`${item.path || 'crumb'}-${index}`}>
                    {item.title || ''}
                </Breadcrumb.Item>
            ))}
        </Breadcrumb>
    )
}

export default LocalBreadcrumb
