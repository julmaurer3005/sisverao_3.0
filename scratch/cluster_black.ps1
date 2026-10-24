Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

Write-Host "Finding all white clusters in black circle:"
$pixels = @()
for ($y = 800; $y -le 1100; $y++) {
    for ($x = 150; $x -le 350; $x++) {
        $c = $orig.GetPixel($x, $y)
        if ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220) {
            $pixels += [PSCustomObject]@{ X = $x; Y = $y }
        }
    }
}

# Group pixels by Y ranges to see each element:
# 1. Circle top border
# 2. Wave icon
# 3. Number 42
# 4. Text AFOGAMENTOS...
# 5. Circle bottom border
$yGroups = $pixels | Group-Object -Property { [Math]::Floor($_.Y / 10) * 10 } | Sort-Object Name
foreach ($g in $yGroups) {
    $minX = ($g.Group | Measure-Object -Property X -Minimum).Minimum
    $maxX = ($g.Group | Measure-Object -Property X -Maximum).Maximum
    $minY = ($g.Group | Measure-Object -Property Y -Minimum).Minimum
    $maxY = ($g.Group | Measure-Object -Property Y -Maximum).Maximum
    Write-Host ("Y range {0} (count={1}): X from {2} to {3}, Y from {4} to {5}" -f $g.Name, $g.Count, $minX, $maxX, $minY, $maxY)
}

$orig.Dispose()
