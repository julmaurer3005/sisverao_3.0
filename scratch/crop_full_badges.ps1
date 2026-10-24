Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')

function Save-Crop($srcBmp, $rect, $filename) {
    $crop = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
    $g = [System.Drawing.Graphics]::FromImage($crop)
    $g.DrawImage($srcBmp, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $crop.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
}

$scratch = "c:\Users\USER\Desktop\sisverao\scratch"

# Full yellow circle
Save-Crop $orig (New-Object System.Drawing.Rectangle(410, 480, 260, 250)) "$scratch\full_yellow.png"

# Full orange circle
Save-Crop $orig (New-Object System.Drawing.Rectangle(360, 680, 350, 290)) "$scratch\full_orange.png"

# Full black circle + sub-pills
Save-Crop $orig (New-Object System.Drawing.Rectangle(70, 890, 360, 300)) "$scratch\full_black.png"

# Full red circle + sub-pills
Save-Crop $orig (New-Object System.Drawing.Rectangle(660, 890, 360, 300)) "$scratch\full_red.png"

# Full guaritas badge
Save-Crop $orig (New-Object System.Drawing.Rectangle(330, 1160, 420, 380)) "$scratch\full_guaritas.png"

$orig.Dispose()
Write-Host "Full crops saved!"
