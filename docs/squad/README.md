# 后台管理系统交付小队（autowonderTest）

靶子仓库：`ppztt/autowonderTest`，前后端同仓库的前后端分离项目。
角色卡正文见 [paste-ready.md](./paste-ready.md)，工单见 [backlog.md](./backlog.md)。

## 项目事实（全部实测确认）

| 项 | 实际值 |
|---|---|
| 前端 | `frontend/`，React 18 + TS 4.9 + antd 5 + tailwind 3 + react-router 6，CRA 体系（craco + webpack 5） |
| 前端命令 | `npm start`（**默认端口 8080**）/ `npm run build` / `npm test`（均为 `node scripts/*.js`） |
| 前端规模 | 12 个业务页面（商户/投诉/内容/角色/用户/数据中心等），组件层只有 `richEditor.tsx` |
| 后端 | `backend/`，Express 4 + jade + mysql2 + mongoose + JWT + multer，端口 **3000** |
| 后端命令 | `npm run serve`（`node ./bin/www`）/ `npm start`（node-dev 热重载） |
| 后端分层 | `routes/` → `controllers/` → `services/`，路由分 `backWay/`（后台）与 `gateway/`（网关）两组 |
| 数据库 | MySQL `127.0.0.1:3306`，库 `crpp`，默认 `root/123456`，可用 `MYSQL_*` 环境变量覆盖 |
| 鉴权 | **全局 JWT 中间件**，白名单仅 `/manage/member/login`、`/portal/member/login`、`/portal/member/register` |
| 后端测试 | **没有测试框架**，验收只能靠 HTTP 调用 |
| 前端测试 | jest（CRA 内置），现有 `App.test.tsx` 一个用例 |

## 五条约束（直接决定角色怎么配）

1. **无 token 一律 401**，连根路径 `/` 也是。验收后端接口必须先登录拿 token。
2. **新增免登录接口必须改 `app.js` 白名单**，那是全局文件，属于高风险改动，必须走评审。
3. **登录依赖数据库**，本地 MySQL 没起就用不了 token，整个后端验收会卡死。
4. **后端没有测试**，所以"跑测试通过"这句话在这是无效验收；必须给可执行的 HTTP 断言。
5. **前后端同仓库**，一条分支会同时含两侧改动，评审必须能判断接口契约是否对齐。

## 角色与流程

| 角色码 | 角色名称 | SDLC 流程 | 步骤 | 权限 |
|---|---|---|---|---|
| R1_CLARIFY | 需求澄清工程师 | 需求澄清流程 | 1 | 仓库只读 + `evidence/` 可写 |
| R2_DEV | 全栈开发工程师 | 开发交付流程 | 2 | 交付分支读写 |
| R3_REVIEW | 代码评审工程师 | 代码评审流程 | 1 | **仓库只读** |
| R4_QA | 验收工程师 | 验收流程 | 2 | 本地启动 + HTTP 调用，不写代码 |
| R5_MERGE | 合并工程师 | 分支合并流程 | 2 | 主干合并 |

**为什么开发角色不拆前后端**：项目只有 6 组路由、12 个页面，拆成两个角色会让「接口契约」这一最关键的信息跨角色传递，反而更容易不一致。等前端页面类工单变成主流，再考虑拆。

## 分支策略

```
main
 └─ feat/wi-<工单ID>-<主题>      ← 从 main 切出，同单返工沿用原分支
      ├─ R3 在 commit sha 上只读评审
      ├─ R4 在该 sha 上启动前后端做验收
      └─ R5 合并回 main
```

同一分支里前端和后端的改动**必须成组出现**：接口改了而调用方没改（或反过来），评审直接不通过。

## 各流程步骤

### 需求澄清流程（1 步）

| 输入 | 动作 | 输出 | 失败去向 |
|---|---|---|---|
| 工单正文 | 定位前后端受影响文件 → 写出**接口契约**（路径/方法/入参/出参/是否需要 token）→ 验收条件 | `evidence/requirements.md` | 工单缺期望行为 → 退回并列缺失项 |

接口契约是这份产物的核心，没有它下游必然对不齐。

### 开发交付流程（2 步）

| 步骤 | 动作 | 输出 |
|---|---|---|
| 1 建分支实施 | 从 main 切分支，按契约改前端与后端 | 分支 + 提交 |
| 2 自测交付 | 前端 `npm run build`；后端启动 + 接口冒烟 | sha + 原始输出 |

### 代码评审流程（1 步）

| 输入 | 动作 | 输出 |
|---|---|---|
| sha + 契约 + diff | 必查七项（见角色卡），逐条对照契约 | `evidence/review.md` |

### 验收流程（2 步）

| 步骤 | 动作 | 输出 |
|---|---|---|
| 1 双端启动验证 | 起后端（3000）+ 前端（8080），跑接口断言 | 验收记录 |
| 2 交付物整理 | 写可复现的冒烟步骤与预期结果 | `evidence/verify.md` |

### 分支合并流程（2 步）

| 步骤 | 动作 | 输出 |
|---|---|---|
| 1 溯源与分级 | 核对上游证据链，复现冲突 | 分级结论 |
| 2 合并与回读 | 合并 main，重新构建前端 + 启动后端验证 | `evidence/merge.md` |

## 平台侧配置顺序（不可颠倒）

```
建小队 → 建 SDLC 流程 → 建角色(绑流程) → 建执行器 → 执行器绑角色
```

## 建角色顺序

| 批次 | 建什么 | 理由 |
|---|---|---|
| 第 1 批 | R1_CLARIFY + R2_DEV | 先跑穿「工单 → 澄清 → 双端交付」 |
| 第 2 批 | R3_REVIEW | 有 diff 之后才有输入 |
| 第 3 批 | R4_QA | 双端启动脚本稳定后 |
| 第 4 批 | R5_MERGE | 最后接合并 |

## 本地验证命令速查

```powershell
# 后端（先确认 MySQL 在跑）
cd backend
npm run serve                  # → http://localhost:3000

# 无 token 应 401
curl.exe -s -o NUL -w "%{http_code}" http://localhost:3000/manage/member/get_member_list

# 前端
cd frontend
npm start                      # → http://localhost:8080
npm run build                  # 产物 build/
npm test -- --watchAll=false   # 退出码 0 才算过
```
