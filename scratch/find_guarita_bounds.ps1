Add-Type -AssemblyName System.Drawing

$src = "C:\Users\USER\.gemini\antigravity-ide\brain\301e9db2-4f4e-4169-9600-d60941c6e38f\.user_uploaded\media_1792794093150.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)

Write-Host "Width: $($bmp.Width), Height: $($bmp.Height)"
Write-Host "Pixel (10, 10):" ($bmp.GetPixel(10, 10))
Write-Host "Pixel (512, 10):" ($bmp.GetPixel(512, 10))
Write-Host "Pixel (512, 380):" ($bmp.GetPixel(512, 380))

# Find green badge bounds:
# Green badge has high G (>120), low R (<60), low B (<100)
$minX = 9999; $maxX = 0; $minY = 9999; $maxY = 0
for ($y = 0; $y -lt $bmp.Height; $y += 2) {
    for ($x = 0; $x -lt $bmp.Width; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.G -gt 130 -and $c.R -lt 70 -and $c.B -lt 110) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}
Write-Host "Badge bounds: X from $minX to $maxX (width $( $maxX - $minX )), Y from $minY to $maxY (height $( $maxY - $minY ))"

$bmp.Dispose()
