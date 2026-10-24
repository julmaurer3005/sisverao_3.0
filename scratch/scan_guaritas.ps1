Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

Write-Host "Guaritas vertical scan (x=600, y=1180..1500):"
for ($y = 1180; $y -le 1500; $y += 5) {
    $c = $orig.GetPixel(600, $y)
    Write-Host ("Y={0:d4}: R={1:d3} G={2:d3} B={3:d3}" -f $y, $c.R, $c.G, $c.B)
}

$orig.Dispose()
