Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\public\assets\original_logo_crop.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)

$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# 1. Clean old '9' area using pure sky sample from column x=30
for ($y = 30; $y -lt 150; $y++) {
    $skySample = $bmp.GetPixel(30, $y)
    for ($x = 55; $x -le 175; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 160 -or ($c.R -gt 130 -and $c.B -lt 240) -or ($c.R -gt 240 -and $c.G -gt 240) -or ($c.B -lt 245 -and $c.R -gt 150)) {
            $bmp.SetPixel($x, $y, $skySample)
        }
    }
}

# Clean between x=170 and 188 for y >= 72 (under 'a' and before 'V')
for ($y = 72; $y -le 150; $y++) {
    $skySample = $bmp.GetPixel(30, $y)
    for ($x = 168; $x -le 187; $x++) {
        $bmp.SetPixel($x, $y, $skySample)
    }
}

# Clean old '2025/2026' using pure sky sample from x=535 (clean sky to the right)
for ($y = 135; $y -lt $bmp.Height; $y++) {
    $skySample = $bmp.GetPixel(535, $y)
    for ($x = 360; $x -lt 520; $x++) {
        $bmp.SetPixel($x, $y, $skySample)
    }
}

# 2. Redraw watermark circular concentric arcs in cleaned area
$wmPen1 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(40, 255, 255, 255), 2.5)
$wmPen2 = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(30, 255, 255, 255), 1.5)
$g.DrawArc($wmPen1, 20, 25, 536, 320, 190, 75)
$g.DrawArc($wmPen2, 35, 40, 506, 290, 190, 75)
$wmPen1.Dispose()
$wmPen2.Dispose()

# 3. Create the vector path for "10"
$path10 = New-Object System.Drawing.Drawing2D.GraphicsPath

# --- Shape for '1' ---
$rect1Stem = New-Object System.Drawing.RectangleF(74, 46, 23, 86)
$r1 = 10
$path1 = New-Object System.Drawing.Drawing2D.GraphicsPath
$path1.AddArc($rect1Stem.X, $rect1Stem.Y, $r1*2, $r1*2, 180, 90)
$path1.AddArc($rect1Stem.Right - $r1*2, $rect1Stem.Y, $r1*2, $r1*2, 270, 90)
$path1.AddArc($rect1Stem.Right - $r1*2, $rect1Stem.Bottom - $r1*2, $r1*2, $r1*2, 0, 90)
$path1.AddArc($rect1Stem.X, $rect1Stem.Bottom - $r1*2, $r1*2, $r1*2, 90, 90)
$path1.CloseFigure()

$beakPoints = @(
    (New-Object System.Drawing.PointF(78, 48)),
    (New-Object System.Drawing.PointF(58, 66)),
    (New-Object System.Drawing.PointF(64, 76)),
    (New-Object System.Drawing.PointF(78, 64))
)
$path1.AddPolygon($beakPoints)

# --- Shape for '0' ---
$path0Outer = New-Object System.Drawing.Drawing2D.GraphicsPath
$rect0Outer = New-Object System.Drawing.RectangleF(106, 45, 62, 88)
$r0 = 26
$path0Outer.AddArc($rect0Outer.X, $rect0Outer.Y, $r0*2, $r0*2, 180, 90)
$path0Outer.AddArc($rect0Outer.Right - $r0*2, $rect0Outer.Y, $r0*2, $r0*2, 270, 90)
$path0Outer.AddArc($rect0Outer.Right - $r0*2, $rect0Outer.Bottom - $r0*2, $r0*2, $r0*2, 0, 90)
$path0Outer.AddArc($rect0Outer.X, $rect0Outer.Bottom - $r0*2, $r0*2, $r0*2, 90, 90)
$path0Outer.CloseFigure()

# Inner cutout hole for '0'
$path0Inner = New-Object System.Drawing.Drawing2D.GraphicsPath
$rect0Inner = New-Object System.Drawing.RectangleF(124, 66, 26, 46)
$ri0 = 12
$path0Inner.AddArc($rect0Inner.X, $rect0Inner.Y, $ri0*2, $ri0*2, 180, 90)
$path0Inner.AddArc($rect0Inner.Right - $ri0*2, $rect0Inner.Y, $ri0*2, $ri0*2, 270, 90)
$path0Inner.AddArc($rect0Inner.Right - $ri0*2, $rect0Inner.Bottom - $ri0*2, $ri0*2, $ri0*2, 0, 90)
$path0Inner.AddArc($rect0Inner.X, $rect0Inner.Bottom - $ri0*2, $ri0*2, $ri0*2, 90, 90)
$path0Inner.CloseFigure()

$path10.AddPath($path1, $false)
$path10.AddPath($path0Outer, $false)
$path10.AddPath($path0Inner, $false)

# Sombra 3D projetada
$matShadow = New-Object System.Drawing.Drawing2D.Matrix
$matShadow.Translate(0, 3.5)
$pathShadow = $path10.Clone()
$pathShadow.Transform($matShadow)
$shadowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(65, 0, 0, 0), 6)
$shadowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawPath($shadowPen, $pathShadow)

# Contorno branco espesso (7px)
$whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 7)
$whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawPath($whitePen, $path10)

# Preenchimento em degradê Vermelho -> Laranja
$gradRect = New-Object System.Drawing.Rectangle(55, 40, 125, 95)
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($gradRect, [System.Drawing.Color]::FromArgb(255, 235, 25, 10), [System.Drawing.Color]::FromArgb(255, 245, 120, 25), [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
$g.FillPath($gradBrush, $path10)

# 4. Desenha o novo ano '2026/2027' abaixo de VERÃO
$fontFamily = New-Object System.Drawing.FontFamily("Arial Black")
$stringFormat = New-Object System.Drawing.StringFormat
$pointYear = New-Object System.Drawing.PointF(380, 137)
$pathYear = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathYear.AddString("2026/2027", $fontFamily, [int][System.Drawing.FontStyle]::Bold, 17, $pointYear, $stringFormat)

# Sombra do ano
$matYearShadow = New-Object System.Drawing.Drawing2D.Matrix
$matYearShadow.Translate(0, 2)
$pathYearShadow = $pathYear.Clone()
$pathYearShadow.Transform($matYearShadow)
$yearShadowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(50, 0, 0, 0), 3.5)
$yearShadowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawPath($yearShadowPen, $pathYearShadow)

# Contorno branco do ano
$whitePenYear = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 4)
$whitePenYear.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawPath($whitePenYear, $pathYear)

# Gradiente do ano
$rectGradYear = New-Object System.Drawing.Rectangle(380, 135, 120, 25)
$gradBrushYear = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectGradYear, [System.Drawing.Color]::FromArgb(255, 235, 25, 10), [System.Drawing.Color]::FromArgb(255, 245, 120, 25), [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
$g.FillPath($gradBrushYear, $pathYear)

# Salvar nas pastas públicas e src
$outPathPublic = "c:\Users\USER\Desktop\sisverao\client\public\assets\card_title_10op.png"
$outPathSrc = "c:\Users\USER\Desktop\sisverao\client\src\assets\card_title_10op.png"
$bmp.Save($outPathPublic, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outPathSrc, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Host "Pixel-perfect logo built!"
