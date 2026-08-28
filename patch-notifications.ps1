$ErrorActionPreference = "Stop"

$serverPath = Join-Path $PSScriptRoot "server.ts"

if (-not (Test-Path $serverPath)) {
    throw "server.ts was not found at $serverPath"
}

$content = Get-Content $serverPath -Raw

$importLine = "import { notificationRouter } from './server/notificationRoutes.ts';"

if ($content -notmatch [regex]::Escape($importLine)) {
    $marker = "const app = express();"

    if ($content -notmatch [regex]::Escape($marker)) {
        throw "Could not locate 'const app = express();' in server.ts"
    }

    $content = $content.Replace(
        $marker,
        "$importLine`r`n`r`n$marker"
    )
}

$routeLine = "app.use(notificationRouter);"

if ($content -notmatch [regex]::Escape($routeLine)) {
    $marker = "/* ============================================================`r`n   3. HEALTH ROUTE"

    if ($content -notmatch [regex]::Escape($marker)) {
        $marker = "/* ============================================================`n   3. HEALTH ROUTE"
    }

    if ($content -notmatch [regex]::Escape($marker)) {
        throw "Could not locate the health-route section in server.ts"
    }

    $content = $content.Replace(
        $marker,
        "$routeLine`r`n`r`n$marker"
    )
}

Set-Content `
    -Path $serverPath `
    -Value $content `
    -Encoding UTF8

Write-Host ""
Write-Host "MirrorTrace notification routes added successfully." -ForegroundColor Green
Write-Host ""
Write-Host "Added:"
Write-Host "  import { notificationRouter } from './server/notificationRoutes.ts';"
Write-Host "  app.use(notificationRouter);"
Write-Host ""