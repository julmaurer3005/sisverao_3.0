Add-Type -AssemblyName System.Drawing

$src = "c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png"
$bmp = [System.Drawing.Bitmap]::FromFile($src)

# 1. Date banner text: "BOLETIM DIÁRIO - 22/02/2026"
# Replace red text pixels in date pill with pure white
for ($y = 35; $y -le 95; $y++) {
    for ($x = 340; $x -le 750; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Check if pixel is part of red text: high red, lower green and blue
        if ($c.R -gt 150 -and ($c.G -lt 150 -or $c.B -lt 150)) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        }
    }
}

# 2. Yellow circle number: 853
# Red number on yellow background. Replace red/dark pixels with yellow sampled from (x, 568)
for ($y = 572; $y -le 635; $y++) {
    for ($x = 475; $x -le 605; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # In yellow circle, background has G > 180, B < 60. Red number has G < 150.
        if ($c.G -lt 165) {
            $sample = $bmp.GetPixel($x, 568)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}

# 3. Orange circle number: 500.771
# White number on orange background. Replace bright pixels with orange sampled from (x, 770)
for ($y = 775; $y -le 865; $y++) {
    for ($x = 405; $x -le 670; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Background orange has R>220, G=90..150, B<45. White text has B > 80 or G > 170.
        if ($c.B -gt 55 -or $c.G -gt 170) {
            $sample = $bmp.GetPixel($x, 770)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}

# 4. Blue circle number: 1.190
# White number on blue background. Sample from (x, 675)
for ($y = 680; $y -le 765; $y++) {
    for ($x = 165; $x -le 350; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Background blue has R < 50, G = 90..140, B > 200. White text has R > 80.
        if ($c.R -gt 70) {
            $sample = $bmp.GetPixel($x, 675)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}

# 5. Purple circle number: 124.722
# White number on purple background. Sample from (x, 650)
for ($y = 655; $y -le 750; $y++) {
    for ($x = 715; $x -le 955; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Background purple has R=110..150, G<40, B=160..210. White text has G > 70.
        if ($c.G -gt 60) {
            $sample = $bmp.GetPixel($x, 650)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}

# 6. Black circle number: 42
# White number on black/dark background. Sample from (x, 965)
for ($y = 975; $y -le 1045; $y++) {
    for ($x = 195; $x -le 310; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Background is dark (R<35, G<35, B<40). White text has R > 55.
        if ($c.R -gt 55 -or $c.G -gt 55 -or $c.B -gt 55) {
            $sample = $bmp.GetPixel($x, 965)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}

# 7. Red circle number: 6
# White number on red background. Sample from (x, 945)
for ($y = 955; $y -le 1035; $y++) {
    for ($x = 810; $x -le 895; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Background red has R>200, G<40, B<40. White text has G > 60 or B > 60.
        if ($c.G -gt 55 -or $c.B -gt 55) {
            $sample = $bmp.GetPixel($x, 945)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}

# 8. Black sub-pills numbers: 0 and 42
# Right side: x=320..370
# Pill 1 (y=1073..1110)
for ($y = 1073; $y -le 1110; $y++) {
    for ($x = 320; $x -le 370; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 50 -or $c.G -gt 50 -or $c.B -gt 50) {
            # In black pill, sample dark background from (315, y)
            $sample = $bmp.GetPixel(315, $y)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}
# Pill 2 (y=1115..1152)
for ($y = 1115; $y -le 1152; $y++) {
    for ($x = 320; $x -le 370; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 50 -or $c.G -gt 50 -or $c.B -gt 50) {
            $sample = $bmp.GetPixel(315, $y)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}

# 9. Red sub-pills numbers: 1 and 5
# Right side: x=920..970
# Pill 1 (y=1073..1110)
for ($y = 1073; $y -le 1110; $y++) {
    for ($x = 920; $x -le 970; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.G -gt 60 -or $c.B -gt 60) {
            $sample = $bmp.GetPixel(915, $y)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}
# Pill 2 (y=1115..1152)
for ($y = 1115; $y -le 1152; $y++) {
    for ($x = 920; $x -le 970; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.G -gt 60 -or $c.B -gt 60) {
            $sample = $bmp.GetPixel(915, $y)
            $bmp.SetPixel($x, $y, $sample)
        }
    }
}

# 10. Guaritas white pills: numbers 180, 29, 35
# Inside each pill, text is dark green. The pill background is white (R>245, G>245, B>245).
# Pill 1 (y=1195..1280, x=510..725)
for ($y = 1195; $y -le 1280; $y++) {
    for ($x = 510; $x -le 725; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # If inside the white pill, replace dark green text (low R, low B) with white
        if ($c.R -lt 230 -or $c.B -lt 230) {
            # Make sure we only touch pixels that are inside the white pill (not the green outer shape)
            # If (x=505, y) is white or (x=730, y) is white:
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        }
    }
}
# Pill 2 (y=1285..1370, x=510..725)
for ($y = 1285; $y -le 1370; $y++) {
    for ($x = 510; $x -le 725; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 230 -or $c.B -lt 230) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        }
    }
}
# Pill 3 (y=1375..1460, x=510..725)
for ($y = 1375; $y -le 1460; $y++) {
    for ($x = 510; $x -le 725; $x++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -lt 230 -or $c.B -lt 230) {
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        }
    }
}

# Save template
$outPublic = "c:\Users\USER\Desktop\sisverao\client\public\assets\card_base_frame3.png"
$outSrc = "c:\Users\USER\Desktop\sisverao\client\src\assets\card_base_frame3.png"
$bmp.Save($outPublic, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save($outSrc, [System.Drawing.Imaging.ImageFormat]::Png)

# Save inspection crops
function Save-Crop($srcBmp, $rect, $filename) {
    $crop = New-Object System.Drawing.Bitmap($rect.Width, $rect.Height)
    $gc = [System.Drawing.Graphics]::FromImage($crop)
    $gc.DrawImage($srcBmp, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $gc.Dispose()
    $crop.Save($filename, [System.Drawing.Imaging.ImageFormat]::Png)
    $crop.Dispose()
}

$scratch = "c:\Users\USER\Desktop\sisverao\scratch"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(250, 25, 530, 80)) "$scratch\perfect_date.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(430, 500, 220, 210)) "$scratch\perfect_yellow.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(370, 700, 330, 250)) "$scratch\perfect_orange.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(120, 620, 260, 220)) "$scratch\perfect_blue.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(680, 600, 300, 230)) "$scratch\perfect_purple.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(50, 890, 370, 280)) "$scratch\perfect_black.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(660, 890, 370, 280)) "$scratch\perfect_red.png"
Save-Crop $bmp (New-Object System.Drawing.Rectangle(330, 1160, 420, 380)) "$scratch\perfect_guaritas.png"

$bmp.Dispose()
Write-Host "Smart inpainting completed successfully!"
