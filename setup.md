# 新机器从零接入（Runbook）

给另一台 Windows 机器用。按顺序执行，每步都有验收点，不通过就别往下走。

**最重要的一条**：每台机器必须在平台**各自新建一个执行器**，拿到自己的 `executor-id` 和 `token`。
两台机器用同一个 `executor-id` 会互相抢任务，这是最容易犯的错。

---

## 步骤 0：环境检查（3 分钟）

```powershell
node -v
npm -v
git --version
"prefix: " + (npm config get prefix)
($env:PATH -split ';') | Where-Object { $_ -match 'node' }
```

| 项 | 要求 | 不满足怎么办 |
|---|---|---|
| Node | 20 以上（本项目实测 22.17.1） | 升级 Node |
| npm | 10 以上 | 随 Node |
| git | 任意版本 | 安装 Git for Windows |

**关键判断**：看 `npm config get prefix` 输出的路径，是否出现在下面 PATH 列表里。

- 在 → 可以全局安装
- **不在 → 不要用 `npm i -g`**，直接跳到步骤 2 用工作区安装（本次踩过这个坑：装在 nvm 的 v18 目录，PATH 上是另一个目录，装了找不到）

## 步骤 1：建工作目录

```powershell
mkdir d:\Work\autoWonder -Force
cd d:\Work\autoWonder
```

路径随意，但下面所有命令都用这个路径，换路径要同步改脚本里的 `$root` 逻辑。

## 步骤 2：把 qodercli 装到工作区

```powershell
cd d:\Work\autoWonder
npm i @qoder-ai/qodercli@1.1.95 --no-audit --no-fund
```

**验收**：

```powershell
.\node_modules\.bin\qodercli.cmd --version    # 应输出 1.1.95
```

装在工作区而不是全局，是为了避开 prefix 与 PATH 不一致的问题。之后靠脚本前置 PATH 让它生效。

## 步骤 3：登录 qodercli

```powershell
cd d:\Work\autoWonder
.\node_modules\.bin\qodercli.cmd login
```

浏览器会打开授权页，确认授权。

**验收**：

```powershell
.\node_modules\.bin\qodercli.cmd status
```

必须看到 `Email: xxx@xxx` 和 `Login Method: browser`。如果还是 `Not logged in`，别继续，先解决登录。

## 步骤 4：建探针加速包装

在 `d:\Work\autoWonder\qodercli-fast.cmd` 写入：

```bat
@echo off
rem autowonder auth probe runs "qodercli --list-models", which takes 17-23s on this
rem machine and exceeds the probe timeout, causing a false "not logged in".
rem This wrapper answers the probe instantly and forwards everything else.
setlocal

if "%~1"=="--list-models" (
  echo MODEL
  echo Auto
  echo Ultimate
  echo Fast
  echo Efficient
  echo Sonus
  echo Cantus
  echo Qwen4-Max
  echo Qwen3.8-Max
  echo Qwen3.8-Flash
  echo Kimi-K3.1-Pro
  echo Kimi-K2.8-Preview
  echo GLM-5.3
  echo GLM-5.3-Flash
  echo DeepSeek-V4-Pro
  echo DeepSeek-Flash
  echo MiniMax-M3.1-Flash
  exit /b 0
)

"%~dp0node_modules\.bin\qodercli.cmd" %*
```

**验收**：

```powershell
.\qodercli-fast.cmd --list-models
```

应该**瞬间**返回 16 行模型名。如果卡几秒才出，说明 `if` 没命中，检查参数是不是 `--list-models`（注意是双横线）。

**这一步为什么必须有**：不装它，connect 会一直报"需要登录"并反复弹浏览器，而实际你已经登录了。原因是探针超时被误判。

## 步骤 5：建凭据文件

平台「数字员工 → 执行器」里新建执行器，复制生成的命令，取出三个值。

在 `d:\Work\autoWonder\.env.local` 写入（**这个文件不能提交到 git**）：

```
AUTOWONDER_WS_URL=ws://<平台地址>/ws/executor
AUTOWONDER_TOKEN=<你的 token>
AUTOWONDER_EXECUTOR_ID=<你的执行器 ID>
```

同时在 `.gitignore` 里加一行 `.env.local`。

## 步骤 6：建启动脚本

在 `d:\Work\autoWonder\scripts\start-online.ps1` 写入下面内容。

> **编码要求**：必须存成 **UTF-8 with BOM**。用记事本/Win10+ 默认存成无 BOM 的 UTF-8，PowerShell 5.1 会按 GBK 读，中文全部乱码并报一堆假语法错误。
> 稳妥做法是用 PowerShell 生成（自带 BOM）。

```powershell
param(
  [int]$MaxTasks = 2,
  [string]$Model = "bailian/deepseek-v4-flash-0731-tp",
  [ValidateSet("none", "low", "medium", "high", "xhigh", "max")]
  [string]$ReasoningEffort = "high",
  [ValidateSet("260000", "400000", "1000000")]
  [string]$ContextWindow = "1000000"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

$envFile = Join-Path $root ".env.local"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
    $k, $v = $_.Split('=', 2)
    Set-Item -Path ("env:" + $k.Trim()) -Value $v.Trim()
  }
}

$wsUrl = $env:AUTOWONDER_WS_URL
$token = $env:AUTOWONDER_TOKEN
$executorId = $env:AUTOWONDER_EXECUTOR_ID
$missing = @()
if (-not $wsUrl) { $missing += "AUTOWONDER_WS_URL" }
if (-not $token) { $missing += "AUTOWONDER_TOKEN" }
if (-not $executorId) { $missing += "AUTOWONDER_EXECUTOR_ID" }
if ($missing.Count -gt 0) {
  Write-Host "[online] 缺少：" ($missing -join ", ")
  exit 1
}

$env:PATH = (Join-Path $root "node_modules\.bin") + ";" + $env:PATH
$env:AUTOWONDER_QODER_CLI = Join-Path $root "qodercli-fast.cmd"

Write-Host "[online] executor=$executorId model=$Model maxTasks=$MaxTasks"
Write-Host "[online] 保持本窗口开启，Ctrl+C 即离线"

npx -y @alicloud/autowonder@0.3.43 connect `
  --ws-url $wsUrl `
  --token $token `
  --executor-id $executorId `
  --provider qoder `
  --memory-mode platform `
  --max-tasks $MaxTasks `
  --model $Model `
  --reasoning-effort $ReasoningEffort `
  --context-window $ContextWindow

exit $LASTEXITCODE
```

生成文件并校验：

```powershell
$p = "d:\Work\autoWonder\scripts\start-online.ps1"
$c = [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText($p, $c, (New-Object System.Text.UTF8Encoding($true)))

$err = $null
[void][System.Management.Automation.Language.Parser]::ParseFile($p, [ref]$null, [ref]$err)
if ($err.Count -eq 0) { "语法 OK" } else { $err[0].Message }
```

**验收**：输出 `语法 OK`。

## 步骤 7：启动并验证

```powershell
cd d:\Work\autoWonder
powershell -NoProfile -ExecutionPolicy Bypass -File scripts\start-online.ps1
```

按顺序看到这些才算通：

| # | 期望输出 | 没出现说明 |
|---|---|---|
| 1 | `Qoder CLI is installed and authenticated (qodercli-fast.cmd ...)` | 步骤 4 的包装没生效 |
| 2 | `Connecting to ws://...` | 网络到平台不通 |
| 3 | `Provider: qoder` / `Name: daemon_qoder_<id>` | 参数没传对 |
| 4 | **`ws connected executorId=<id>`** | 到这里才算真通了 |
| 5 | `TokenProxy helper exceeded hard deadline` | ⚠️ 不该出现；出现说明 `--token-aware-enable` 还在，去掉它 |

**窗口必须一直开着**，关掉或 Ctrl+C 平台就显示离线。

平台侧确认：执行器页面从 `0/1` 变成在线。

## 步骤 8：平台侧配置顺序

```
1. 建小队
2. 建 SDLC 流程（内容见 squads/vitesse-squad/paste-ready.md）
3. 建数字员工（角色名称 / 角色码 / SOUL.md / AGENT.md / 绑定流程）
4. 建执行器（就是步骤 5 用的那个），复制 ws-url / token / executor-id
5. 把执行器绑到角色
6. 建一张工单，让它流到第一个角色
```

**顺序不能乱**：角色要先绑 SDLC 流程，执行器再绑角色。反过来配会发现执行器没地方挂。

## 步骤 9：第一单验证

用工单 1（新增 Changelog 页）这种最简单的需求跑一次，只看链路通不通，不看产出质量。

判定成功的标准：**执行器有执行记录 + 工单状态流转 + 本机窗口有任务日志**，三条都满足。

---

## 失败对照

| 现象 | 先查这个 |
|---|---|
| 反复弹浏览器登录 | 步骤 4 的包装没生效，或 `AUTOWONDER_QODER_CLI` 没指向它 |
| `TokenProxy helper exceeded hard deadline` | 命令里还有 `--token-aware-enable`，删掉 |
| `status` 显示 stopped 但窗口在跑 | 端口是动态的，`status` 查的是默认 34989；用窗口日志判断 |
| connect 一启动就退出 | 命令接了 `\| Select-Object -First N` 管道，截断会杀掉进程 |
| 脚本报"意外的标记" | `.ps1` 不是 UTF-8 with BOM |
| `qodercli` 找不到 | PATH 没前置 `node_modules\.bin` |

详细根因见 [PITFALLS.md](./PITFALLS.md)。

## 文件清单（新机器最终应有）

```
d:\Work\autoWonder\
├─ .env.local               ← 凭据（不提交）
├─ .gitignore               ← 含 .env.local 与 node_modules/
├─ package.json             ← 可选，用于 npm run online
├─ qodercli-fast.cmd        ← 探针加速包装
├─ node_modules\            ← 只装了 qodercli
└─ scripts\
    └─ start-online.ps1     ← UTF-8 with BOM
```

## 另一台机器与这台机器的关系

| 项 | 规则 |
|---|---|
| executor-id / token | **每台机器各自独立**，不能复用 |
| ws-url | 通常相同（同一个平台） |
| 模型 / context-window | 相同，以平台页面生成的为准 |
| 工作区与日志 | 各自本地，互不影响 |
| 同一角色绑多台机器 | 需先确认平台是否支持；不支持就只能一机一执行器 |

如果要在两台机器上跑同一个角色，先去平台确认「一个角色能否绑定多个执行器」，别直接起两个窗口试——可能抢任务。