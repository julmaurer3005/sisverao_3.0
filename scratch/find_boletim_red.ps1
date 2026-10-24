Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

Write-Host "Red pixels in date banner (x=300..400, y=30..90):"
for ($y = 30; $y -le 90; $y += 2) {
    for ($x = 300; $x -le 400; $x += 2) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 180 -and $c.G -lt 60) {
            Write-Host ("Found red at X={0:d3}, Y={1:d2}: R={2} G={3} B={4}" -f $x, $y, $c.R, $c.G, $c.B)
            break
        }
    }
}

$orig.Dispose()
