$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$src = Join-Path $projectRoot "src"
$styles = Join-Path $src "styles"
$app = Join-Path $src "App.tsx"
$theme = Join-Path $styles "mirrortrace-authenticated-black-50.css"

if (!(Test-Path $app)) {
    throw "src\App.tsx was not found. Run this script from the extracted package inside the MirrorTrace project."
}

if (!(Test-Path $theme)) {
    throw "Theme CSS file was not found: $theme"
}

$content = Get-Content $app -Raw
$import = "import './styles/mirrortrace-authenticated-black-50.css';"

if ($content -notmatch [regex]::Escape($import)) {
    $content = $import + "`r`n" + $content
    Set-Content -Path $app -Value $content -Encoding UTF8
    Write-Host "Added authenticated black-50 theme import to src\App.tsx"
}
else {
    Write-Host "Theme import already exists in src\App.tsx"
}

Write-Host ""
Write-Host "Next run:"
Write-Host "npm run lint"
Write-Host "npm run build"
Write-Host "npm run dev"
