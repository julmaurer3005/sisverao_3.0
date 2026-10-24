Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')
$tmpl = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\card_base_frame3.png')

function Save-Crop($srcBmp, $rect, $filename) {
    $crop = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
    $g = [System.Drawing.Graphics]::FromImage($crop)
    $g.DrawImage($srcBmp, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $crop.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
}

$scratch = "c:\Users\USER\Desktop\sisverao\scratch"
# 1. Date
Save-Crop $orig (New-Object System.Drawing.Rectangle(250, 20, 530, 90)) "$scratch\orig_date.png"
Save-Crop $tmpl (New-Object System.Drawing.Rectangle(250, 20, 530, 90)) "$scratch\tmpl_date.png"

# 2. Yellow (Resgates)
Save-Crop $orig (New-Object System.Drawing.Rectangle(430, 500, 220, 180)) "$scratch\orig_yellow.png"
Save-Crop $tmpl (New-Object System.Drawing.Rectangle(430, 500, 220, 180)) "$scratch\tmpl_yellow.png"

# 3. Orange (Prevenções)
Save-Crop $orig (New-Object System.Drawing.Rectangle(380, 700, 300, 220)) "$scratch\orig_orange.png"
Save-Crop $tmpl (New-Object System.Drawing.Rectangle(380, 700, 300, 220)) "$scratch\tmpl_orange.png"

# 4. Blue (Pessoas)
Save-Crop $orig (New-Object System.Drawing.Rectangle(120, 620, 260, 220)) "$scratch\orig_blue.png"
Save-Crop $tmpl (New-Object System.Drawing.Rectangle(120, 620, 260, 220)) "$scratch\tmpl_blue.png"

# 5. Purple (Águas Vivas)
Save-Crop $orig (New-Object System.Drawing.Rectangle(700, 600, 280, 220)) "$scratch\orig_purple.png"
Save-Crop $tmpl (New-Object System.Drawing.Rectangle(700, 600, 280, 220)) "$scratch\tmpl_purple.png"

# 6. Black (Afogamento Doce)
Save-Crop $orig (New-Object System.Drawing.Rectangle(100, 910, 290, 260)) "$scratch\orig_black.png"
Save-Crop $tmpl (New-Object System.Drawing.Rectangle(100, 910, 290, 260)) "$scratch\tmpl_black.png"

# 7. Red (Afogamento Salgada)
Save-Crop $orig (New-Object System.Drawing.Rectangle(700, 910, 290, 260)) "$scratch\orig_red.png"
Save-Crop $tmpl (New-Object System.Drawing.Rectangle(700, 910, 290, 260)) "$scratch\tmpl_red.png"

# 8. Guaritas
Save-Crop $orig (New-Object System.Drawing.Rectangle(340, 1170, 400, 370)) "$scratch\orig_guaritas.png"
Save-Crop $tmpl (New-Object System.Drawing.Rectangle(340, 1170, 400, 370)) "$scratch\tmpl_guaritas.png"

$orig.Dispose()
$tmpl.Dispose()
Write-Host "Crops saved successfully!"
