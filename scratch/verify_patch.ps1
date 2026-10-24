Add-Type -AssemblyName System.Drawing
$orig = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\Frame 3.png')
$tmpl = [System.Drawing.Bitmap]::FromFile('c:\Users\USER\Desktop\sisverao\client\src\assets\card_base_frame3.png')

Write-Host "Yellow circle:"
Write-Host "Orig (537, 595) [number]:" $orig.GetPixel(537, 595).ToString()
Write-Host "Tmpl (537, 595) [patched]:" $tmpl.GetPixel(537, 595).ToString()
Write-Host "Orig (537, 545) [bg]:" $orig.GetPixel(537, 545).ToString()

Write-Host "`nDate banner:"
Write-Host "Orig (514, 65) [text]:" $orig.GetPixel(514, 65).ToString()
Write-Host "Tmpl (514, 65) [patched]:" $tmpl.GetPixel(514, 65).ToString()
Write-Host "Orig (280, 65) [bg]:" $orig.GetPixel(280, 65).ToString()

Write-Host "`nGuarita pill 1:"
Write-Host "Orig (602, 1244) [number]:" $orig.GetPixel(602, 1244).ToString()
Write-Host "Tmpl (602, 1244) [patched]:" $tmpl.GetPixel(602, 1244).ToString()
Write-Host "Orig (520, 1244) [bg]:" $orig.GetPixel(520, 1244).ToString()

$orig.Dispose()
$tmpl.Dispose()
