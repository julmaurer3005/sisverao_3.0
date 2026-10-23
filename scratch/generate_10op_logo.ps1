Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\public\assets\original_logo_crop.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)

# Create a high quality graphics context
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# 1. Clean the old '9' area (x: 70 to 186, y: 35 to 142)
# Sample sky background color from around (50, 80) and (20, 80)
# Sky is approximately RGB(201, 238, 254)
$skyBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 201, 238, 254))

# Let's paint over '9' using sky color gradient
for ($y = 30; $y -le 145; $y++) {
    for ($x = 60; $x -le 186; $x++) {
        # Check if pixel belongs to '9' or its shadow/glow
        $c = $bmp.GetPixel($x, $y)
        # If it's not sky (i.e. has red > 180 or is part of 9's shadow/white border)
        if ($c.R -gt 170 -or ($c.R -gt 150 -and $c.B -lt 240) -or ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240)) {
            # replace with sky pixel from (40, y)
            $skySample = $bmp.GetPixel(40, [math]::Min($y, $bmp.Height - 1))
            $bmp.SetPixel($x, $y, $skySample)
        }
    }
}

# Also clean the old '2025/2026' (x: 370 to 520, y: 138 to 160)
for ($y = 138; $y -lt $bmp.Height; $y++) {
    for ($x = 370; $x -lt 520; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 180) {
            $skySample = $bmp.GetPixel($x, 134)
            $bmp.SetPixel($x, $y, $skySample)
        }
    }
}

# 2. Draw the new '10' in place of '9'
# Font: Arial Black or Trebuchet MS or Impact with rounded stroke
$fontFamily = New-Object System.Drawing.FontFamily("Arial Black")
$path10 = New-Object System.Drawing.Drawing2D.GraphicsPath

# Add '10' string to path
$stringFormat = New-Object System.Drawing.StringFormat
$point = New-Object System.Drawing.PointF(62, 36)
$path10.AddString("10", $fontFamily, [int][System.Drawing.FontStyle]::Bold, 102, $point, $stringFormat)

# Create 3D drop shadow path (shifted down by 4px)
$matrixShadow = New-Object System.Drawing.Drawing2D.Matrix
$matrixShadow.Translate(0, 3)
$pathShadow = $path10.Clone()
$pathShadow.Transform($matrixShadow)
$shadowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 0, 0, 0), 8)
$shadowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawPath($shadowPen, $pathShadow)

# Outer thick white outline
$whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 9)
$whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawPath($whitePen, $path10)

# Inner red-to-orange gradient
$rectGradient = New-Object System.Drawing.Rectangle(60, 35, 130, 100)
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectGradient, [System.Drawing.Color]::FromArgb(255, 235, 30, 15), [System.Drawing.Color]::FromArgb(255, 245, 115, 20), [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
$g.FillPath($gradBrush, $path10)

# 3. Draw '2026/2027' under VERAO
$fontYear = New-Object System.Drawing.Font("Arial Black", 14, [System.Drawing.FontStyle]::Bold)
$pointYear = New-Object System.Drawing.PointF(372, 137)
$pathYear = New-Object System.Drawing.Drawing2D.GraphicsPath
$pathYear.AddString("2026/2027", $fontFamily, [int][System.Drawing.FontStyle]::Bold, 18, $pointYear, $stringFormat)

$whitePenYear = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 3)
$whitePenYear.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$g.DrawPath($whitePenYear, $pathYear)

$rectGradYear = New-Object System.Drawing.Rectangle(370, 135, 130, 25)
$gradBrushYear = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectGradYear, [System.Drawing.Color]::FromArgb(255, 235, 30, 15), [System.Drawing.Color]::FromArgb(255, 245, 115, 20), [System.Drawing.Drawing2D.LinearGradientMode]::Horizontal)
$g.FillPath($gradBrushYear, $pathYear)

# Save result
$outPath = "c:\Users\USER\Desktop\sisverao\client\public\assets\card_title_10op.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$bmp.Dispose()
Write-Host "Saved 10a Operação logo to $outPath"
