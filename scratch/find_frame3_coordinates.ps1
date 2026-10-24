Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)
Write-Host "Frame 3: $($bmp.Width) x $($bmp.Height)"

# 1. Top date banner (red pill at top)
# Red pill has high R (>200), low G (<50), low B (<50)
$minXDate = 9999; $maxXDate = 0; $minYDate = 9999; $maxYDate = 0
for ($y = 10; $y -lt 100; $y++) {
    for ($x = 200; $x -lt 900; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 180 -and $c.G -lt 50 -and $c.B -lt 50) {
            if ($x -lt $minXDate) { $minXDate = $x }
            if ($x -gt $maxXDate) { $maxXDate = $x }
            if ($y -lt $minYDate) { $minYDate = $y }
            if ($y -gt $maxYDate) { $maxYDate = $y }
        }
    }
}
Write-Host "Date Red Pill: X from $minXDate to $maxXDate, Y from $minYDate to $maxYDate"

# 2. Yellow circle (Resgates)
# Yellow circle center around x=540, y=550..700
# Yellow has high R (>230), high G (>180), low B (<80)
$yPixels = @()
for ($y = 500; $y -lt 750; $y += 4) {
    for ($x = 420; $x -lt 660; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -gt 180 -and $c.B -lt 80) {
            $yPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$avgYX = ($yPixels | Measure-Object -Property X -Average).Average
$avgYY = ($yPixels | Measure-Object -Property Y -Average).Average
Write-Host "Yellow Circle Center: X=$avgYX, Y=$avgYY"

# 3. Orange Hero Circle (Ações Preventivas)
# Center around x=540, y=780..980
$oPixels = @()
for ($y = 700; $y -lt 980; $y += 4) {
    for ($x = 400; $x -lt 680; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 90 -and $c.G -lt 160 -and $c.B -lt 50) {
            $oPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$avgOX = ($oPixels | Measure-Object -Property X -Average).Average
$avgOY = ($oPixels | Measure-Object -Property Y -Average).Average
Write-Host "Orange Circle Center: X=$avgOX, Y=$avgOY"

# 4. Blue Circle (Pessoas Encontradas)
# Center around x=230, y=650..820
$bPixels = @()
for ($y = 600; $y -lt 850; $y += 4) {
    for ($x = 100; $x -lt 360; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.B -gt 180 -and $c.R -lt 50 -and $c.G -lt 140) {
            $bPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$avgBX = ($bPixels | Measure-Object -Property X -Average).Average
$avgBY = ($bPixels | Measure-Object -Property Y -Average).Average
Write-Host "Blue Circle Center: X=$avgBX, Y=$avgBY"

# 5. Purple Circle (Águas Vivas)
# Center around x=850, y=650..820
$pPixels = @()
for ($y = 600; $y -lt 850; $y += 4) {
    for ($x = 720; $x -lt 980; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 120 -and $c.B -gt 160 -and $c.G -lt 60) {
            $pPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$avgPX = ($pPixels | Measure-Object -Property X -Average).Average
$avgPY = ($pPixels | Measure-Object -Property Y -Average).Average
Write-Host "Purple Circle Center: X=$avgPX, Y=$avgPY"

# 6. Black Circle (Afogamentos Doce)
# Center around x=230, y=900..1080
$kPixels = @()
for ($y = 850; $y -lt 1100; $y += 4) {
    for ($x = 100; $x -lt 360; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 45 -and $c.G -lt 45 -and $c.B -lt 45) {
            $kPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$avgKX = ($kPixels | Measure-Object -Property X -Average).Average
$avgKY = ($kPixels | Measure-Object -Property Y -Average).Average
Write-Host "Black Circle Center: X=$avgKX, Y=$avgKY"

# 7. Red Circle (Afogamentos Salgada)
# Center around x=850, y=900..1080
$rPixels = @()
for ($y = 850; $y -lt 1100; $y += 4) {
    for ($x = 720; $x -lt 980; $x += 4) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 200 -and $c.G -lt 60 -and $c.B -lt 60) {
            $rPixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
$avgRX = ($rPixels | Measure-Object -Property X -Average).Average
$avgRY = ($rPixels | Measure-Object -Property Y -Average).Average
Write-Host "Red Circle Center: X=$avgRX, Y=$avgRY"

$bmp.Dispose()
