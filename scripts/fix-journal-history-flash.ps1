$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$appPath = Join-Path $root "src\App.tsx"

if (-not (Test-Path -LiteralPath $appPath)) {
  throw "Could not find src\App.tsx"
}

$backup = "$appPath.before-history-flash-fix"
Copy-Item -LiteralPath $appPath -Destination $backup -Force

$app = [System.IO.File]::ReadAllText($appPath)

$old = 'className="mirrortrace-page-skin mirrortrace-history-page space-y-6 animate-fade-in"'
$new = 'className="mirrortrace-page-skin mirrortrace-history-page space-y-6"'

if ($app.Contains($old)) {
  $app = $app.Replace($old, $new)
}
elseif ($app -match 'mirrortrace-history-page[^"]*animate-fade-in') {
  $app = [regex]::Replace(
    $app,
    '(className="[^"]*mirrortrace-history-page[^"]*)\s+animate-fade-in([^"]*")',
    '$1$2',
    1
  )
}
else {
  Write-Host "The Journal History wrapper does not contain animate-fade-in." -ForegroundColor Yellow
}

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($appPath, $app, $utf8)

$check = Select-String -Path $appPath -Pattern 'mirrortrace-history-page.*animate-fade-in'

if ($check) {
  throw "The history wrapper still contains animate-fade-in. No further files were changed."
}

Write-Host ""
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host "Removed animate-fade-in ONLY from Journal History."
Write-Host ""
Write-Host "Backup:"
Write-Host "  src\App.tsx.before-history-flash-fix"
Write-Host ""
Write-Host "No CSS files were changed."
Write-Host ""
Write-Host "Restart:"
Write-Host "  Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run dev"
