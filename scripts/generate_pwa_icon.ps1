Add-Type -AssemblyName System.Drawing

function Generate-PwaIcon {
    param(
        [int]$size = 512,
        [string]$outputPath,
        [string]$textOption = "TRENDING.TT"
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $scale = [float]($size / 512.0)

    # 1. Dark Black/Slate Canvas (#020617 matches PWA background_color)
    $darkBgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 2, 6, 23))
    $fullRect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.FillRectangle($darkBgBrush, $fullRect)

    # 2. National Flag Squircle (Upper Center)
    $fw = [float](300.0 * $scale)
    $fh = [float](300.0 * $scale)
    $fx = [float](((512.0 * $scale) - $fw) / 2.0)
    $fy = [float](46.0 * $scale)
    $fr = [float](54.0 * $scale)

    $flagPath = New-Object System.Drawing.Drawing2D.GraphicsPath
    $flagPath.AddArc($fx, $fy, [float]($fr * 2.0), [float]($fr * 2.0), 180.0, 90.0)
    $flagPath.AddArc([float]($fx + $fw - ($fr * 2.0)), $fy, [float]($fr * 2.0), [float]($fr * 2.0), 270.0, 90.0)
    $flagPath.AddArc([float]($fx + $fw - ($fr * 2.0)), [float]($fy + $fh - ($fr * 2.0)), [float]($fr * 2.0), [float]($fr * 2.0), 0.0, 90.0)
    $flagPath.AddArc($fx, [float]($fy + $fh - ($fr * 2.0)), [float]($fr * 2.0), [float]($fr * 2.0), 90.0, 90.0)
    $flagPath.CloseFigure()

    # Drop shadow under the flag squircle
    $flagShadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 0, 0, 0))
    $shadowMatrix = New-Object System.Drawing.Drawing2D.Matrix
    $shadowMatrix.Translate(0.0, [float](8.0 * $scale))
    $shadowPath = $flagPath.Clone()
    $shadowPath.Transform($shadowMatrix)
    $g.FillPath($flagShadowBrush, $shadowPath)
    $shadowPath.Dispose()
    $shadowMatrix.Dispose()

    # Clip to the Flag Squircle
    $origClip = $g.Clip
    $g.SetClip($flagPath)

    # 2a. Scarlet Red field
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
    $g.FillRectangle($redBrush, $fx, $fy, $fw, $fh)

    # 2b. White Diagonal Stripe
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $p1 = New-Object System.Drawing.PointF($fx, $fy)
    $p2 = New-Object System.Drawing.PointF([float]($fx + ($fw * 0.28)), $fy)
    $p3 = New-Object System.Drawing.PointF([float]($fx + $fw), [float]($fy + ($fh * 0.72)))
    $p4 = New-Object System.Drawing.PointF([float]($fx + $fw), [float]($fy + $fh))
    $p5 = New-Object System.Drawing.PointF([float]($fx + ($fw * 0.72)), [float]($fy + $fh))
    $p6 = New-Object System.Drawing.PointF($fx, [float]($fy + ($fh * 0.28)))
    $polyWhite = [System.Drawing.PointF[]]@($p1, $p2, $p3, $p4, $p5, $p6)
    $g.FillPolygon($whiteBrush, $polyWhite)

    # 2c. Central Black Stripe
    $blackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 12))
    $b1 = New-Object System.Drawing.PointF($fx, $fy)
    $b2 = New-Object System.Drawing.PointF([float]($fx + ($fw * 0.20)), $fy)
    $b3 = New-Object System.Drawing.PointF([float]($fx + $fw), [float]($fy + ($fh * 0.80)))
    $b4 = New-Object System.Drawing.PointF([float]($fx + $fw), [float]($fy + $fh))
    $b5 = New-Object System.Drawing.PointF([float]($fx + ($fw * 0.80)), [float]($fy + $fh))
    $b6 = New-Object System.Drawing.PointF($fx, [float]($fy + ($fh * 0.20)))
    $polyBlack = [System.Drawing.PointF[]]@($b1, $b2, $b3, $b4, $b5, $b6)
    $g.FillPolygon($blackBrush, $polyBlack)

    # Reset Clip
    $g.Clip = $origClip

    # Flag Squircle Rim Outline (clean frosted edge)
    $flagRimPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(140, 255, 255, 255), [float](2.5 * $scale))
    $g.DrawPath($flagRimPen, $flagPath)

    # 3. Center Floating Circular Smoked Glass Lens
    $cx = [float]($fx + ($fw / 2.0))
    $cy = [float]($fy + ($fh / 2.0))
    $radius = [float](92.0 * $scale)

    # Lens Shadow
    $lensShadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 0, 0, 0))
    $g.FillEllipse($lensShadowBrush, [float]($cx - $radius - (4.0 * $scale)), [float]($cy - $radius + (6.0 * $scale)), [float](($radius + (4.0 * $scale)) * 2.0), [float](($radius + (4.0 * $scale)) * 2.0))

    # Smoked Dark Glass Lens Surface
    $glassBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 15, 23, 42))
    $g.FillEllipse($glassBrush, [float]($cx - $radius), [float]($cy - $radius), [float]($radius * 2.0), [float]($radius * 2.0))

    # Chrome Outer Rim
    $rimPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 255, 255, 255), [float](4.0 * $scale))
    $g.DrawEllipse($rimPen, [float]($cx - $radius), [float]($cy - $radius), [float]($radius * 2.0), [float]($radius * 2.0))

    # Crimson Inner Accent Ring
    $redRim = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 239, 68, 68), [float](2.2 * $scale))
    $g.DrawEllipse($redRim, [float]($cx - $radius + (6.0 * $scale)), [float]($cy - $radius + (6.0 * $scale)), [float](($radius - (6.0 * $scale)) * 2.0), [float](($radius - (6.0 * $scale)) * 2.0))

    # 4. Clean Bold Ascending White Arrow inside lens
    $arrowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float](20.0 * $scale))
    $arrowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $arrowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $arrowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $a1 = New-Object System.Drawing.PointF([float]($cx - (60.0 * $scale)), [float]($cy + (38.0 * $scale)))
    $a2 = New-Object System.Drawing.PointF([float]($cx - (20.0 * $scale)), [float]($cy - (4.0 * $scale)))
    $a3 = New-Object System.Drawing.PointF([float]($cx + (14.0 * $scale)), [float]($cy + (18.0 * $scale)))
    $a4 = New-Object System.Drawing.PointF([float]($cx + (60.0 * $scale)), [float]($cy - (46.0 * $scale)))
    $arrowPath = [System.Drawing.PointF[]]@($a1, $a2, $a3, $a4)
    $g.DrawLines($arrowPen, $arrowPath)

    $h1 = New-Object System.Drawing.PointF([float]($cx + (20.0 * $scale)), [float]($cy - (46.0 * $scale)))
    $h2 = New-Object System.Drawing.PointF([float]($cx + (60.0 * $scale)), [float]($cy - (46.0 * $scale)))
    $h3 = New-Object System.Drawing.PointF([float]($cx + (60.0 * $scale)), [float]($cy - (6.0 * $scale)))
    $arrowHead = [System.Drawing.PointF[]]@($h1, $h2, $h3)
    $g.DrawLines($arrowPen, $arrowHead)

    # Ruby Red Beacon at Arrowhead Peak
    $beaconBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
    $beaconRadius = [float](8.0 * $scale)
    $g.FillEllipse($beaconBrush, [float]($cx + (60.0 * $scale) - $beaconRadius), [float]($cy - (46.0 * $scale) - $beaconRadius), [float]($beaconRadius * 2.0), [float]($beaconRadius * 2.0))

    $beaconDot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $dotRadius = [float](3.0 * $scale)
    $g.FillEllipse($beaconDot, [float]($cx + (60.0 * $scale) - $dotRadius), [float]($cy - (46.0 * $scale) - $dotRadius), [float]($dotRadius * 2.0), [float]($dotRadius * 2.0))

    # 5. THE WORDS IN THE BLACK PART UNDER THE NATIONAL FLAG
    $fontSize = [Math]::Max(10, [int](26.0 * $scale))
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)

    $textY = [float](400.0 * $scale)
    $textHeight = [float](48.0 * $scale)

    $mainText = if ($textOption -eq "TITLE") { "Trending" } else { "TRENDING" }
    $dotText = ".TT"
    $fullText = "$mainText$dotText"

    # Measure full string width to center exactly
    $sizeFull = $g.MeasureString($fullText, $font, [System.Drawing.PointF]::Empty, [System.Drawing.StringFormat]::GenericTypographic)
    $sizeMain = $g.MeasureString($mainText, $font, [System.Drawing.PointF]::Empty, [System.Drawing.StringFormat]::GenericTypographic)
    $sizeDot = $g.MeasureString($dotText, $font, [System.Drawing.PointF]::Empty, [System.Drawing.StringFormat]::GenericTypographic)

    $totalW = [float]($sizeFull.Width)
    $startX = [float](((512.0 * $scale) - $totalW) / 2.0)

    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))

    # Use GenericTypographic to eliminate any artificial internal padding
    $strFormat = [System.Drawing.StringFormat]::GenericTypographic

    $pMain = New-Object System.Drawing.PointF($startX, $textY)
    $pDot = New-Object System.Drawing.PointF([float]($startX + $sizeMain.Width), $textY)

    $g.DrawString($mainText, $font, $whiteBrush, $pMain, $strFormat)
    $g.DrawString($dotText, $font, $redBrush, $pDot, $strFormat)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated: $outputPath ($size x $size) [$textOption]"
}

# Generate standard PWA icons with seamless kerning
Generate-PwaIcon -size 512 -outputPath "public\icon-512.png" -textOption "TRENDING.TT"
Generate-PwaIcon -size 192 -outputPath "public\icon-192.png" -textOption "TRENDING.TT"
Generate-PwaIcon -size 180 -outputPath "public\apple-touch-icon.png" -textOption "TRENDING.TT"

# Artifact preview outputs
$artifactDir = "C:\Users\daryl\.gemini\antigravity\brain\e4a3aa5d-8e13-421d-aa79-7b013ba3ee4e"
Generate-PwaIcon -size 512 -outputPath "$artifactDir\pwa_icon_uppercase.png" -textOption "TRENDING.TT"
Generate-PwaIcon -size 512 -outputPath "$artifactDir\pwa_icon_titlecase.png" -textOption "TITLE"
