Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

# 1. Date banner text area:
# In y=35..95, x=340..745. The text is RED on white background!
# Let's find min/max of the red text pixels in date banner:
$dPixels = @()
for ($y = 35; $y -le 95; $y++) {
    for ($x = 350; $x -le 750; $x++) {
        $c = $orig.GetPixel($x, $y)
        # Red text has high R (>180) and lower G, B (<100)
        if ($c.R -gt 180 -and $c.G -lt 80 -and $c.B -lt 80) {
            $dPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$dMinX = ($dPixels | Measure-Object -Property X -Minimum).Minimum
$dMaxX = ($dPixels | Measure-Object -Property X -Maximum).Maximum
$dMinY = ($dPixels | Measure-Object -Property Y -Minimum).Minimum
$dMaxY = ($dPixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Date text 'BOLETIM DIÁRIO - 22/02/2026': X=$dMinX..$dMaxX, Y=$dMinY..$dMaxY"

# 2. Yellow circle number (853):
# 853 is red (R>150, G<60, B<60) inside yellow circle (y=570..640, x=460..610)
$yNumPixels = @()
for ($y = 570; $y -le 635; $y++) {
    for ($x = 460; $x -le 610; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 140 -and $c.G -lt 60 -and $c.B -lt 60) {
            $yNumPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$yMinX = ($yNumPixels | Measure-Object -Property X -Minimum).Minimum
$yMaxX = ($yNumPixels | Measure-Object -Property X -Maximum).Maximum
$yMinY = ($yNumPixels | Measure-Object -Property Y -Minimum).Minimum
$yMaxY = ($yNumPixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Yellow circle number (853): X=$yMinX..$yMaxX, Y=$yMinY..$yMaxY"

# 3. Orange circle number (500.771):
# 500.771 is white (R>240, G>240, B>240) in y=780..860, x=400..670
$oNumPixels = @()
for ($y = 780; $y -le 860; $y++) {
    for ($x = 400; $x -le 670; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 235 -and $c.G -gt 235 -and $c.B -gt 235) {
            $oNumPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$oMinX = ($oNumPixels | Measure-Object -Property X -Minimum).Minimum
$oMaxX = ($oNumPixels | Measure-Object -Property X -Maximum).Maximum
$oMinY = ($oNumPixels | Measure-Object -Property Y -Minimum).Minimum
$oMaxY = ($oNumPixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Orange circle number (500.771): X=$oMinX..$oMaxX, Y=$oMinY..$oMaxY"

# 4. Blue circle number (1.190):
# 1.190 is white in y=680..760, x=170..340
$bNumPixels = @()
for ($y = 680; $y -le 760; $y++) {
    for ($x = 170; $x -le 340; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 235 -and $c.G -gt 235 -and $c.B -gt 235) {
            $bNumPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$bMinX = ($bNumPixels | Measure-Object -Property X -Minimum).Minimum
$bMaxX = ($bNumPixels | Measure-Object -Property X -Maximum).Maximum
$bMinY = ($bNumPixels | Measure-Object -Property Y -Minimum).Minimum
$bMaxY = ($bNumPixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Blue circle number (1.190): X=$bMinX..$bMaxX, Y=$bMinY..$bMaxY"

# 5. Purple circle number (124.722):
# 124.722 is white in y=660..745, x=720..950
$pNumPixels = @()
for ($y = 660; $y -le 745; $y++) {
    for ($x = 720; $x -le 950; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 235 -and $c.G -gt 235 -and $c.B -gt 235) {
            $pNumPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$pMinX = ($pNumPixels | Measure-Object -Property X -Minimum).Minimum
$pMaxX = ($pNumPixels | Measure-Object -Property X -Maximum).Maximum
$pMinY = ($pNumPixels | Measure-Object -Property Y -Minimum).Minimum
$pMaxY = ($pNumPixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Purple circle number (124.722): X=$pMinX..$pMaxX, Y=$pMinY..$pMaxY"

# 6. Black circle number (42):
# 42 is white in y=970..1045, x=200..300
$kNumPixels = @()
for ($y = 970; $y -le 1045; $y++) {
    for ($x = 200; $x -le 300; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -gt 230 -and $c.B -gt 230) {
            $kNumPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$kMinX = ($kNumPixels | Measure-Object -Property X -Minimum).Minimum
$kMaxX = ($kNumPixels | Measure-Object -Property X -Maximum).Maximum
$kMinY = ($kNumPixels | Measure-Object -Property Y -Minimum).Minimum
$kMaxY = ($kNumPixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Black circle number (42): X=$kMinX..$kMaxX, Y=$kMinY..$kMaxY"

# 7. Red circle number (6):
# 6 is white in y=960..1040, x=820..885
$rNumPixels = @()
for ($y = 960; $y -le 1040; $y++) {
    for ($x = 820; $x -le 885; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -gt 230 -and $c.B -gt 230) {
            $rNumPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$rMinX = ($rNumPixels | Measure-Object -Property X -Minimum).Minimum
$rMaxX = ($rNumPixels | Measure-Object -Property X -Maximum).Maximum
$rMinY = ($rNumPixels | Measure-Object -Property Y -Minimum).Minimum
$rMaxY = ($rNumPixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Red circle number (6): X=$rMinX..$rMaxX, Y=$rMinY..$rMaxY"

# 8. Black sub-pills numbers:
# Sub-pill 1 (Monitorada): number is at right side of pill (y=1080..1115, x=340..390)
$bk1Pixels = @()
for ($y = 1080; $y -le 1115; $y++) {
    for ($x = 340; $x -le 395; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $bk1Pixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$bk1MinX = ($bk1Pixels | Measure-Object -Property X -Minimum).Minimum
$bk1MaxX = ($bk1Pixels | Measure-Object -Property X -Maximum).Maximum
$bk1MinY = ($bk1Pixels | Measure-Object -Property Y -Minimum).Minimum
$bk1MaxY = ($bk1Pixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Black sub-pill 1 number: X=$bk1MinX..$bk1MaxX, Y=$bk1MinY..$bk1MaxY"

# Sub-pill 2 (Não Monitorada): y=1120..1155, x=340..395
$bk2Pixels = @()
for ($y = 1120; $y -le 1155; $y++) {
    for ($x = 340; $x -le 395; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $bk2Pixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$bk2MinX = ($bk2Pixels | Measure-Object -Property X -Minimum).Minimum
$bk2MaxX = ($bk2Pixels | Measure-Object -Property X -Maximum).Maximum
$bk2MinY = ($bk2Pixels | Measure-Object -Property Y -Minimum).Minimum
$bk2MaxY = ($bk2Pixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Black sub-pill 2 number: X=$bk2MinX..$bk2MaxX, Y=$bk2MinY..$bk2MaxY"

# 9. Red sub-pills numbers:
# Sub-pill 1 (Monitorada): y=1080..1115, x=940..985
$rd1Pixels = @()
for ($y = 1080; $y -le 1115; $y++) {
    for ($x = 940; $x -le 985; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $rd1Pixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$rd1MinX = ($rd1Pixels | Measure-Object -Property X -Minimum).Minimum
$rd1MaxX = ($rd1Pixels | Measure-Object -Property X -Maximum).Maximum
$rd1MinY = ($rd1Pixels | Measure-Object -Property Y -Minimum).Minimum
$rd1MaxY = ($rd1Pixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Red sub-pill 1 number: X=$rd1MinX..$rd1MaxX, Y=$rd1MinY..$rd1MaxY"

# Sub-pill 2 (Não Monitorada): y=1120..1155, x=940..985
$rd2Pixels = @()
for ($y = 1120; $y -le 1155; $y++) {
    for ($x = 940; $x -le 985; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $rd2Pixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$rd2MinX = ($rd2Pixels | Measure-Object -Property X -Minimum).Minimum
$rd2MaxX = ($rd2Pixels | Measure-Object -Property X -Maximum).Maximum
$rd2MinY = ($rd2Pixels | Measure-Object -Property Y -Minimum).Minimum
$rd2MaxY = ($rd2Pixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Red sub-pill 2 number: X=$rd2MinX..$rd2MaxX, Y=$rd2MinY..$rd2MaxY"

# 10. Guaritas white pills numbers (dark green in white pill):
# Pill 1 (Norte): y=1200..1285, x=530..720
$g1Pixels = @()
for ($y = 1200; $y -le 1285; $y++) {
    for ($x = 530; $x -le 720; $x++) {
        $c = $orig.GetPixel($x, $y)
        # Dark green text has low R (<40), high G (>80), low B (<60)
        if ($c.G -gt 70 -and $c.R -lt 50 -and $c.B -lt 60) {
            $g1Pixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$g1MinX = ($g1Pixels | Measure-Object -Property X -Minimum).Minimum
$g1MaxX = ($g1Pixels | Measure-Object -Property X -Maximum).Maximum
$g1MinY = ($g1Pixels | Measure-Object -Property Y -Minimum).Minimum
$g1MaxY = ($g1Pixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Guarita Pill 1 number: X=$g1MinX..$g1MaxX, Y=$g1MinY..$g1MaxY"

# Pill 2 (Sul): y=1290..1375, x=530..720
$g2Pixels = @()
for ($y = 1290; $y -le 1375; $y++) {
    for ($x = 530; $x -le 720; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.G -gt 70 -and $c.R -lt 50 -and $c.B -lt 60) {
            $g2Pixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$g2MinX = ($g2Pixels | Measure-Object -Property X -Minimum).Minimum
$g2MaxX = ($g2Pixels | Measure-Object -Property X -Maximum).Maximum
$g2MinY = ($g2Pixels | Measure-Object -Property Y -Minimum).Minimum
$g2MaxY = ($g2Pixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Guarita Pill 2 number: X=$g2MinX..$g2MaxX, Y=$g2MinY..$g2MaxY"

# Pill 3 (AI): y=1380..1465, x=530..720
$g3Pixels = @()
for ($y = 1380; $y -le 1465; $y++) {
    for ($x = 530; $x -le 720; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.G -gt 70 -and $c.R -lt 50 -and $c.B -lt 60) {
            $g3Pixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$g3MinX = ($g3Pixels | Measure-Object -Property X -Minimum).Minimum
$g3MaxX = ($g3Pixels | Measure-Object -Property X -Maximum).Maximum
$g3MinY = ($g3Pixels | Measure-Object -Property Y -Minimum).Minimum
$g3MaxY = ($g3Pixels | Measure-Object -Property Y -Maximum).Maximum
Write-Host "Guarita Pill 3 number: X=$g3MinX..$g3MaxX, Y=$g3MinY..$g3MaxY"

$orig.Dispose()
