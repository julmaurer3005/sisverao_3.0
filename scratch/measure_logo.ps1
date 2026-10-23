Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\public\assets\original_logo_crop.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)

Write-Host "Width: $($bmp.Width), Height: $($bmp.Height)"

# Find horizontal extent of '9':
# Between x=50 and x=200, find min/max x and y where pixel is red/orange
$minX9 = 999; $maxX9 = 0; $minY9 = 999; $maxY9 = 0
for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 60; $x -lt 190; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 200 -and $c.B -lt 60) {
            if ($x -lt $minX9) { $minX9 = $x }
            if ($x -gt $maxX9) { $maxX9 = $x }
            if ($y -lt $minY9) { $minY9 = $y }
            if ($y -gt $maxY9) { $maxY9 = $y }
        }
    }
}
Write-Host "Letter '9': X from $minX9 to $maxX9 (width $( $maxX9 - $minX9 )), Y from $minY9 to $maxY9 (height $( $maxY9 - $minY9 ))"

# Find 'VERAO'
$minXV = 999; $maxXV = 0; $minYV = 999; $maxYV = 0
for ($y = 50; $y -lt $bmp.Height; $y++) {
    for ($x = 190; $x -lt 550; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 180 -and $c.B -lt 90) {
            if ($x -lt $minXV) { $minXV = $x }
            if ($x -gt $maxXV) { $maxXV = $x }
            if ($y -lt $minYV) { $minYV = $y }
            if ($y -gt $maxYV) { $maxYV = $y }
        }
    }
}
Write-Host "'VERAO': X from $minXV to $maxXV, Y from $minYV to $maxYV"

$bmp.Dispose()
