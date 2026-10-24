Add-Type -AssemblyName System.Drawing

$src = "C:\Users\USER\.gemini\antigravity-ide\brain\301e9db2-4f4e-4169-9600-d60941c6e38f\.user_uploaded\media_1792794093150.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)

# Tight crop: x: 105, y: 15, w: 760, h: 730
$rect = New-Object System.Drawing.Rectangle(105, 15, 760, 730)
$crop = $bmp.Clone($rect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Flood fill transparency from the outside
# The sky background has Blue > 230, Green > 215, Red > 180
# The badge outline is white, then inside is green
$visited = New-Object 'bool[,]' $crop.Width, $crop.Height
$queue = New-Object System.Collections.Generic.Queue[System.Drawing.Point]

# Enqueue all border pixels of the crop
for ($x = 0; $x -lt $crop.Width; $x++) {
    $queue.Enqueue((New-Object System.Drawing.Point($x, 0)))
    $queue.Enqueue((New-Object System.Drawing.Point($x, $crop.Height - 1)))
}
for ($y = 0; $y -lt $crop.Height; $y++) {
    $queue.Enqueue((New-Object System.Drawing.Point(0, $y)))
    $queue.Enqueue((New-Object System.Drawing.Point($crop.Width - 1, $y)))
}

while ($queue.Count -gt 0) {
    $pt = $queue.Dequeue()
    $x = $pt.X; $y = $pt.Y
    if ($x -lt 0 -or $x -ge $crop.Width -or $y -lt 0 -or $y -ge $crop.Height) { continue }
    if ($visited[$x, $y]) { continue }
    $visited[$x, $y] = $true

    $c = $crop.GetPixel($x, $y)
    # If pixel is sky background or outer shadow (not the white border or green inside)
    # White border has R > 240, G > 240, B > 240
    # Green badge has G > 120, R < 100
    $isBadge = ($c.R -gt 245 -and $c.G -gt 245 -and $c.B -gt 245) -or ($c.G -gt 120 -and $c.R -lt 100)
    
    if (-not $isBadge) {
        # Make transparent
        # If it's a soft shadow / edge, calculate alpha
        $crop.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        
        # Enqueue 4 neighbors
        if ($x + 1 -lt $crop.Width) { $queue.Enqueue((New-Object System.Drawing.Point($x + 1, $y))) }
        if ($x - 1 -ge 0) { $queue.Enqueue((New-Object System.Drawing.Point($x - 1, $y))) }
        if ($y + 1 -lt $crop.Height) { $queue.Enqueue((New-Object System.Drawing.Point($x, $y + 1))) }
        if ($y - 1 -ge 0) { $queue.Enqueue((New-Object System.Drawing.Point($x, $y - 1))) }
    }
}

$outPublic = "c:\Users\USER\Desktop\sisverao\client\public\assets\badge_guaritas_house.png"
$outSrc = "c:\Users\USER\Desktop\sisverao\client\src\assets\badge_guaritas_house.png"
$crop.Save($outPublic, [System.Drawing.Imaging.ImageFormat]::Png)
$crop.Save($outSrc, [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Saved transparent badge to $outPublic and $outSrc"

$crop.Dispose()
$bmp.Dispose()
