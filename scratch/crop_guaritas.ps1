Add-Type -AssemblyName System.Drawing

$src = "C:\Users\USER\.gemini\antigravity-ide\brain\301e9db2-4f4e-4169-9600-d60941c6e38f\.user_uploaded\media_1792780927180.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)

# Crop Guaritas area around x=220..356, y=520..650
$rect = New-Object System.Drawing.Rectangle(220, 520, 136, 130)
$crop = $bmp.Clone($rect, $bmp.PixelFormat)
$crop.Save("c:\Users\USER\Desktop\sisverao\client\public\assets\original_guaritas_crop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose()
$bmp.Dispose()
Write-Host "Crop saved!"
