# AutoWonder 接入踩坑记录

> 新机器从零接入的完整步骤见 [SETUP.md](./SETUP.md)。本文只回答一个问题：**哪里会炸**。

按「现象 → 真因 → 怎么避」组织。下次按这个顺序检查，能省掉大部分排障时间。

## 一、平台契约（最容易被"想当然"坑）

| 坑 | 现象 | 真因 | 怎么避 |
|---|---|---|---|
| 包名/版本不是猜的 | `npx autowonder@0.2.130` 跑不起来 | 平台实际用 `@alicloud/autowonder@0.3.43` | **先 Base64 解码平台给的命令再执行**，包名、版本、参数逐个核对 |
| 模型名称 | 用了 README 示例的 `qmodel_latest` | 平台实际是 `bailian/deepseek-v4-flash-0731-tp` | README 的示例是示例；以执行器页面生成的命令为准 |
| 规则放错层 | AGENT.md 写"最多退回两轮"却没生效 | 平台有「检查项」「策略」两个专门配置位，规则写 prompt 里只是建议 | 硬约束配在平台层，AGENT.md 只写角色能力与判定标准 |
| 交接方式 | 写"下游是 R2"，平台不认 | 平台用结构化 handoff：`toType=AGENT` + `nextRole=xxx` | 每条流程执行说明结尾都带上这两个字段 |
| 角色码编号 | 自拟 `R1/R2/R3`，与已有体系冲突 | 若依体系里 `DEV=R3` | 先确认平台的编号语义，全局统一后再填 |

## 二、认证探针（本次最痛的 3 小时）

| 坑 | 现象 | 真因 | 怎么避 |
|---|---|---|---|
| "requires login" 不等于登录失败 | 浏览器授权成功、`qodercli status` 显示已登录，connect 仍报未登录 | 认证探针子进程超时（exit 124）被误判为未登录 | 用 `connect --debug` 看它**实际执行了什么命令**，不要凭报错文案猜 |
| 探针跑两次 | 第一次 `status=0` 成功，第二次 `status=124` 超时 | 探针执行 `qodercli --list-models` 两次，该命令本机需 17-23 秒 | 报错文案会明确说 "the **second** authentication probe"，注意这个关键词 |
| 超时不可调 | 设 `AUTOWONDER_QODER_CONTROL_TIMEOUT=180` 无效 | 该变量不控制探针超时，探针超时硬编码（约 18 秒） | 别在超时上耗时间，转向"让探针变快" |
| 解法 | — | — | `AUTOWONDER_QODER_CLI` 指向包装脚本，对 `--list-models` 秒回缓存列表，其余转发 |
| 冷启动慢的锅不在 MCP | `qodercli -p` 要 24-33 秒 | 内置工具初始化占大头；MCP 只占 4 秒，插件无影响，工作区大小无影响 | `--tools ""` 能降到 6.2 秒可验证；但真跑任务不能禁工具，别指望这条路 |

**关键一条**：`qodercli --list-models` 在装了较多插件/工具链的 Windows 机器上要 17-23 秒。这个信息值得反馈给平台——探针超时应该可配，或者探针换更轻的命令。

## 三、参数陷阱

| 坑 | 现象 | 真因 | 怎么避 |
|---|---|---|---|
| `--token-aware-enable` | ws 连上了，紧接着 `TokenProxy helper exceeded hard deadline` 然后退出 | 该参数拉起 TokenProxy 辅助进程，本机起不来 | 去掉它。代价是平台 token 用量统计不准，不影响任务执行 |
| `--provider` | 传 claude / codex 被拒绝 | 0.3.43 只认 `qoder` 和 `qodercn` | 别沿用旧版文档里的 provider 列表 |

## 四、Windows / PowerShell 环境

| 坑 | 现象 | 真因 | 怎么避 |
|---|---|---|---|
| **.ps1 编码** | 报一堆"意外的标记""字符串缺少终止符"，位置还对不上 | 文件是 UTF-8 **无 BOM**，PS 5.1 按 GBK 读，中文乱码后引号配对错乱 | 写 `.ps1` 一律存 **UTF-8 with BOM**，写完用 `[Parser]::ParseFile` 校验语法 |
| **管道截断杀进程** | connect 显示成功，status 却是 stopped | `Select-Object -First N` 提前关闭管道，把常驻进程一起杀了 | 常驻命令不要接截断管道；要落盘用 `Tee-Object`，或让它自然转后台 |
| 沙箱写 HOME | 改 `~/.qoder/mcp.json` 被拒绝，对照实验结果全 0 | 沙箱只允许写工作区 | 前置操作后必须 `Test-Path` 校验真的生效，否则会得到假结论 |
| npm 全局 prefix | `npm i -g` 成功但命令找不到 | prefix 指向 `nvm\v18.20.8\node_global`，PATH 上是 `nodejs\node_global` | CLI 装到**工作区** `node_modules`，启动脚本前置 PATH，不碰全局 |
| corepack 损坏 | `corepack pnpm` 报 MODULE_NOT_FOUND | ⸺ | 用 `npx -y pnpm@10.30.2 <cmd>` 直接调 |
| 后台进程活不下来 | 工具会话里起的 connect 很快就没了 | 会话隔离 | 常驻进程交给用户自己的窗口跑，脚本写好给他 |

## 五、读代码前别下结论（项目知识类）

| 坑 | 现象 | 真因 | 怎么避 |
|---|---|---|---|
| 把已有功能当需求 | 设计了"新增 About 页""新增语言""主题持久化"三个工单 | 项目里全都有：`about.md` 已存在、18 种语言、`useDark` 已持久化 | **先 clone 跑起来 + 读代码，再设计工单** |
| 把框架约定当 bug | agent 容易给"没写 import"的代码补 import | AutoImport 自动注入 `composables/**`、`stores/**` | 知识库必须固化"反直觉约定"，目录树没这个价值 |
| 单测挂住 | `pnpm test` 在自动化里不退出 | 脚本是 `vitest`（watch 模式） | 一律用 `pnpm exec vitest run` |
| diff 变多 | 交付的 diff 比自述改动多出格式化内容 | pre-commit 钩子 `lint-staged + eslint --fix` 会自动改文件 | 评审规则里要能区分"格式化"与"逻辑改动" |

## 六、排查方法（元经验，比具体坑更值钱）

1. **先解码再执行**。平台给的是 EncodedCommand，不先看内容就盲跑，会发现所有假设都是错的。
2. **一次只改一个变量**。这次逐层测了：默认 → `--tools ""` → 仅禁 MCP → 空目录 → 独立 config → 才定位到工具初始化。一次改三个只会得到"好像快了点"。
3. **区分"快"和"失败得快"**。干净 config 目录测出 6.2 秒，一度以为是配置问题——实际是未登录直接退出的假快。
4. **`--debug` 是唯一的真相入口**。"requires login" 这种文案会误导，只有它能显示出实际执行的命令、退出码、两次探针的区别。
5. **怀疑工具时先看它有没有隐藏开关**。daemon 二进制里有一批 `AUTOWONDER_*` 环境变量，从 exe 里 grep 字符串就能拿到清单（`AUTOWONDER_QODER_CLI` 就是这么找到的）。

## 下次接入的推荐顺序

```
1. 解码平台命令，逐项核对包名/版本/模型/参数
2. 装依赖，本地跑通 install / test / build（不碰平台）
3. qodercli login，确认 status 已登录
4. connect --debug 起一次，看探针是否 124
5. 若 124 → 挂 qodercli-fast.cmd 包装，再去掉 --token-aware-enable
6. 看到 "ws connected executorId=xxx" 才算通
7. 平台确认在线后，再建第二个角色
```
