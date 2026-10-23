Add-Type -AssemblyName System.Drawing

$src = "C:\Users\USER\.gemini\antigravity-ide\brain\301e9db2-4f4e-4169-9600-d60941c6e38f\.user_uploaded\media_1792780927180.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)

$rect = New-Object System.Drawing.Rectangle(0, 680, $bmp.Width, 160)
$crop = $bmp.Clone($rect, $bmp.PixelFormat)
$crop.Save("c:\Users\USER\Desktop\sisverao\client\public\assets\original_logo_crop.png", [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Dispose()
$bmp.Dispose()

Write-Host "Crop saved successfully!"
