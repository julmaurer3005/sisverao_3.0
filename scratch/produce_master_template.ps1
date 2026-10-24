Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)

# 1. Date banner (clear text area up to rounded end)
$g.FillRectangle($brushWhite, 316, 33, 436, 62)

# 2. Yellow circle (Resgates: 853)
$brushY = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 252, 206, 10))
$g.FillRectangle($brushY, 485, 580, 108, 45)

# 3. Orange circle (Ações Preventivas: 500.771)
$rectO = New-Object System.Drawing.Rectangle(422, 796, 230, 72)
$brushO = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectO, [System.Drawing.Color]::FromArgb(255, 250, 121, 9), [System.Drawing.Color]::FromArgb(255, 247, 104, 5), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($brushO, $rectO)

# 4. Blue circle (Pessoas Encontradas: 1.190)
$rectB = New-Object System.Drawing.Rectangle(162, 665, 185, 100)
$brushB = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectB, [System.Drawing.Color]::FromArgb(255, 38, 135, 240), [System.Drawing.Color]::FromArgb(255, 20, 100, 218), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($brushB, $rectB)

# 5. Purple circle (Águas Vivas: 124.722)
$rectP = New-Object System.Drawing.Rectangle(728, 660, 232, 88)
$brushP = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectP, [System.Drawing.Color]::FromArgb(255, 140, 34, 191), [System.Drawing.Color]::FromArgb(255, 127, 27, 177), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillRectangle($brushP, $rectP)

# 6. Black circle (Afogamentos Doce: 42)
$brushK = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 33, 41, 51))
$g.FillRectangle($brushK, 206, 928, 66, 46)

# 7. Red circle (Afogamentos Salgada: 6)
$brushR = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 246, 52, 50))
$g.FillRectangle($brushR, 814, 918, 48, 56)

# 8. Black sub-pills (numbers 0 and 42) - Use Ellipse matching pill's rounded cap
$brushSubK = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 14, 18, 23))
$g.FillEllipse($brushSubK, 320, 1074, 46, 32)
$g.FillEllipse($brushSubK, 320, 1116, 46, 32)

# 9. Red sub-pills (numbers 1 and 5) - Use Ellipse matching pill's rounded cap
$brushSubR = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 192, 13, 13))
$g.FillEllipse($brushSubR, 920, 1074, 46, 32)
$g.FillEllipse($brushSubR, 920, 1116, 46, 32)

# 10. Guaritas white pills (strictly inside the white pill boundaries)
$g.FillRectangle($brushWhite, 550, 1300, 160, 62)
$g.FillRectangle($brushWhite, 550, 1354, 160, 78)
$g.FillRectangle($brushWhite, 550, 1440, 160, 64)

# Save templates
$outPublic = "c:\Users\USER\Desktop\sisverao\client\public\assets\card_base_frame3.png"
$outSrc = "c:\Users\USER\Desktop\sisverao\client\src\assets\card_base_frame3.png"
$bmp.Save($outPublic, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outSrc, [System.Drawing.Imaging.ImageFormat]::Png)

# Generate updated overview
$thumb = New-Object System.Drawing.Bitmap(540, 960)
$gt = [System.Drawing.Graphics]::FromImage($thumb)
$gt.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gt.DrawImage($bmp, 0, 0, 540, 960)
$gt.Dispose()

$scratch = "c:\Users\USER\Desktop\sisverao\scratch"
$thumb.Save("$scratch\template_master_overview.png", [System.Drawing.Imaging.ImageFormat]::Png)
$thumb.Dispose()

$g.Dispose()
$bmp.Dispose()
Write-Host "Master template and overview generated flawlessly!"
