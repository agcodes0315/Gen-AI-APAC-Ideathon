$ErrorActionPreference = "SilentlyContinue"

$ports = @(3000, 24678)

foreach ($port in $ports) {
  $listeners = Get-NetTCPConnection -State Listen -LocalPort $port

  foreach ($listener in $listeners) {
    if ($listener.OwningProcess) {
      Write-Host "Stopping PID $($listener.OwningProcess) using port $port..."
      Stop-Process -Id $listener.OwningProcess -Force
    }
  }
}

Write-Host "Ports 3000 and 24678 are available." -ForegroundColor Green
