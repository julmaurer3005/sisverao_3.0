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
Save-Crop $orig (New-Object System.Drawing.Rectangle(280, 1060, 130, 100)) "$scratch\bk_pills_num.png"
Save-Crop $orig (New-Object System.Drawing.Rectangle(880, 1060, 130, 100)) "$scratch\rd_pills_num.png"

$orig.Dispose()
Write-Host "Pills crops saved!"
