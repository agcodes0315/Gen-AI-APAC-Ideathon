$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$src = Join-Path $projectRoot "src"

$oldFiles = @(
  "mirrortrace-clean-glass.css",
  "mirrortrace-authenticated-haze.css",
  "mirrortrace-hero-darken.css",
  "mirrortrace-scroll-performance.css",
  "mirrortrace-final-visual-fix.css",
  "mirrortrace-final-hero.css"
)

Write-Host "Scanning TypeScript/TSX files for obsolete CSS imports..."

Get-ChildItem -Path $src -Recurse -File |
  Where-Object { $_.Extension -in ".ts", ".tsx", ".js", ".jsx" } |
  ForEach-Object {
    $path = $_.FullName
    $content = Get-Content -Raw -Path $path
    $original = $content

    foreach ($name in $oldFiles) {
      $escaped = [regex]::Escape($name)
      $content = [regex]::Replace(
        $content,
        "(?m)^\s*import\s+['""][^'""]*$escaped['""];\s*\r?\n?",
        ""
      )
    }

    if ($content -ne $original) {
      Set-Content -Path $path -Value $content -Encoding UTF8
      Write-Host "Cleaned imports:" $path
    }
  }

Write-Host ""
Write-Host "Deleting obsolete CSS files if they still exist..."

foreach ($name in $oldFiles) {
  $path = Join-Path $src "styles\$name"
  if (Test-Path $path) {
    Remove-Item $path -Force
    Write-Host "Deleted:" $path
  }
}

Write-Host ""
Write-Host "Done. Keep src/styles/mirrortrace-theme.css."
Write-Host "Restart the Vite dev server after running this script."
