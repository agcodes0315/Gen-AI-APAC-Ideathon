$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

$adminPath = Join-Path $root "src\components\AdminDashboard.tsx"
$authPath  = Join-Path $root "src\components\AuthView.tsx"

if (-not (Test-Path $adminPath)) {
  throw "AdminDashboard.tsx not found."
}

if (-not (Test-Path $authPath)) {
  throw "AuthView.tsx not found."
}

# ------------------------------------------------------------------
# 1. AdminDashboard.tsx
# React key is moved to a native wrapper so the local component prop
# type does not need to declare key.
# ------------------------------------------------------------------

$admin = Get-Content $adminPath -Raw

$admin = [regex]::Replace(
  $admin,
  '(?s)<SupportTicketCard\s+key=\{\s*ticket\.id\s*\}\s+ticket=\{\s*ticket\s*\}\s+onSaved=\{\s*load\s*\}\s*/>',
  '<div key={ticket.id}><SupportTicketCard ticket={ticket} onSaved={load} /></div>'
)

$admin = [regex]::Replace(
  $admin,
  '(?s)<ReviewModerationCard\s+key=\{\s*review\.id\s*\}\s+review=\{\s*review\s*\}\s+onSaved=\{\s*load\s*\}\s*/>',
  '<div key={review.id}><ReviewModerationCard review={review} onSaved={load} /></div>'
)

Set-Content -Path $adminPath -Value $admin -Encoding UTF8

# ------------------------------------------------------------------
# 2. AuthView.tsx
# Fix multiline JSX string literals such as:
# direction="
#   left
# "
# which TypeScript correctly rejects as not being exactly "left".
# ------------------------------------------------------------------

$auth = Get-Content $authPath -Raw

$auth = [regex]::Replace(
  $auth,
  'direction="\s*left\s*"',
  'direction="left"'
)

$auth = [regex]::Replace(
  $auth,
  'direction="\s*right\s*"',
  'direction="right"'
)

Set-Content -Path $authPath -Value $auth -Encoding UTF8

Write-Host ""
Write-Host "MirrorTrace TypeScript stability fixes applied." -ForegroundColor Green
Write-Host "Updated:"
Write-Host "  src/components/AdminDashboard.tsx"
Write-Host "  src/components/AuthView.tsx"
Write-Host ""
Write-Host "Now run:"
Write-Host "  npm run lint"
Write-Host "  npm run build"
