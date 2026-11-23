# autowonder-frontend

React 18 + TypeScript + Ant Design 的后台管理前端，配套 `../backend` 的 Express 服务。

## 目录

```
src/
├─ api/            axios 实例与接口定义（apiUrl/* 按业务模块拆分）
├─ components/     通用组件（富文本编辑器等）
├─ pages/          业务页面
│  ├─ login/              后台登录
│  ├─ home/               后台框架（菜单、面包屑）
│  ├─ dataCenter/         数据中心
│  ├─ articleManage/      资讯管理（目录名 contentManage）
│  ├─ vendorManage/       供应商管理（目录名 merchantManage）
│  ├─ ticketManage/       工单管理（目录名 complainManage）
│  ├─ classificationManage/ 分类管理（区域 / 工单类型）
│  ├─ userManage/         成员管理
│  ├─ roleManage/         角色管理
│  ├─ person/             个人中心
│  └─ gateway/            门户端（登录、首页、资讯、工单提交）
├─ router/         路由表
├─ type/           TS 类型
└─ utils/
```

## 开发

```bash
npm install
npm start          # http://localhost:8080
```

开发服务器（`config/webpackDevServer.config.js`）把 `/api` 前缀转发到后端 `http://127.0.0.1:3000` 并去掉 `/api`，所以前后端要分别启动。

## 构建

```bash
npm run build      # 产物在 build/
```

## 接口约定

- 前端统一以 `/api` 为前缀请求，后端实际路径为 `/manage`（后台）和 `/portal`（门户），由开发代理去掉 `/api`。
- 登录成功后后端通过响应头 `Authorization` 下发 token，前端存 `localStorage` 并在后续请求头回传。
- 统一响应体：`{ result: boolean, message?: string, data?: any }`。
