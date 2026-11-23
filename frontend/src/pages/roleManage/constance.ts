const menu = [
    {
        key: '/manage/dash_board',
        label: '数据中心'
    },
    {
        key: '/manage/content',
        label: '资讯管理'
    },
    {
        key: '/manage/merchant',
        label: '供应商管理'
    },
    {
        key: '/manage/display',
        label: '分类管理'
    },
    {
        key: '/manage/complain',
        label: '工单管理'
    },
    {
        key: '/manage/user_manage',
        label: '用户管理'
    },
    {
        key: '/manage/role_manage',
        label: '角色管理'
    },
    {
        key: '/manage/person',
        label: '个人中心'
    }
]
export default menu.map(item => {
    return {
        value: item.key,
        label: item.label
    }
})