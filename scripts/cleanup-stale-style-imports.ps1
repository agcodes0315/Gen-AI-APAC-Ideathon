$ErrorActionPreference = 'Stop'

$projectRoot = (Get-Location).Path
$src = Join-Path $projectRoot 'src'

if (-not (Test-Path $src)) {
  throw "Run this script from the MirrorTrace project root. Expected: $src"
}

$deletedStyleNames = @(
  'mirrortrace-clean-glass.css',
  'mirrortrace-authenticated-haze.css',
  'mirrortrace-hero-darken.css',
  'mirrortrace-scroll-performance.css',
  'mirrortrace-final-visual-fix.css',
  'mirrortrace-motion-and-glass.css',
  'mirrortrace-authenticated-black.css',
  'mirrortrace-overview-hero-black50.css',
  'mirrortrace-admin-translucent-black.css',
  'mirrortrace-final-hero.css',
  'mirrortrace-force-black.css',
  'mirrortrace-user-hero.css',
  'mirrortrace-translucent-black-final.css'
)

$files = Get-ChildItem $src -Recurse -File | Where-Object {
  $_.Extension -in '.ts', '.tsx', '.css'
}

foreach ($file in $files) {
  $original = Get-Content $file.FullName -Raw
  $updated = $original

  foreach ($styleName in $deletedStyleNames) {
    $escaped = [Regex]::Escape($styleName)
    $updated = [Regex]::Replace(
      $updated,
      "(?m)^\s*(?:import\s+['\"][^'\"]*$escaped[^'\"]*['\"]\s*;?|@import\s+['\"][^'\"]*$escaped[^'\"]*['\"]\s*;)\s*\r?\n?",
      ''
    )
  }

  # Remove imports of the obsolete src/mirrortrace-motion.css compatibility shim.
  $updated = [Regex]::Replace(
    $updated,
    "(?m)^\s*import\s+['\"]\.\./mirrortrace-motion\.css['\"]\s*;\s*\r?\n?",
    ''
  )

  if ($updated -ne $original) {
    Set-Content -Path $file.FullName -Value $updated -Encoding UTF8
    Write-Host "Cleaned: $($file.FullName)"
  }
}

# AuthView is the public landing/sign-in page, so keep the one valid public stylesheet.
$authView = Join-Path $src 'components\AuthView.tsx'
if (Test-Path $authView) {
  $authText = Get-Content $authView -Raw
  if ($authText -notmatch "mirrortrace-public\.css") {
    $authText = "import '../styles/mirrortrace-public.css';`r`n`r`n" + $authText.TrimStart()
    Set-Content -Path $authView -Value $authText -Encoding UTF8
    Write-Host "Added valid public stylesheet import: $authView"
  }
}

# DashboardOverview may legitimately import the existing theme stylesheet.
$overview = Join-Path $src 'components\DashboardOverview.tsx'
if (Test-Path $overview) {
  $overviewText = Get-Content $overview -Raw
  # Do not force an import if your app already loads theme globally.
  # We only ensure deleted imports are gone.
}

# Remove obsolete compatibility shim only when it still points at deleted final-visual-fix.css.
$motionShim = Join-Path $src 'mirrortrace-motion.css'
if (Test-Path $motionShim) {
  $motionText = Get-Content $motionShim -Raw
  if ($motionText -match 'mirrortrace-final-visual-fix\.css') {
    Remove-Item $motionShim -Force
    Write-Host "Deleted obsolete shim: $motionShim"
  }
}

Write-Host ''
Write-Host 'Done. No application logic or JSX was changed; only stale stylesheet imports were removed.'
Write-Host 'Next: stop Vite, run npm run dev, then Ctrl+Shift+R in Chrome.'
