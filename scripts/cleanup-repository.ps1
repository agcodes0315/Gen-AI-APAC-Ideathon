param(
  [switch]$Execute,
  [switch]$RemoveUnusedStyles
)

$ErrorActionPreference = "Stop"

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path

Push-Location $root

try {
  $gitDir = git rev-parse --git-dir 2>$null

  if (-not $gitDir) {
    throw "This folder is not a Git repository."
  }

  $dirty = git status --porcelain

  if ($dirty) {
    Write-Host ""
    Write-Host "STOPPED: your working tree has uncommitted changes." -ForegroundColor Red
    Write-Host ""
    Write-Host "Create a checkpoint first:"
    Write-Host '  git add .; git commit -m "Checkpoint before repository cleanup"'
    Write-Host ""
    Write-Host "Then run this cleanup command again."
    exit 1
  }

  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $tag = "pre-cleanup-$timestamp"

  git tag $tag

  Write-Host ""
  Write-Host "Created restore point: $tag" -ForegroundColor Green
  Write-Host "Restore later with:"
  Write-Host "  git reset --hard $tag"
  Write-Host ""

  $remove = New-Object System.Collections.Generic.List[string]

  # Generated build output. public/ is the source; dist/ is rebuilt by Vite.
  if (Test-Path (Join-Path $root "dist")) {
    $remove.Add("dist")
  }

  # Historical/export folder visible in the current project screenshots.
  if (Test-Path (Join-Path $root "mirrortrace_updated")) {
    $remove.Add("mirrortrace_updated")
  }

  # Consolidated into README.md.
  $docs = @(
    "README.txt",
    "README-FIX.txt",
    "README-INSTALL.md",
    "README-INSTALL.txt",
    "FEATURE-BUILD-ROADMAP.txt",
    "AI-STUDIO-INTEGRATION-PROMPT.txt",
    "GITHUB-PUSH.txt",
    "RAG-NEXT-STEP.txt"
  )

  $docs += (
    Get-ChildItem $root -File -Filter "PRODUCTION-CHECKLIST*.txt" -ErrorAction SilentlyContinue |
    ForEach-Object { $_.Name }
  )

  foreach ($doc in ($docs | Sort-Object -Unique)) {
    if (Test-Path (Join-Path $root $doc)) {
      $remove.Add($doc)
    }
  }

  # One-off migration/patch scripts that should not be part of the final repo.
  $oneOff = @(
    "scripts/apply-black50-to-index.ps1",
    "scripts/apply-force-black50.ps1",
    "scripts/apply-target-audience.mjs",
    "scripts/apply-theme.ps1",
    "scripts/cleanup-old-style-imports.ps1",
    "scripts/cleanup-stale-style-imports.ps1",
    "scripts/fix-authview-feature-key.ps1",
    "scripts/fix-current-typescript-errors.ps1",
    "scripts/patch-production-hardening.ps1",
    "scripts/patch-support-review-routes.ps1",
    "scripts/black50-block.css"
  )

  foreach ($item in $oneOff) {
    if (Test-Path (Join-Path $root $item)) {
      $remove.Add($item)
    }
  }

  if ($RemoveUnusedStyles) {
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
          $relative = $css.FullName.Substring($root.Length + 1)
          $remove.Add($relative)
        }
      }
    }
  }

  Write-Host "The following items are cleanup candidates:" -ForegroundColor Yellow

  if ($remove.Count -eq 0) {
    Write-Host "  Nothing to remove."
  } else {
    $remove | Sort-Object -Unique | ForEach-Object {
      Write-Host "  $_"
    }
  }

  if (-not $Execute) {
    Write-Host ""
    Write-Host "Preview only. Nothing was removed." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To execute the safe cleanup:"
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-repository.ps1 -Execute"
    Write-Host ""
    Write-Host "To ALSO remove unreferenced legacy CSS:"
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\scripts\cleanup-repository.ps1 -Execute -RemoveUnusedStyles"
    exit 0
  }

  foreach ($relative in ($remove | Sort-Object -Unique)) {
    $target = Join-Path $root $relative

    if (Test-Path $target) {
      Remove-Item -LiteralPath $target -Recurse -Force
      Write-Host "Removed: $relative" -ForegroundColor DarkGray
    }
  }

  Write-Host ""
  Write-Host "Cleanup complete." -ForegroundColor Green
  Write-Host ""
  Write-Host "Now verify before committing:"
  Write-Host "  npm run lint"
  Write-Host "  npm run build"
  Write-Host "  git status"
  Write-Host ""
  Write-Host "If everything is correct:"
  Write-Host '  git add .; git commit -m "Clean repository structure"; git push origin main'
  Write-Host ""
  Write-Host "Emergency restore point:"
  Write-Host "  $tag"

} finally {
  Pop-Location
}
