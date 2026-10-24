Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# 1. Date text area (pure white inside the white pill, starting after red calendar icon)
# Calendar icon ends around X=345. Text is X=350..750, Y=35..95.
$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
$g.FillRectangle($brushWhite, 345, 34, 405, 62)

# 2. Yellow circle number (853)
# Sample surrounding color: around (538, 575) is R=252, G=205, B=10
$rectY = New-Object System.Drawing.Rectangle(470, 574, 136, 56)
$brushY = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectY, [System.Drawing.Color]::FromArgb(255, 254, 210, 10), [System.Drawing.Color]::FromArgb(255, 250, 198, 4), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushY, $rectY)

# 3. Orange circle number (500.771)
$rectO = New-Object System.Drawing.Rectangle(390, 775, 290, 92)
$brushO = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectO, [System.Drawing.Color]::FromArgb(255, 250, 122, 10), [System.Drawing.Color]::FromArgb(255, 244, 98, 4), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushO, $rectO)

# 4. Blue circle number (1.190)
$rectB = New-Object System.Drawing.Rectangle(155, 680, 204, 86)
$brushB = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectB, [System.Drawing.Color]::FromArgb(255, 27, 120, 235), [System.Drawing.Color]::FromArgb(255, 18, 98, 218), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushB, $rectB)

# 5. Purple circle number (124.722)
$rectP = New-Object System.Drawing.Rectangle(705, 652, 256, 100)
$brushP = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectP, [System.Drawing.Color]::FromArgb(255, 138, 32, 190), [System.Drawing.Color]::FromArgb(255, 124, 24, 175), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushP, $rectP)

# 6. Black circle number (42)
$rectK = New-Object System.Drawing.Rectangle(180, 974, 140, 76)
$brushK = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectK, [System.Drawing.Color]::FromArgb(255, 22, 28, 35), [System.Drawing.Color]::FromArgb(255, 14, 18, 23), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushK, $rectK)

# 7. Red circle number (6)
$rectR = New-Object System.Drawing.Rectangle(805, 955, 96, 80)
$brushR = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectR, [System.Drawing.Color]::FromArgb(255, 236, 30, 28), [System.Drawing.Color]::FromArgb(255, 216, 16, 16), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillEllipse($brushR, $rectR)

# 8. Black sub-pills (numbers 0 and 42)
$brushSubK = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 14, 18, 23))
$g.FillEllipse($brushSubK, 320, 1073, 50, 36)
$g.FillEllipse($brushSubK, 320, 1115, 50, 36)

# 9. Red sub-pills (numbers 1 and 5)
$brushSubR = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 198, 12, 12))
$g.FillEllipse($brushSubR, 922, 1073, 50, 36)
$g.FillEllipse($brushSubR, 922, 1115, 50, 36)

# 10. Guaritas white pills (numbers 180, 29, 35)
$g.FillRectangle($brushWhite, 520, 1200, 205, 80)
$g.FillRectangle($brushWhite, 520, 1290, 205, 80)
$g.FillRectangle($brushWhite, 520, 1380, 205, 80)

# Save template to both src and public
$outPublic = "c:\Users\USER\Desktop\sisverao\client\public\assets\card_base_frame3.png"
$outSrc = "c:\Users\USER\Desktop\sisverao\client\src\assets\card_base_frame3.png"
$bmp.Save($outPublic, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outSrc, [System.Drawing.Imaging.ImageFormat]::Png)

# Also create crops of all patched areas to verify visually:
function Save-Crop($srcBmp, $rect, $filename) {
    $crop = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
    $gc = [System.Drawing.Graphics]::FromImage($crop)
    $gc.DrawImage($srcBmp, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $gc.Dispose()
    $crop.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
}

$scratch = "c:\Users\USER\Desktop\sisverao\scratch"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(250, 25, 530, 80)) "$scratch\clean_date.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(430, 500, 220, 210)) "$scratch\clean_yellow.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(370, 700, 330, 250)) "$scratch\clean_orange.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(120, 620, 260, 220)) "$scratch\clean_blue.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(680, 600, 300, 230)) "$scratch\clean_purple.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(60, 900, 350, 280)) "$scratch\clean_black.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(670, 900, 350, 280)) "$scratch\clean_red.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(330, 1160, 420, 380)) "$scratch\clean_guaritas.png"

$g.Dispose()
$bmp.Dispose()
Write-Host "Clean Frame 3 template & crops created successfully!"
