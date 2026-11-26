# 双机分工：只读验收机 + 可推送开发机

本机**只能从 GitHub 拉取，不能推送**，因此只承担质量关卡；产出类角色全部放到另一台。

## 分工依据

| 角色 | 需要推送吗 | 放哪台 | 理由 |
|---|---|---|---|
| R1_CLARIFY 需求澄清 | 要（写 evidence） | **开发机** | 产物要落到分支 |
| R2_DEV 全栈开发 | 要 | **开发机** | 推交付分支 |
| R3_REVIEW 代码评审 | 不要 | **验收机（本机）** | 只读 diff |
| R4_QA 验收 | 不要 | **验收机（本机）** | 只读启动验证 |
| R5_MERGE 合并 | 要 | **开发机** | 合并推主干 |

**附带收益**：开发和验收不在同一台机器、不是同一个 agent 会话，「自己改自己说通过」从机制上就不可能发生。这比在提示词里写一百遍"不得篡改测试"都有效。

## 分支流转

```
开发机                                    验收机（本机）
──────                                    ──────────────
main
 └─ feat/wi-<工单ID>-<主题>   ──push──→   git fetch origin <分支>
      R2 提交、推分支                     git checkout <sha>（detached）
                                          R3 评审（只读）
                                          R4 启动双端验收（只读）
                                              │
                ←──── 结论通过 ───────────────┘
 R5 合并回 main ──push──→
```

验收机全程处于 **detached HEAD**，不产生任何提交，也就没有推送需求。

## 产物怎么处理（本节是本次关键调整）

原设计把产物写进 `evidence/` 并随分支提交。本机推不了，所以要分两种：

| 角色 | 所在机器 | 产物处理 |
|---|---|---|
| R1 / R2 | 开发机 | 照旧提交进分支（`evidence/requirements.md`、`evidence/dev.md`） |
| R3 / R4 | 本机 | **不提交**。写到工作区本地的 `evidence/`（加进 `.gitignore`），结论摘要写进 handoff 正文 |

如果平台支持工单附件，产物也可以用项目自带的命令上传，不走 git：

```powershell
npx -y @alicloud/autowonder@0.3.43 workitem upload --server-url <平台地址> --workitem-id <工单ID> --file evidence/review.md --json
```

这条命令是运行时自带的（`--help` 里能看到 `workitem upload / download`），但**本机是否已登录平台 API 侧未验证过**，第一次用之前先手工试一次，别放进自动化流程里赌。

## 本机需要准备的东西

| 项 | 状态 |
|---|---|
| 项目代码 | ✅ 已在 `d:\Work\autoWonder\autowonderTest` |
| 执行器 | 平台建 2 个：`R3_REVIEW`、`R4_QA`，各拿一套 token |
| `scripts/start-online.ps1` | ✅ 项目自带 |
| `qodercli-fast.cmd` | ✅ 项目自带 |
| `.env.local` | 分别填两个执行器的凭据（一机一套，不能复用） |
| 文档 | 见下方搬运清单 |

本机额外需要：**能 `git fetch` 到开发机推送的分支**（拉取是允许的，这没问题）。

## 开发机需要准备的东西

| 项 | 说明 |
|---|---|
| 项目代码 | `git clone https://github.com/ppztt/autowonderTest.git` |
| **GitHub 推送凭据** | PAT 或 SSH key，本机没有也不需要有 |
| 执行器 | 平台建 3 个：`R1_CLARIFY`、`R2_DEV`、`R5_MERGE` |
| `.env.local` | 3 套凭据，按角色分（或按需切换） |
| 安装步骤 | 照 [SETUP.md](../SETUP.md) 走 |

## 搬运清单

文档现在在 `d:\Work\autoWonder\`（仓库外面），本机推不上去，所以要手动搬。

| 文件 | 去向 | 方式 |
|---|---|---|
| `squads/autowonderTest-squad/README.md` | 开发机 | 拷进仓库 `docs/squad/`，由**开发机**提交 |
| `squads/autowonderTest-squad/paste-ready.md` | 开发机 | 同上 |
| `squads/autowonderTest-squad/backlog.md` | 开发机 | 同上 |
| `SETUP.md` | 两台都要 | 同上，或直接聊天工具传 |
| `PITFALLS.md` | 两台都要 | 同上 |
| `README.md`（工作区总览） | 两台都要 | 同上 |

**建议做法**：把这些文档拷到 `autowonderTest/docs/`，在开发机上提交一次。之后任何一台 `git pull` 就都有了，不用再手工搬。

本机已有的东西**不需要往外搬**：`.env.local` 里的 token 是这台机器专用的，搬过去也用不了（executor-id 绑机器）。

## 调整后的建角色顺序

**开发机（先做）**
```
建小队 → 建 SDLC 流程 → 建 R1_CLARIFY → 建 R2_DEV → 建 R5_MERGE
        → 建 3 个执行器 → 分别绑到三个角色
```

**验收机（本机，后做）**
```
建 R3_REVIEW → 建 R4_QA → 建 2 个执行器 → 分别绑到两个角色
```

SDLC 流程要在同一支小队下，两台机器看到的是同一套流程。

## 本机角色卡的必改项

原角色卡里 R3、R4 都写了「产物保存为 evidence/xxx.md」，需改成：

- 产物写本地 `evidence/`，**不执行 git add / commit / push**
- 结论摘要（通过/不通过、逐条结果、失败原因）写进 handoff 正文，平台侧能直接看到
- 交付分支通过 `git fetch origin feat/wi-<工单ID>-<主题>` 获取，`git checkout <sha>` 到 detached 状态

具体文本见 [paste-ready-split.md](./paste-ready-split.md)。
