$ErrorActionPreference = "Stop"

$project = Split-Path -Parent $PSScriptRoot
$index = Join-Path $project "src\index.css"

if (!(Test-Path $index)) {
    throw "src\index.css not found."
}

$marker = "/* MIRRORTRACE — AUTHENTICATED BLACK 50 HARD FIX */"
$blockPath = Join-Path $PSScriptRoot "black50-block.css"
$block = Get-Content $blockPath -Raw

$content = Get-Content $index -Raw

# Remove an older copy of this exact hard-fix block if present.
$start = $content.IndexOf("/* ============================================================" + "`r`n" + "   MIRRORTRACE — AUTHENTICATED BLACK 50 HARD FIX")
if ($start -lt 0) {
    $start = $content.IndexOf("/* ============================================================" + "`n" + "   MIRRORTRACE — AUTHENTICATED BLACK 50 HARD FIX")
}
if ($start -ge 0) {
    $content = $content.Substring(0, $start).TrimEnd()
}

$content = $content.TrimEnd() + "`r`n`r`n" + $block + "`r`n"
Set-Content -Path $index -Value $content -Encoding UTF8

Write-Host ""
Write-Host "Done: black-50 hard fix appended to the ABSOLUTE END of src/index.css"
Write-Host ""
Write-Host "Now run:"
Write-Host "npm run dev"
Write-Host ""
Write-Host "Then hard refresh Chrome: Ctrl + Shift + R"
