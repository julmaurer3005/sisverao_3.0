Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

Write-Host "Vertical scan at X=650 (inside pills with numbers):"
for ($y = 1280; $y -le 1580; $y += 5) {
    $c = $orig.GetPixel(650, $y)
    Write-Host ("Y={0:d4}: R={1:d3} G={2:d3} B={3:d3}" -f $y, $c.R, $c.G, $c.B)
}

$orig.Dispose()
