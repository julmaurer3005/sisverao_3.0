Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

Write-Host "Guaritas horizontal scan Pill 1 (y=1245, x=450..760):"
$wMinX = 9999; $wMaxX = 0
for ($x = 450; $x -le 760; $x++) {
    $c = $orig.GetPixel($x, 1245)
    # White pill pixel or text pixel inside pill:
    # Pill is bounded by green on left (x<500) and green/outside on right (x>720)
    if ($c.G -gt 130 -and $c.R -lt 40) {
        # Green background
    } else {
        if ($x -lt $wMinX) { $wMinX = $x }
        if ($x -gt $wMaxX) { $wMaxX = $x }
    }
}
Write-Host "White Pill 1 at Y=1245: X from $wMinX to $wMaxX"

$orig.Dispose()
