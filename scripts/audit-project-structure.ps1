param(
  [int]$MaxDepth = 4
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Write-Host ""
Write-Host "MirrorTrace Repository Audit" -ForegroundColor Cyan
Write-Host "Root: $root"
Write-Host ""

$excludedNames = @(
  ".git",
  "node_modules",
  "dist",
  ".cleanup-backup"
)

function Show-Tree {
  param(
    [string]$Path,
    [int]$Depth = 0,
    [int]$Limit = 4
  )

  if ($Depth -gt $Limit) {
    return
  }

  $items = Get-ChildItem -LiteralPath $Path -Force |
    Where-Object {
      $excludedNames -notcontains $_.Name
    } |
    Sort-Object @{ Expression = { -not $_.PSIsContainer } }, Name

  foreach ($item in $items) {
    $indent = "  " * $Depth
    $prefix = if ($item.PSIsContainer) { "[D]" } else { "[F]" }

    Write-Host "$indent$prefix $($item.Name)"

    if ($item.PSIsContainer) {
      Show-Tree -Path $item.FullName -Depth ($Depth + 1) -Limit $Limit
    }
  }
}

Write-Host "=== CLEAN SOURCE TREE (generated folders hidden) ===" -ForegroundColor Yellow
Show-Tree -Path $root -Limit $MaxDepth

Write-Host ""
Write-Host "=== GENERATED / REBUILDABLE ===" -ForegroundColor Yellow
foreach ($path in @("dist", "node_modules")) {
  $candidate = Join-Path $root $path
  if (Test-Path $candidate) {
    $size = (
      Get-ChildItem $candidate -Recurse -File -ErrorAction SilentlyContinue |
      Measure-Object -Property Length -Sum
    ).Sum

    $mb = if ($size) { [math]::Round($size / 1MB, 2) } else { 0 }
    Write-Host "$path  ($mb MB)"
  }
}

Write-Host ""
Write-Host "=== ROOT DOCUMENTATION CANDIDATES ===" -ForegroundColor Yellow
$docCandidates = @(
  "README.txt",
  "README-FIX.txt",
  "README-INSTALL.md",
  "README-INSTALL.txt",
  "FEATURE-BUILD-ROADMAP.txt",
  "AI-STUDIO-INTEGRATION-PROMPT.txt",
  "GITHUB-PUSH.txt",
  "RAG-NEXT-STEP.txt"
)

$docCandidates += (
  Get-ChildItem $root -File -Filter "PRODUCTION-CHECKLIST*.txt" -ErrorAction SilentlyContinue |
  ForEach-Object { $_.Name }
)

$docCandidates |
  Sort-Object -Unique |
  ForEach-Object {
    if (Test-Path (Join-Path $root $_)) {
      Write-Host $_
    }
  }

Write-Host ""
Write-Host "=== ONE-OFF PATCH SCRIPT CANDIDATES ===" -ForegroundColor Yellow
$scriptCandidates = @(
  "apply-black50-to-index.ps1",
  "apply-force-black50.ps1",
  "apply-target-audience.mjs",
  "apply-theme.ps1",
  "cleanup-old-style-imports.ps1",
  "cleanup-stale-style-imports.ps1",
  "fix-authview-feature-key.ps1",
  "fix-current-typescript-errors.ps1",
  "patch-production-hardening.ps1",
  "patch-support-review-routes.ps1",
  "black50-block.css"
)

foreach ($name in $scriptCandidates) {
  $candidate = Join-Path $root "scripts\$name"
  if (Test-Path $candidate) {
    Write-Host "scripts/$name"
  }
}

Write-Host ""
Write-Host "=== UNUSED STYLE CANDIDATES ===" -ForegroundColor Yellow

$styleDir = Join-Path $root "src\styles"
$protectedStyles = @(
  "mirrortrace-app.css",
  "mirrortrace-public.css",
  "mirrortrace-theme.css"
)

if (Test-Path $styleDir) {
  $searchFiles = Get-ChildItem $root -Recurse -File |
    Where-Object {
      $_.FullName -notmatch '\\node_modules\\' -and
      $_.FullName -notmatch '\\dist\\' -and
      $_.FullName -notmatch '\\.git\\' -and
      $_.Extension -in @(".ts", ".tsx", ".css", ".html", ".js", ".mjs")
    }

  foreach ($css in Get-ChildItem $styleDir -File -Filter "*.css") {
    if ($protectedStyles -contains $css.Name) {
      continue
    }

    $referenced = $false

    foreach ($source in $searchFiles) {
      if ($source.FullName -eq $css.FullName) {
        continue
      }

      $content = Get-Content $source.FullName -Raw -ErrorAction SilentlyContinue
      if ($content -and $content.Contains($css.Name)) {
        $referenced = $true
        break
      }
    }

    if (-not $referenced) {
      Write-Host "src/styles/$($css.Name)"
    }
  }
}

Write-Host ""
Write-Host "=== DUPLICATE FILE CONTENT (SHA256) ===" -ForegroundColor Yellow

$files = Get-ChildItem $root -Recurse -File |
  Where-Object {
    $_.FullName -notmatch '\\node_modules\\' -and
    $_.FullName -notmatch '\\dist\\' -and
    $_.FullName -notmatch '\\.git\\' -and
    $_.Length -gt 0
  }

$hashGroups = $files |
  ForEach-Object {
    try {
      [PSCustomObject]@{
        Hash = (Get-FileHash $_.FullName -Algorithm SHA256).Hash
        Path = $_.FullName.Substring($root.Length + 1)
      }
    } catch {}
  } |
  Group-Object Hash |
  Where-Object { $_.Count -gt 1 }

foreach ($group in $hashGroups) {
  Write-Host ""
  Write-Host "Duplicate group:" -ForegroundColor DarkYellow
  $group.Group | ForEach-Object { Write-Host "  $($_.Path)" }
}

Write-Host ""
Write-Host "=== GIT STATUS ===" -ForegroundColor Yellow
Push-Location $root
try {
  git status --short
} finally {
  Pop-Location
}

Write-Host ""
Write-Host "Audit complete." -ForegroundColor Green
Write-Host "Nothing was deleted."
