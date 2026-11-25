# NanoJS Windows PowerShell Installer
Write-Host "=== Installing NanoJS v1.0.0 for Windows ===" -ForegroundColor Cyan

$zipUrl = "https://nanojs.priyanshugaurav.space/downloads/nanojs-v1.0.0-windows-x64.zip"
$installPath = "$HOME\AppData\Local\Programs\nanojs"

New-Item -ItemType Directory -Force -Path $installPath | Out-Null
$zipPath = "$env:TEMP\nanojs.zip"

Write-Host "Downloading NanoJS..."
Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath

Write-Host "Extracting..."
Expand-Archive -Path $zipPath -DestinationPath $installPath -Force
Remove-Item $zipPath

# Add to User PATH if not present
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$installPath*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$installPath", "User")
    Write-Host "Added $installPath to User PATH." -ForegroundColor Green
}

Write-Host "`nNanoJS successfully installed! Restart your terminal and run: nanojs file.mjs" -ForegroundColor Green
