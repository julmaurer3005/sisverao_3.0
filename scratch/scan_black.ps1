Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

# Let's inspect rows around the black circle to find where '42' is vs 'AFOGAMENTOS':
Write-Host "Black circle vertical scan (x=240..260, y=910..1100):"
for ($y = 910; $y -le 1100; $y += 5) {
    $c = $orig.GetPixel(250, $y)
    Write-Host ("Y={0:d4}: R={1:d3} G={2:d3} B={3:d3}" -f $y, $c.R, $c.G, $c.B)
}

$orig.Dispose()
