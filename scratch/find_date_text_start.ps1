Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

Write-Host "Date pill scan along Y=65 from X=260 to 360:"
for ($x = 260; $x -le 360; $x += 2) {
    $c = $orig.GetPixel($x, 65)
    Write-Host ("X={0:d3}: R={1:d3} G={2:d3} B={3:d3}" -f $x, $c.R, $c.G, $c.B)
}

$orig.Dispose()
