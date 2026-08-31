$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$src = Join-Path $root "src"
$mainCandidates = @(
    (Join-Path $src "main.tsx"),
    (Join-Path $src "main.jsx"),
    (Join-Path $src "main.ts"),
    (Join-Path $src "main.js")
)

$main = $mainCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $main) {
    throw "Could not find src/main.tsx (or main.jsx/main.ts/main.js)."
}

$import = "import './styles/mirrortrace-force-black50.css';"
$content = Get-Content $main -Raw

# Remove duplicate copies first.
$content = $content -replace [regex]::Escape($import) + "\r?\n?", ""

# Put FORCE import after every other import statement by locating the last import line.
$lines = $content -split "`r?`n"
$lastImport = -1
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match '^\s*import\b') {
        $lastImport = $i
    }
}

if ($lastImport -lt 0) {
    $new = $import + "`r`n" + $content
} else {
    $before = @()
    $after = @()

    if ($lastImport -ge 0) {
        $before = $lines[0..$lastImport]
    }

    if ($lastImport + 1 -lt $lines.Length) {
        $after = $lines[($lastImport + 1)..($lines.Length - 1)]
    }

    $newLines = @($before) + @($import) + @($after)
    $new = ($newLines -join "`r`n")
}

Set-Content -Path $main -Value $new -Encoding UTF8

Write-Host ""
Write-Host "FORCE BLACK-50 stylesheet has been inserted LAST in:"
Write-Host $main
Write-Host ""
Write-Host "Now run:"
Write-Host "npm run lint"
Write-Host "npm run build"
Write-Host "npm run dev"
