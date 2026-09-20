# PowerShell validation script for ust-app
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running UST-App Full Health Validation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$root = Resolve-Path "$PSScriptRoot/../../.."
Set-Location $root

Write-Host "`n[1/3] Checking TypeScript types..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ TypeScript validation failed." -ForegroundColor Red
    exit 1
}
Write-Host "✅ TypeScript types passed!" -ForegroundColor Green

Write-Host "`n[2/3] Checking ESLint rules..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ESLint failed." -ForegroundColor Red
    exit 1
}
Write-Host "✅ ESLint passed!" -ForegroundColor Green

Write-Host "`n[3/3] Testing Next.js production build..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Next.js build failed." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Next.js production build succeeded!" -ForegroundColor Green

Write-Host "`n🎉 All UST-App checks passed successfully!" -ForegroundColor Green
