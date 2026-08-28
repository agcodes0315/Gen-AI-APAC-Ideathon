$ErrorActionPreference = "Stop"

$serverPath = Join-Path $PSScriptRoot "..\server.ts"
$serverPath = [System.IO.Path]::GetFullPath($serverPath)
$content = Get-Content $serverPath -Raw

$importLine = "import { supportReviewRouter } from './server/supportReviewRoutes.ts';"
$mountLine = "app.use(supportReviewRouter);"

if ($content -notmatch [regex]::Escape($importLine)) {
    $anchor = "import { emailRouter } from './server/emailRoutes.ts';"
    if ($content -notmatch [regex]::Escape($anchor)) {
        throw "Could not find emailRouter import anchor."
    }
    $content = $content.Replace($anchor, "$anchor`r`n$importLine")
}

if ($content -notmatch [regex]::Escape($mountLine)) {
    $anchor = "app.use(adminRouter);"
    if ($content -notmatch [regex]::Escape($anchor)) {
        throw "Could not find app.use(adminRouter) mount anchor."
    }
    $content = $content.Replace($anchor, "$anchor`r`n$mountLine")
}

Set-Content -Path $serverPath -Value $content -Encoding UTF8
Write-Host "server.ts updated successfully."
