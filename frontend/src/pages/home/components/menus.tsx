import React, { useEffect, useState } from 'react'
import { PieChartTwoTone, MailOutlined, ContainerTwoTone, GoldTwoTone, PartitionOutlined, UserOutlined, TeamOutlined, InsertRowBelowOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd'
import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom'
import $request from '@/api/api'
import './menus.scss'

type MenuItem = Required<MenuProps>['items'][number];
const items: MenuItem[] = [
    {
        key: '/manage/dash_board',
        label: '数据中心',
        icon: <PieChartTwoTone />
    },
    {
        key: '/manage/content',
        label: '资讯管理',
        icon: <ContainerTwoTone />
    },
    {
        key: '/manage/merchant',
        label: '供应商管理',
        icon: <GoldTwoTone />
    },
    {
        key: '/manage/complain',
        label: '工单管理',
        icon: <MailOutlined />
    },
    {
        key: '/manage/display',
        label: '分类管理',
        icon: <InsertRowBelowOutlined />
    },
    {
        key: '/manage/user_manage',
        label: '用户管理',
        icon: <TeamOutlined />
    },
    {
        key: '/manage/role_manage',
        label: '角色管理',
        icon: <PartitionOutlined />
    },
    {
        key: '/manage/person',
        label: '个人中心',
        icon: <UserOutlined />
    }
]

const LocalMenu: React.FC<{userInfo: any}> = ({ userInfo }) => {
    const navigate = useNavigate()
    const [localMenu, setLocalMenu] = useState<any>([])
    const onClick: MenuProps['onClick'] = (e) => {
        navigate(e.key)
    }
    const getMenu = async () => {
        try {
            const res = await $request.Role.getRoleList({ role_level: userInfo.role_level })
            if (res.result) {
                const stored: string[] = JSON.parse(res.data[0].menu_list || '[]')
                // 兼容历史角色数据里的旧菜单前缀
                const menu = stored.map((key: string) => key.replace('/back_way', '/manage'))
                const local = items.filter((item: any) => menu.includes(item.key))
                setLocalMenu(local)
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        getMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    return (
        <Menu
            className='menu'
            onClick={onClick}
            style={{ width: '100%', border: 'none' }}
            defaultSelectedKeys={['/manage/dash_board']}
            mode="inline"
            items={localMenu}
        />
    );
};

export default LocalMenu;