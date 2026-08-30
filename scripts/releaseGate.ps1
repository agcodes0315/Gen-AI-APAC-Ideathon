$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "MirrorTrace Release Gate"
Write-Host "========================"
Write-Host ""

Write-Host "1/4 Linting..."
npm run lint

Write-Host ""
Write-Host "2/4 Building..."
npm run build

Write-Host ""
Write-Host "3/4 Pre-deployment checks..."
npx tsx scripts/predeployCheck.ts

Write-Host ""
Write-Host "4/4 Local smoke test..."
npx tsx scripts/smokeTest.ts http://localhost:3000

Write-Host ""
Write-Host "Release gate passed."
Write-Host ""
