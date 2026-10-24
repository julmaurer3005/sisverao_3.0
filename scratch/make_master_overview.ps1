Add-Type -AssemblyName System.Drawing
$tmpl = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\card_base_frame3.png')
$thumb = New-Object System.Drawing.Bitmap(540, 960)
$g = [System.Drawing.Graphics]::FromImage($thumb)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($tmpl, 0, 0, 540, 960)
$g.Dispose()
$tmpl.Dispose()
$scratch = "c:\Users\USER\Desktop\sisverao\scratch"
$thumb.Save("$scratch\template_master_overview.png", [System.Drawing.Imaging.ImageFormat]::Png)
$thumb.Dispose()
Write-Host "Overview saved!"
