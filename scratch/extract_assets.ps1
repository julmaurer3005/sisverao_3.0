Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\USER\.gemini\antigravity-ide\brain\301e9db2-4f4e-4169-9600-d60941c6e38f\.user_uploaded\media_1792780927180.png"
$outDir = "c:\Users\USER\Desktop\sisverao\client\public\assets"

if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Image loaded: $($bmp.Width) x $($bmp.Height)"

# 1. Clean the old date at top right by painting over it with the sky color gradient
# Sample sky color from x=370, y from 10 to 65
for ($y = 10; $y -le 65; $y++) {
    $sampleColor = $bmp.GetPixel(370, $y)
    for ($x = 380; $x -lt $bmp.Width; $x++) {
        $bmp.SetPixel($x, $y, $sampleColor)
    }
}

# 2. Extract Top: Helicopter + clean sky (y: 0 to 275)
$rectTop = New-Object System.Drawing.Rectangle(0, 0, $bmp.Width, 275)
$bmpTop = $bmp.Clone($rectTop, $bmp.PixelFormat)
$topPath = Join-Path $outDir "card_top_helicopter.png"
$bmpTop.Save($topPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmpTop.Dispose()
Write-Host "Saved top helicopter to $topPath"

# 3. Extract Bottom: Ocean water + Logos (y: 840 to 1024)
$bottomH = $bmp.Height - 845
$rectBottom = New-Object System.Drawing.Rectangle(0, 845, $bmp.Width, $bottomH)
$bmpBottom = $bmp.Clone($rectBottom, $bmp.PixelFormat)
$bottomPath = Join-Path $outDir "card_bottom_ocean.png"
$bmpBottom.Save($bottomPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmpBottom.Dispose()
Write-Host "Saved bottom ocean to $bottomPath"

# 4. Save the full clean background image (with date cleaned out) as well for reference
$cleanFullPath = Join-Path $outDir "card_original_cleandate.png"
$bmp.Save($cleanFullPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Saved clean full to $cleanFullPath"

$bmp.Dispose()
Write-Host "Done extracting assets!"
