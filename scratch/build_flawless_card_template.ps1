Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

# 1. Date banner (clear text area)
$g.FillRectangle($brushWhite, 316, 33, 430, 62)

# 2. Yellow circle (Resgates: 853)
$brushY = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 252, 206, 10))
$g.FillRectangle($brushY, 480, 578, 118, 48)

# 3. Orange circle (Ações Preventivas: 500.771)
$rectO = New-Object System.Drawing.Rectangle(405, 792, 268, 76)
$brushO = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectO, [System.Drawing.Color]::FromArgb(255, 250, 121, 9), [System.Drawing.Color]::FromArgb(255, 247, 104, 5), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($brushO, $rectO)

# 4. Blue circle (Pessoas Encontradas: 1.190)
$rectB = New-Object System.Drawing.Rectangle(170, 686, 175, 78)
$brushB = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectB, [System.Drawing.Color]::FromArgb(255, 32, 128, 235), [System.Drawing.Color]::FromArgb(255, 22, 105, 220), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($brushB, $rectB)

# 5. Purple circle (Águas Vivas: 124.722)
$rectP = New-Object System.Drawing.Rectangle(715, 655, 238, 94)
$brushP = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectP, [System.Drawing.Color]::FromArgb(255, 140, 34, 191), [System.Drawing.Color]::FromArgb(255, 127, 27, 177), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($brushP, $rectP)

# 6. Black circle (Afogamentos Doce: 42)
$brushK = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 33, 41, 51))
$g.FillRectangle($brushK, 200, 928, 80, 46)

# 7. Red circle (Afogamentos Salgada: 6)
$brushR = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 49, 48))
$g.FillRectangle($brushR, 810, 916, 60, 58)

# 8. Black sub-pills (numbers 0 and 42)
$brushSubK = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 14, 18, 23))
$g.FillRectangle($brushSubK, 325, 1075, 40, 32)
$g.FillRectangle($brushSubK, 325, 1118, 40, 32)

# 9. Red sub-pills (numbers 1 and 5)
$brushSubR = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 192, 13, 13))
$g.FillRectangle($brushSubR, 925, 1075, 40, 32)
$g.FillRectangle($brushSubR, 925, 1118, 40, 32)

# 10. Guaritas white pills
$g.FillRectangle($brushWhite, 530, 1290, 215, 72)
$g.FillRectangle($brushWhite, 530, 1373, 215, 80)
$g.FillRectangle($brushWhite, 530, 1460, 215, 62)

# Save templates
$outPublic = "c:\Users\USER\Desktop\sisverao\client\public\assets\card_base_frame3.png"
$outSrc = "c:\Users\USER\Desktop\sisverao\client\src\assets\card_base_frame3.png"
$bmp.Save($outPublic, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outSrc, [System.Drawing.Imaging.ImageFormat]::Png)

# Save test crops
function Save-Crop($srcBmp, $rect, $filename) {
    $crop = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
    $gc = [System.Drawing.Graphics]::FromImage($crop)
    $gc.DrawImage($srcBmp, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $gc.Dispose()
    $crop.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
}

$scratch = "c:\Users\USER\Desktop\sisverao\scratch"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(250, 25, 530, 80)) "$scratch\flawless_date.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(430, 500, 220, 210)) "$scratch\flawless_yellow.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(370, 700, 330, 250)) "$scratch\flawless_orange.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(120, 620, 260, 220)) "$scratch\flawless_blue.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(680, 600, 300, 230)) "$scratch\flawless_purple.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(50, 890, 370, 280)) "$scratch\flawless_black.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(660, 890, 370, 280)) "$scratch\flawless_red.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(330, 1160, 420, 380)) "$scratch\flawless_guaritas.png"

$g.Dispose()
$bmp.Dispose()
Write-Host "Flawless template and crops created successfully!"
