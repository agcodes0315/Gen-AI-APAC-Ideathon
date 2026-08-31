$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$indexCss = Join-Path $projectRoot "src\index.css"
$blockCss = Join-Path $PSScriptRoot "black50-block.css"

if (!(Test-Path $indexCss)) {
    throw "Could not find src\index.css"
}

if (!(Test-Path $blockCss)) {
    throw "Could not find scripts\black50-block.css"
}

$startMarker = "/* ============================================================"
$titleMarker = "MIRRORTRACE AUTHENTICATED BLACK 50 HARD FIX"

$existing = Get-Content -Path $indexCss -Raw
$block = Get-Content -Path $blockCss -Raw

# Remove an older copy of this same hard-fix block, if present.
$titlePos = $existing.IndexOf($titleMarker)

if ($titlePos -ge 0) {
    $blockStart = $existing.LastIndexOf($startMarker, $titlePos)

    if ($blockStart -ge 0) {
        $existing = $existing.Substring(0, $blockStart).TrimEnd()
    }
}

$updated = $existing.TrimEnd() + "`r`n`r`n" + $block.Trim() + "`r`n"

Set-Content -Path $indexCss -Value $updated -Encoding UTF8

Write-Host ""
Write-Host "SUCCESS"
Write-Host "Black-50 CSS appended to the absolute end of:"
Write-Host $indexCss
Write-Host ""
Write-Host "Next run:"
Write-Host "npm run dev"
Write-Host ""
Write-Host "Then hard refresh Chrome with Ctrl + Shift + R"
