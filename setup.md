# 开发机接入（只拿到仓库时的完整步骤）

前提：这台机器上**只有从 GitHub clone 的仓库**，没有 qodercli、没有执行器、没有别的文档。

**好消息**：仓库里已经自带执行器所需的一切 —— `scripts/start-online.ps1`、`qodercli-fast.cmd`、根 `package.json`。你不需要手工创建任何脚本。

**最重要的一条**：每台机器必须在平台**各自新建执行器**，拿自己的 `executor-id` 和 `token`。两台机器复用同一个会互相抢任务，而且平台界面上看不出来，表现只是「任务偶尔丢」。

---

## 步骤 0：环境检查

```powershell
node -v
git --version
```

| 项 | 要求 |
|---|---|
| Node | **20 以上**（本项目实测 24.14.1 可跑） |
| git | 任意版本 |

### ⚠️ 如果 node 显示 14.x，先别装依赖

有机器装了多个 node，PATH 首位可能是老版本。Node 14 下 qodercli 的 postinstall 必然失败，报 `Cannot find module ...bundle/qodercli.js`。

```powershell
# 临时把新版本前置（每个新窗口都要做，或直接改系统 PATH 顺序）
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
node -v      # 确认变成 20+
```

## 步骤 1：克隆并安装

```powershell
cd d:\Work
git clone https://github.com/ppztt/autowonderTest.git
cd autowonderTest
npm install
```

根 `package.json` 里已声明 `@qoder-ai/qodercli` 依赖，直接装即可。

**验收**：

```powershell
.\node_modules\.bin\qodercli.cmd --version     # 应输出 1.1.x
```

## 步骤 2：登录 qodercli

```powershell
.\node_modules\.bin\qodercli.cmd login
```

浏览器打开授权页，确认授权。

**验收**：

```powershell
.\node_modules\.bin\qodercli.cmd status
```

必须看到 `Email: xxx` 和 `Login Method: browser`。仍是 `Not logged in` 就别往下走。

## 步骤 3：配执行器凭据

平台「数字员工 → 执行器」新建执行器，复制生成的命令，取出三个值。

在仓库根目录 `.env.local` 写入（该文件已被 `.gitignore` 排除，不会进 git）：

```
AUTOWONDER_WS_URL=ws://<平台地址>/ws/executor
AUTOWONDER_TOKEN=<你的 token>
AUTOWONDER_EXECUTOR_ID=<你的执行器 ID>
```

## 步骤 4：启动

```powershell
cd d:\Work\autowonderTest
npm run online
```

按顺序看到这些才算通：

| # | 期望输出 | 没出现说明 |
|---|---|---|
| 1 | `Qoder CLI is installed and authenticated (qodercli-fast.cmd ...)` | 包装脚本没被用上 |
| 2 | `Connecting to ws://...` | 到平台网络不通 |
| 3 | `Provider: qoder` / `Name: daemon_qoder_<id>` | 参数没传对 |
| 4 | **`ws connected executorId=<id>`** | 到这里才算真通了 |
| 5 | `TokenProxy helper exceeded hard deadline` | ⚠️ 不该出现。出现说明命令里还带着 `--token-aware-enable`，删掉它 |

**窗口必须一直开着**，关掉或 Ctrl+C 平台就显示离线。

> 注意：`qodercli-fast.cmd` 是必需的包装脚本。autowonder 启动时会执行 `qodercli --list-models` 做认证探针，该命令在部分机器上要 17-23 秒，超过探针超时就会被误判为「未登录」并反复弹浏览器。仓库里的这个包装让探针对 `--list-models` 瞬间返回缓存列表。
> 副作用：qodercli 升级导致模型列表变化时，需要同步更新 `qodercli-fast.cmd` 里的那 16 行。

## 步骤 5：平台侧配置顺序（不可颠倒）

```
建小队 → 建 SDLC 流程 → 建角色(绑流程) → 建执行器 → 执行器绑角色
```

角色要先绑 SDLC 流程，执行器再绑角色。反过来配会发现执行器没地方挂。

开发机应建的角色：`R1_CLARIFY`（澄清）、`R2_DEV`（开发）、`R5_MERGE`（合并）。
评审与验收在只读机器上，不在这台。

## 步骤 6：验证靶子项目本身健康

平台显示在线之后，先确认项目能跑，否则任务失败时分不清是 agent 的问题还是项目的问题。

```powershell
# 后端（需本地 MySQL 在 3306 运行，库 crpp）
cd backend
npm install
npm run serve

# 另开窗口：无 token 应返回 401（全局 JWT 鉴权生效，这是正常的）
curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/manage/member/get_member_list

# 前端
cd ..\frontend
npm install
npm run build          # 退出码 0
npm start              # → http://localhost:8080
```

---

## 失败对照

| 现象 | 先查这个 |
|---|---|
| `npm install` 报 `Cannot find module ...bundle/qodercli.js` | node 版本太老，见步骤 0 |
| 反复弹浏览器登录，登录了也没用 | `qodercli-fast.cmd` 没被用上；确认 `scripts/start-online.ps1` 里设置了 `AUTOWONDER_QODER_CLI` |
| `TokenProxy helper exceeded hard deadline` | 命令里有 `--token-aware-enable`，删掉 |
| `npx ... status` 显示 stopped 但窗口在跑 | connect 模式端口是动态分配的，`status` 查的是默认端口；以窗口日志为准 |
| connect 一启动就退出 | 命令接了 `\| Select-Object -First N` 管道，截断会杀掉常驻进程 |
| 脚本报「意外的标记」「字符串缺少终止符」 | `.ps1` 不是 UTF-8 with BOM。仓库里的文件是 BOM 的，如果你手工改过要补回 |
| 后端所有接口都 401 | **这是正常的**，全局 JWT 鉴权；只有 3 个登录注册路径免 token |
| 后端启动报 `Cannot find module 'http-errors'` | 没在 `backend` 目录跑 `npm install` |

## 这台机器要建的角色

| 角色码 | 角色 | 需要推送 |
|---|---|---|
| R1_CLARIFY | 需求澄清 | 是 |
| R2_DEV | 全栈开发 | 是 |
| R5_MERGE | 合并 | 是 |

R3 评审、R4 验收在只读机器上，那台的产物不进仓库。

## 每台机器的关系

| 项 | 规则 |
|---|---|
| executor-id / token | **每台机器各自独立**，不能复用 |
| ws-url | 同一平台通常相同 |
| 模型 / context-window | 相同，以平台页面生成的为准 |
| 工作区与日志 | 各自本地，互不影响 |
