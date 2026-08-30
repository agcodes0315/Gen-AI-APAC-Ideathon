$ErrorActionPreference = "Stop"

$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$serverPath = Join-Path $root "server.ts"

if (-not (Test-Path $serverPath)) {
    throw "server.ts was not found at $serverPath"
}

$content = Get-Content $serverPath -Raw

$runtimeImport = "import { assertProductionRuntimeConfig, getSafeRuntimeSummary } from './server/runtimeConfig.ts';"
$securityImport = "import { applySecurityMiddleware } from './server/securityMiddleware.ts';"

if ($content -notmatch [regex]::Escape($runtimeImport)) {
    $anchor = "import 'dotenv/config';"

    if ($content -notmatch [regex]::Escape($anchor)) {
        throw "Could not find dotenv import anchor in server.ts"
    }

    $replacement = @"
import 'dotenv/config';

$runtimeImport
$securityImport
"@

    $content = $content.Replace($anchor, $replacement.TrimEnd())
}

$middlewareLine = "applySecurityMiddleware(app);"

if ($content -notmatch [regex]::Escape($middlewareLine)) {
    $anchor = "const app = express();"

    if ($content -notmatch [regex]::Escape($anchor)) {
        throw "Could not find Express app creation anchor."
    }

    $content = $content.Replace(
        $anchor,
        "$anchor`r`n`r`n$middlewareLine"
    )
}

$assertLine = "assertProductionRuntimeConfig();"

if ($content -notmatch [regex]::Escape($assertLine)) {
    $anchor = "const PORT = Number(process.env.PORT || 3000);"

    if ($content -notmatch [regex]::Escape($anchor)) {
        throw "Could not find PORT anchor."
    }

    $content = $content.Replace(
        $anchor,
        "$anchor`r`n`r`n$assertLine"
    )
}

$oldHealth = @"
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'MirrorTrace Backend',
    timestamp: new Date().toISOString(),
  });
});
"@

$newHealth = @"
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'MirrorTrace Backend',
    timestamp: new Date().toISOString(),
    runtime: getSafeRuntimeSummary(),
  });
});
"@

if ($content -match [regex]::Escape($oldHealth.Trim())) {
    $content = $content.Replace(
        $oldHealth.Trim(),
        $newHealth.Trim()
    )
}
elseif ($content -notmatch "getSafeRuntimeSummary\(\)") {
    Write-Warning "Existing /api/health block did not exactly match. It was left unchanged."
}

Set-Content -Path $serverPath -Value $content -Encoding UTF8

Write-Host "Production hardening patch applied."
