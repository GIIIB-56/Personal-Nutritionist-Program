Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "BE"
$frontendPath = Join-Path $projectRoot "bee"

if (-not (Test-Path (Join-Path $frontendPath "package.json"))) {
  throw "Frontend folder not found at 'bee' (missing package.json)."
}

Write-Host "Starting backend in background job..."
$backendJob = Start-Job -ScriptBlock {
  param($path)
  Set-Location $path
  node server.js
} -ArgumentList $backendPath

Write-Host "Starting frontend (bee) in this window..."
try {
  Set-Location $frontendPath
  Start-Job -ScriptBlock {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:5173"
  } | Out-Null
  npm run dev
} finally {
  if ($backendJob.State -eq "Running") {
    Stop-Job $backendJob | Out-Null
  }
  Remove-Job $backendJob | Out-Null
}
