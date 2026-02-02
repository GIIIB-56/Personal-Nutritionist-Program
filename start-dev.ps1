Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot "BE"
$frontendPath = Get-ChildItem -LiteralPath $projectRoot -Directory |
  Where-Object { $_.Name -ne "BE" -and (Test-Path (Join-Path $_.FullName "package.json")) } |
  Select-Object -First 1 -ExpandProperty FullName

if (-not $frontendPath) {
  throw "Frontend folder not found (missing package.json)."
}

Write-Host "Starting backend in background job..."
$backendJob = Start-Job -ScriptBlock {
  param($path)
  Set-Location $path
  node server.js
} -ArgumentList $backendPath

Write-Host "Starting frontend in this window..."
try {
  Set-Location $frontendPath
  npm run dev
} finally {
  if ($backendJob.State -eq "Running") {
    Stop-Job $backendJob | Out-Null
  }
  Remove-Job $backendJob | Out-Null
}
