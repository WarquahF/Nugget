# PowerShell script to extract portable Node.js (NO ADMIN REQUIRED)
# This downloads a portable Node.js zip and extracts it locally

Write-Host "Setting up portable Node.js..." -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$nodeDir = Join-Path $scriptDir "node-portable"
$nodeVersion = "v24.16.0"
$downloadUrl = "https://nodejs.org/dist/${nodeVersion}/node-${nodeVersion}-win-x64.zip"
$zipPath = "$env:TEMP\node-portable.zip"

# Check if already extracted
if (Test-Path "$nodeDir\node.exe") {
    Write-Host "Node.js already set up at $nodeDir" -ForegroundColor Green
    & "$nodeDir\node.exe" -v
    & "$nodeDir\npm.cmd" -v
    Write-Host "`nPortable Node.js is ready! Run: .\StartJarvis.bat" -ForegroundColor Green
    pause
    exit
}

Write-Host "Downloading Node.js $nodeVersion (portable)..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipPath -ErrorAction Stop
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Extracting to $nodeDir..." -ForegroundColor Cyan
if (Test-Path $nodeDir) {
    Remove-Item $nodeDir -Recurse -Force
}
New-Item -ItemType Directory -Path $nodeDir -Force | Out-Null

# Use built-in expansion (PowerShell 5+)
$tempExtractPath = Join-Path $scriptDir "node-${nodeVersion}-win-x64"
Expand-Archive -Path $zipPath -DestinationPath "$scriptDir" -Force

# Move extracted folder
if (Test-Path $tempExtractPath) {
    Move-Item -Path $tempExtractPath -Destination $nodeDir -Force
}

Remove-Item $zipPath -Force -ErrorAction SilentlyContinue

# Verify
Write-Host "`nVerifying portable Node.js..." -ForegroundColor Cyan
& "$nodeDir\node.exe" -v
& "$nodeDir\npm.cmd" -v

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nPortable Node.js extracted successfully!" -ForegroundColor Green
    Write-Host "Run: .\StartJarvis.bat" -ForegroundColor Green
} else {
    Write-Host "`nExtraction may have failed. Check the output above." -ForegroundColor Red
}

pause
