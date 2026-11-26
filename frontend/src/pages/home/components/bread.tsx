import React from "react"
import { Breadcrumb } from 'antd'
import { useLocation } from "react-router-dom"
import routes from "@/router/routes"

// 按路径逐级精确匹配路由，避免用 includes 时先命中 '/manage/login' 导致 children 为 undefined 而崩溃
const matchBreadcrumb = (pathname: string): any[] => {
    const segs = (pathname || '').split('/').filter(item => item)
    if (!segs.length) return []
    const list = routes as any[]
    const root = list.find((r: any) => r && r.path === '/' + segs[0])
    if (!root) return []
    const crumbs: any[] = [root]
    let children: any[] = Array.isArray(root.children) ? root.children : []
    for (let i = 1; i < segs.length; i++) {
        const child = children.find((c: any) => c && c.path === segs[i])
        if (!child) break
        crumbs.push(child)
        children = Array.isArray(child.children) ? child.children : []
    }
    return crumbs
}

const LocalBreadcrumb: React.FC = () => {
    const location = useLocation()
    const crumbs = matchBreadcrumb(location?.pathname || '')
    const items = crumbs.map((item: any, index: number) => ({
        key: `${item.path || 'crumb'}-${index}`,
        title: item.title || ''
    }))
    return <Breadcrumb items={items} />
}

export default LocalBreadcrumb
