Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')
$thumb = New-Object System.Drawing.Bitmap(540, 960)
$g = [System.Drawing.Graphics]::FromImage($thumb)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($orig, 0, 0, 540, 960)
$g.Dispose()
$orig.Dispose()
$scratch = "c:\Users\USER\Desktop\sisverao\scratch"
$thumb.Save("$scratch\frame3_overview.png", [System.Drawing.Imaging.ImageFormat]::Png)
$thumb.Dispose()
Write-Host "Overview saved!"
