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
