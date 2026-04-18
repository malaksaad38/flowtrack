# fix-mongo-replicaset.ps1
# Run this in an ADMINISTRATOR PowerShell window

$cfgPath = "C:\Program Files\MongoDB\Server\8.2\bin\mongod.cfg"

Write-Host "Reading MongoDB config..." -ForegroundColor Cyan
$cfg = Get-Content $cfgPath -Raw

if ($cfg -match 'replSetName') {
    Write-Host "Replica set already configured." -ForegroundColor Green
} else {
    $cfg = $cfg -replace '#replication:', "replication:`r`n  replSetName: `"rs0`""
    Set-Content $cfgPath -Value $cfg -NoNewline
    Write-Host "Config updated with replSetName: rs0" -ForegroundColor Green
}

Write-Host "Restarting MongoDB service..." -ForegroundColor Cyan
Restart-Service -Name "MongoDB" -Force
Start-Sleep -Seconds 4

$svc = Get-Service -Name "MongoDB"
if ($svc.Status -eq "Running") {
    Write-Host "MongoDB service is Running." -ForegroundColor Green
} else {
    Write-Host "MongoDB service failed to start. Check: C:\Program Files\MongoDB\Server\8.2\log\mongod.log" -ForegroundColor Red
    exit 1
}

Write-Host "Initiating replica set rs0..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
node "$PSScriptRoot\initiate-mongo.js"

Write-Host ""
Write-Host "All done! Now run: node test-db.js" -ForegroundColor Green
