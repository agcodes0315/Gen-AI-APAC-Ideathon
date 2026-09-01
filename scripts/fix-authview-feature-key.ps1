$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$authPath = Join-Path $root "src\components\AuthView.tsx"

if (-not (Test-Path $authPath)) {
    throw "AuthView.tsx was not found at: $authPath"
}

$content = Get-Content $authPath -Raw
$original = $content

# Fix the exact props type used by the feature-card renderer.
# TypeScript is rejecting JSX key because the local props object
# does not currently declare it.
#
# We add:
#   key?: React.Key;
#
# to any object type that contains:
#   card: FeatureCard;
#   index: number;
#   total: number;
#   direction: 'left' | 'right';
#
# This does not change rendering or runtime behavior.

$pattern = '(?s)(\{\s*)(card\s*:\s*FeatureCard\s*;\s*index\s*:\s*number\s*;\s*total\s*:\s*number\s*;\s*direction\s*:\s*[''"]left[''"]\s*\|\s*[''"]right[''"]\s*;)'

if ($content -match $pattern) {
    $content = [regex]::Replace(
        $content,
        $pattern,
        '$1key?: React.Key;`r`n  $2',
        1
    )
} else {
    throw @"
Could not locate the FeatureCard props type in AuthView.tsx.

Please do NOT make any other changes.
Search AuthView.tsx for:

  card: FeatureCard
  index: number
  total: number
  direction: 'left' | 'right'

and send that small block if this script cannot find it.
"@
}

if ($content -eq $original) {
    Write-Host "No change was required." -ForegroundColor Yellow
    exit 0
}

Set-Content -Path $authPath -Value $content -Encoding UTF8

Write-Host ""
Write-Host "AuthView FeatureCard key typing fixed." -ForegroundColor Green
Write-Host "Updated:"
Write-Host "  src/components/AuthView.tsx"
Write-Host ""
Write-Host "Now run:"
Write-Host "  npm run lint"
Write-Host "  npm run build"
Write-Host ""
