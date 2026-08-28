$ErrorActionPreference = "Stop"

$serverPath = Join-Path $PSScriptRoot "server.ts"

if (-not (Test-Path $serverPath)) {
    throw "server.ts not found."
}

$content = Get-Content $serverPath -Raw

$importLine = "import { emailRouter } from './server/emailRoutes.ts';"

if ($content -notmatch [regex]::Escape($importLine)) {
    $notificationImport = "import { notificationRouter } from './server/notificationRoutes.ts';"

    if ($content -notmatch [regex]::Escape($notificationImport)) {
        throw "notificationRouter import was not found."
    }

    $content = $content.Replace(
        $notificationImport,
        "$notificationImport`r`n$importLine"
    )
}

$routeLine = "app.use(emailRouter);"

if ($content -notmatch [regex]::Escape($routeLine)) {
    $notificationRoute = "app.use(notificationRouter);"

    if ($content -notmatch [regex]::Escape($notificationRoute)) {
        throw "notificationRouter mount was not found."
    }

    $content = $content.Replace(
        $notificationRoute,
        "$notificationRoute`r`n$routeLine"
    )
}

Set-Content `
    -Path $serverPath `
    -Value $content `
    -Encoding UTF8

Write-Host ""
Write-Host "MirrorTrace email routes mounted successfully." -ForegroundColor Green
Write-Host ""