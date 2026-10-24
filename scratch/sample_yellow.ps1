Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

# Let's check bounding box of non-white / badge in yellow circle area:
Write-Host "Sampling yellow circle area (x=450..620, y=520..660):"
for ($y = 520; $y -le 660; $y += 10) {
    $line = ""
    for ($x = 450; $x -le 620; $x += 15) {
        $c = $orig.GetPixel($x, $y)
        # Determine color type
        if ($c.R -gt 240 -and $c.G -gt 240 -and $c.B -gt 240) {
            $line += "."
        } elseif ($c.R -gt 200 -and $c.G -gt 150 -and $c.B -lt 100) {
            $line += "Y"
        } elseif ($c.R -gt 150 -and $c.G -lt 60) {
            $line += "R"
        } else {
            $line += "?"
        }
    }
    Write-Host ("y={0:d3} : {1}" -f $y, $line)
}

$orig.Dispose()
