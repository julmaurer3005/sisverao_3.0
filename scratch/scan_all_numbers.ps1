Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

# 1. Yellow (Resgates: 853)
# In yellow circle, number 853 is red font (R>140, G<70, B<70)
$pY = @()
for ($y = 550; $y -le 660; $y++) {
    for ($x = 450; $x -le 620; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 130 -and $c.G -lt 60 -and $c.B -lt 60) {
            $pY += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
Write-Host "1. Yellow 853: X=$( ($pY | Measure-Object -Property X -Min).Minimum )..$( ($pY | Measure-Object -Property X -Max).Maximum ), Y=$( ($pY | Measure-Object -Property Y -Min).Minimum )..$( ($pY | Measure-Object -Property Y -Max).Maximum )"

# 2. Orange (Prevenções: 500.771)
# Number is white, above the text "AÇÕES PREVENTIVAS". Whistle is above number.
# Let's find white pixels of number in x=380..680, y=780..870
$pO = @()
for ($y = 780; $y -le 870; $y++) {
    for ($x = 380; $x -le 680; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -gt 230 -and $c.B -gt 230) {
            $pO += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
Write-Host "2. Orange 500.771: X=$( ($pO | Measure-Object -Property X -Min).Minimum )..$( ($pO | Measure-Object -Property X -Max).Maximum ), Y=$( ($pO | Measure-Object -Property Y -Min).Minimum )..$( ($pO | Measure-Object -Property Y -Max).Maximum )"

# 3. Blue (Pessoas: 1.190)
# White number above text "PESSOAS ENCONTRADAS"
$pB = @()
for ($y = 660; $y -le 760; $y++) {
    for ($x = 160; $x -le 350; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -gt 230 -and $c.B -gt 230) {
            $pB += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
Write-Host "3. Blue 1.190: X=$( ($pB | Measure-Object -Property X -Min).Minimum )..$( ($pB | Measure-Object -Property X -Max).Maximum ), Y=$( ($pB | Measure-Object -Property Y -Min).Minimum )..$( ($pB | Measure-Object -Property Y -Max).Maximum )"

# 4. Purple (Águas Vivas: 124.722)
# White number above text "LESÕES POR ÁGUAS VIVAS"
$pP = @()
for ($y = 640; $y -le 745; $y++) {
    for ($x = 710; $x -le 960; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 230 -and $c.G -gt 230 -and $c.B -gt 230) {
            $pP += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
Write-Host "4. Purple 124.722: X=$( ($pP | Measure-Object -Property X -Min).Minimum )..$( ($pP | Measure-Object -Property X -Max).Maximum ), Y=$( ($pP | Measure-Object -Property Y -Min).Minimum )..$( ($pP | Measure-Object -Property Y -Max).Maximum )"

# 5. Black (Doce: 42)
# White number between wave icon and text
$pK = @()
for ($y = 920; $y -le 975; $y++) {
    for ($x = 200; $x -le 300; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $pK += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
Write-Host "5. Black 42: X=$( ($pK | Measure-Object -Property X -Min).Minimum )..$( ($pK | Measure-Object -Property X -Max).Maximum ), Y=$( ($pK | Measure-Object -Property Y -Min).Minimum )..$( ($pK | Measure-Object -Property Y -Max).Maximum )"

# 6. Red (Salgada: 6)
# White number between wave icon and text
$pR = @()
for ($y = 920; $y -le 975; $y++) {
    for ($x = 810; $x -le 890; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $pR += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}
Write-Host "6. Red 6: X=$( ($pR | Measure-Object -Property X -Min).Minimum )..$( ($pR | Measure-Object -Property X -Max).Maximum ), Y=$( ($pR | Measure-Object -Property Y -Min).Minimum )..$( ($pR | Measure-Object -Property Y -Max).Maximum )"

$orig.Dispose()
