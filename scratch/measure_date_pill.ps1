Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

Write-Host "Date pill Y bounds at X=500:"
for ($y = 25; $y -le 105; $y++) {
    $c = $orig.GetPixel(500, $y)
    if ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) {
        Write-Host "Y=$y is White: R=$($c.R) G=$($c.G) B=$($c.B)"
    }
}

$orig.Dispose()
