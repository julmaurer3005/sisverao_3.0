Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

# 1. Date banner (clear text area)
$g.FillRectangle($brushWhite, 348, 34, 396, 62)

# 2. Yellow circle (Resgates)
# Center around (538, 602), size 130 x 48
$rectY = New-Object System.Drawing.Rectangle(473, 578, 130, 48)
$brushY = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 252, 206, 10))
$g.FillEllipse($brushY, $rectY)

# 3. Orange circle (Ações Preventivas)
# Center around (538, 820), size 265 x 82
$rectO = New-Object System.Drawing.Rectangle(405, 779, 266, 82)
$brushO = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectO, [System.Drawing.Color]::FromArgb(255, 250, 119, 10), [System.Drawing.Color]::FromArgb(255, 245, 100, 5), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushO, $rectO)

# 4. Blue circle (Pessoas Encontradas)
# Center around (257, 724), size 176 x 72
$rectB = New-Object System.Drawing.Rectangle(169, 688, 176, 72)
$brushB = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectB, [System.Drawing.Color]::FromArgb(255, 25, 118, 233), [System.Drawing.Color]::FromArgb(255, 18, 100, 220), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushB, $rectB)

# 5. Purple circle (Águas Vivas)
# Center around (833, 702), size 235 x 85
$rectP = New-Object System.Drawing.Rectangle(715, 660, 236, 85)
$brushP = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectP, [System.Drawing.Color]::FromArgb(255, 136, 32, 188), [System.Drawing.Color]::FromArgb(255, 122, 24, 172), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushP, $rectP)

# 6. Black circle (Afogamentos Doce)
# Center around (250, 990), size 115 x 65
$rectK = New-Object System.Drawing.Rectangle(192, 958, 116, 65)
$brushK = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectK, [System.Drawing.Color]::FromArgb(255, 20, 25, 32), [System.Drawing.Color]::FromArgb(255, 12, 16, 21), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushK, $rectK)

# 7. Red circle (Afogamentos Salgada)
# Center around (850, 995), size 90 x 65
$rectR = New-Object System.Drawing.Rectangle(805, 962, 90, 65)
$brushR = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectR, [System.Drawing.Color]::FromArgb(255, 234, 28, 26), [System.Drawing.Color]::FromArgb(255, 216, 16, 16), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushR, $rectR)

# 8. Black sub-pills (numbers 0 and 42)
$brushSubK = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 13, 17, 22))
$g.FillEllipse($brushSubK, 322, 1074, 46, 34)
$g.FillEllipse($brushSubK, 322, 1116, 46, 34)

# 9. Red sub-pills (numbers 1 and 5)
$brushSubR = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 192, 12, 12))
$g.FillEllipse($brushSubR, 922, 1074, 46, 34)
$g.FillEllipse($brushSubR, 922, 1116, 46, 34)

# 10. Guaritas white pills
$g.FillRectangle($brushWhite, 510, 1206, 235, 78)
$g.FillRectangle($brushWhite, 510, 1292, 235, 82)
$g.FillRectangle($brushWhite, 510, 1382, 235, 82)

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
Save-Crop $bmp (New-Object System.Drawing.Rectangle(250, 25, 530, 80)) "$scratch\test2_date.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(430, 500, 220, 210)) "$scratch\test2_yellow.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(370, 700, 330, 250)) "$scratch\test2_orange.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(120, 620, 260, 220)) "$scratch\test2_blue.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(680, 600, 300, 230)) "$scratch\test2_purple.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(50, 890, 370, 280)) "$scratch\test2_black.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(660, 890, 370, 280)) "$scratch\test2_red.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(330, 1160, 420, 380)) "$scratch\test2_guaritas.png"

$g.Dispose()
$bmp.Dispose()
Write-Host "Test 2 template & crops created successfully!"
