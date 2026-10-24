Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)

# 1. Black sub-pills (under black circle, y=1050..1200, x=100..400)
# Look for the white badges inside the pills (where numbers 0 and 42 are written)
# Number badges have white pixels or numbers
# Let's inspect rows around y=1080..1160
Write-Host "--- Black sub-pills ---"
# Check pill 1 (Monitorada) around y=1100
# Check pill 2 (Não Monitorada) around y=1140

# 2. Guaritas House Badge:
# Find green pixels in y=1150..1550, x=300..780
$gPixels = @()
for ($y = 1150; $y -lt 1550; $y += 4) {
    for ($x = 300; $x -lt 780; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.G -gt 130 -and $c.R -lt 50 -and $c.B -lt 100) {
            $gPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$minGX = ($gPixels | Measure-Object -Property X -Minimum).Minimum
$maxGX = ($gPixels | Measure-Object -Property X -Maximum).Maximum
$minGY = ($gPixels | Measure-Object -Property Y -Minimum).Minimum
$maxGY = ($gPixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Guaritas House Badge: X from $minGX to $maxGX (w=$( $maxGX - $minGX )), Y from $minGY to $maxGY (h=$( $maxGY - $minGY ))"

# Find the 3 white pills inside Guaritas badge:
# Pill 1: y around 1250..1330, x around 500..750
# Pill 2: y around 1330..1420
# Pill 3: y around 1420..1520
for ($p = 1; $p -le 3; $p++) {
    $yStart = 1200 + ($p - 1) * 90
    $yEnd = $yStart + 90
    $wPixels = @()
    for ($y = $yStart; $y -lt $yEnd; $y += 2) {
        for ($x = 480; $x -lt 760; $x += 2) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) {
                $wPixels += [PSCustomObject]@{ X = $x; Y = $y }
            }
        }
    }
    $pminX = ($wPixels | Measure-Object -Property X -Minimum).Minimum
    $pmaxX = ($wPixels | Measure-Object -Property X -Maximum).Maximum
    $pminY = ($wPixels | Measure-Object -Property Y -Minimum).Minimum
    $pmaxY = ($wPixels | Measure-Object -Property Y -Maximum).Maximum
    Write-Host "Guarita Pill ${p} - X from $pminX to $pmaxX (center $( ($pminX + $pmaxX)/2 )), Y from $pminY to $pmaxY (center $( ($pminY + $pmaxY)/2 ))"
}

# 3. Find Black Sub-pills (left)
for ($p = 1; $p -le 2; $p++) {
    $yStart = 1070 + ($p - 1) * 45
    $yEnd = $yStart + 50
    $bPixels = @()
    for ($y = $yStart; $y -lt $yEnd; $y += 2) {
        for ($x = 100; $x -lt 400; $x += 2) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.R -lt 40 -and $c.G -lt 40 -and $c.B -lt 40) {
                $bPixels += [PSCustomObject]@{ X = $x; Y = $y }
            }
        }
    }
    $bminX = ($bPixels | Measure-Object -Property X -Minimum).Minimum
    $bmaxX = ($bPixels | Measure-Object -Property X -Maximum).Maximum
    $bminY = ($bPixels | Measure-Object -Property Y -Minimum).Minimum
    $bmaxY = ($bPixels | Measure-Object -Property Y -Maximum).Maximum
    Write-Host "Black Pill ${p} - X from $bminX to $bmaxX, Y from $bminY to $bmaxY"
}

# 4. Find Red Sub-pills (right)
for ($p = 1; $p -le 2; $p++) {
    $yStart = 1070 + ($p - 1) * 45
    $yEnd = $yStart + 50
    $rPixels = @()
    for ($y = $yStart; $y -lt $yEnd; $y += 2) {
        for ($x = 650; $x -lt 980; $x += 2) {
            $c = $bmp.GetPixel($x, $y)
            if ($c.R -gt 180 -and $c.G -lt 50 -and $c.B -lt 50) {
                $rPixels += [PSCustomObject]@{ X = $x; Y = $y }
            }
        }
    }
    $rminX = ($rPixels | Measure-Object -Property X -Minimum).Minimum
    $rmaxX = ($rPixels | Measure-Object -Property X -Maximum).Maximum
    $rminY = ($rPixels | Measure-Object -Property Y -Minimum).Minimum
    $rmaxY = ($rPixels | Measure-Object -Property Y -Maximum).Maximum
    Write-Host "Red Pill ${p} - X from $rminX to $rmaxX, Y from $rminY to $rmaxY"
}

$bmp.Dispose()
