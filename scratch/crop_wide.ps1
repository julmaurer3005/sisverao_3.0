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

# Black circle + full pills
Save-Crop $orig (New-Object System.Drawing.Rectangle(40, 890, 420, 290)) "$scratch\wide_black.png"

# Red circle + full pills
Save-Crop $orig (New-Object System.Drawing.Rectangle(630, 890, 420, 290)) "$scratch\wide_red.png"

# Full Guaritas
Save-Crop $orig (New-Object System.Drawing.Rectangle(320, 1160, 440, 380)) "$scratch\wide_guaritas.png"

$orig.Dispose()
Write-Host "Wide crops saved!"
