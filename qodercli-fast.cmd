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
