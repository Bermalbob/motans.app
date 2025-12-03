# 1) Matar procesos que molestan
taskkill /F /IM node.exe /IM adb.exe /IM emulator.exe /IM qemu-system-x86_64.exe 2>$null

# 2) Arrancar el emulador Pixel_7a
Start-Process -FilePath "C:\Users\lion\AppData\Local\Android\Sdk\emulator\emulator.exe" -ArgumentList "-avd Pixel_7a"

# 3) Esperar unos segundos a que arranque
Start-Sleep -Seconds 15

# 4) Reiniciar ADB y esperar a que se vea el emulador
Set-Location "C:\Users\lion\AppData\Local\Android\Sdk\platform-tools"

.\adb kill-server
.\adb start-server

Write-Host "Esperando a que ADB vea el emulador..."

$maxTries = 10
for ($i = 1; $i -le $maxTries; $i++) {
    $devices = .\adb devices
    if ($devices -match "emulator-.*device") {
        Write-Host "OK: Emulador detectado por ADB."
        break
    }
    Start-Sleep -Seconds 3
    if ($i -eq $maxTries) {
        Write-Host "ERROR: ADB no ve el emulador. Revisa el emulador Pixel_7a."
        exit 1
    }
}

# 5) Arrancar Expo en el proyecto
Set-Location "C:\dev\Motans\apps\mobile"
nvm use 20.19.4
npm start -- --localhost --clear
