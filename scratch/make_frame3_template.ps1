Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# 1. Clean Top Date Pill (x: 275..752, y: 32..98)
# Top date pill has red gradient
$rectDate = New-Object System.Drawing.Rectangle(273, 32, 482, 67)
$rDate = 33
$pathDate = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathDate.AddArc($rectDate.X, $rectDate.Y, $rDate*2, $rDate*2, 180, 90)
$pathDate.AddArc($rectDate.Right - $rDate*2, $rectDate.Y, $rDate*2, $rDate*2, 270, 90)
$pathDate.AddArc($rectDate.Right - $rDate*2, $rectDate.Bottom - $rDate*2, $rDate*2, $rDate*2, 0, 90)
$pathDate.AddArc($rectDate.X, $rectDate.Bottom - $rDate*2, $rDate*2, $rDate*2, 90, 90)
$pathDate.CloseFigure()

$gradDate = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectDate, [System.Drawing.Color]::FromArgb(255, 215, 25, 25), [System.Drawing.Color]::FromArgb(255, 175, 15, 15), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$g.FillPath($gradDate, $pathDate)

# 2. Clean Yellow Circle Center (where 853 is)
# Center around (537, 595), radius 42
$pathYellow = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathYellow.AddEllipse(465, 565, 144, 60)
$brushYellow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 252, 204, 30))
$g.FillPath($brushYellow, $pathYellow)

# 3. Clean Orange Circle Center (where 500.771 is)
# Center around (531, 825)
$pathOrange = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathOrange.AddEllipse(410, 795, 240, 68)
$brushOrange = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 248, 126, 22))
$g.FillPath($brushOrange, $pathOrange)

# 4. Clean Blue Circle Center (where 1.190 is)
# Center around (253, 735)
$pathBlue = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathBlue.AddEllipse(170, 705, 166, 60)
$brushBlue = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 115, 225))
$g.FillPath($brushBlue, $pathBlue)

# 5. Clean Purple Circle Center (where 124.722 is)
# Center around (838, 715)
$pathPurple = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathPurple.AddEllipse(730, 685, 215, 60)
$brushPurple = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 130, 30, 180))
$g.FillPath($brushPurple, $pathPurple)

# 6. Clean Black Circle Center (where 42 is)
# Center around (249, 1000)
$pathBlack = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathBlack.AddEllipse(185, 965, 130, 65)
$brushBlack = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 28, 36, 44))
$g.FillPath($brushBlack, $pathBlack)

# 7. Clean Red Circle Center (where 6 is)
# Center around (850, 995)
$pathRed = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathRed.AddEllipse(800, 965, 100, 65)
$brushRed = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 235, 45, 40))
$g.FillPath($brushRed, $pathRed)

# 8. Clean Black Sub-pills (where 0 and 42 are on the right side)
$brushPillK1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 24, 28, 34))
$g.FillEllipse($brushPillK1, 306, 1073, 56, 42)
$g.FillEllipse($brushPillK1, 306, 1115, 56, 40)

# 9. Clean Red Sub-pills (where 1 and 5 are on the right side)
$brushPillR1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 215, 28, 28))
$g.FillEllipse($brushPillR1, 904, 1073, 56, 42)
$g.FillEllipse($brushPillR1, 904, 1115, 56, 40)

# 10. Clean Guaritas Badge 3 White Pills (where 180, 29, 35 are)
# Fill the inner part of each white pill with pure white
$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$g.FillEllipse($brushWhite, 515, 1205, 180, 75)
$g.FillEllipse($brushWhite, 515, 1295, 180, 75)
$g.FillEllipse($brushWhite, 515, 1385, 180, 75)

$outPublic = "c:\Users\USER\Desktop\sisverao\client\public\assets\card_base_frame3.png"
$outSrc = "c:\Users\USER\Desktop\sisverao\client\src\assets\card_base_frame3.png"
$bmp.Save($outPublic, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outSrc, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Host "Card base template created successfully!"
