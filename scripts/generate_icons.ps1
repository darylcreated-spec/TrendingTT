Add-Type -AssemblyName System.Drawing

function Generate-Concept2Icon {
    param(
        [int]$size,
        [string]$outputPath
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $scale = [float]($size / 512.0)

    # 1. Official Trinidad & Tobago Flag Base (Red field)
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.FillRectangle($redBrush, $rect)

    # 2. White Borders for Diagonal Stripe
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $polyWhite = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(0.0, 0.0)),
        (New-Object System.Drawing.PointF([float](120.0 * $scale), 0.0)),
        (New-Object System.Drawing.PointF([float]$size, [float](392.0 * $scale))),
        (New-Object System.Drawing.PointF([float]$size, [float]$size)),
        (New-Object System.Drawing.PointF([float](392.0 * $scale), [float]$size)),
        (New-Object System.Drawing.PointF(0.0, [float](120.0 * $scale)))
    )
    $g.FillPolygon($whiteBrush, $polyWhite)

    # 3. Central Black Stripe
    $blackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 12))
    $polyBlack = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(0.0, 0.0)),
        (New-Object System.Drawing.PointF([float](88.0 * $scale), 0.0)),
        (New-Object System.Drawing.PointF([float]$size, [float](424.0 * $scale))),
        (New-Object System.Drawing.PointF([float]$size, [float]$size)),
        (New-Object System.Drawing.PointF([float](424.0 * $scale), [float]$size)),
        (New-Object System.Drawing.PointF(0.0, [float](88.0 * $scale)))
    )
    $g.FillPolygon($blackBrush, $polyBlack)

    # 4. Floating Circular Frosted Glass Lens
    $center = [float](256.0 * $scale)
    $radius = [float](160.0 * $scale)

    # Lens Drop Shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(180, 0, 0, 0))
    $g.FillEllipse($shadowBrush, [float]($center - $radius - (6.0 * $scale)), [float]($center - $radius + (8.0 * $scale)), [float](($radius + (6.0 * $scale)) * 2.0), [float](($radius + (6.0 * $scale)) * 2.0))

    # Smoked Dark Glass Lens Surface
    $glassBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(225, 15, 23, 42))
    $g.FillEllipse($glassBrush, [float]($center - $radius), [float]($center - $radius), [float]($radius * 2.0), [float]($radius * 2.0))

    # Polished Chrome / White Outer Rim
    $rimPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(240, 255, 255, 255), [float](5.0 * $scale))
    $g.DrawEllipse($rimPen, [float]($center - $radius), [float]($center - $radius), [float]($radius * 2.0), [float]($radius * 2.0))

    # Crimson Inner Accent Ring
    $redRim = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 239, 68, 68), [float](3.0 * $scale))
    $g.DrawEllipse($redRim, [float]($center - $radius + (8.0 * $scale)), [float]($center - $radius + (8.0 * $scale)), [float](($radius - (8.0 * $scale)) * 2.0), [float](($radius - (8.0 * $scale)) * 2.0))

    # 5. Clean Bold Ascending White Arrow inside the lens
    $arrowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float](32.0 * $scale))
    $arrowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $arrowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $arrowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $path = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF([float](150.0 * $scale), [float](320.0 * $scale))),
        (New-Object System.Drawing.PointF([float](220.0 * $scale), [float](250.0 * $scale))),
        (New-Object System.Drawing.PointF([float](280.0 * $scale), [float](290.0 * $scale))),
        (New-Object System.Drawing.PointF([float](360.0 * $scale), [float](180.0 * $scale)))
    )
    $g.DrawLines($arrowPen, $path)

    $head = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF([float](290.0 * $scale), [float](180.0 * $scale))),
        (New-Object System.Drawing.PointF([float](360.0 * $scale), [float](180.0 * $scale))),
        (New-Object System.Drawing.PointF([float](360.0 * $scale), [float](250.0 * $scale)))
    )
    $g.DrawLines($arrowPen, $head)

    # Ruby Red Beacon at Arrowhead Peak
    $beaconBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
    $beaconRadius = [float](12.0 * $scale)
    $g.FillEllipse($beaconBrush, [float]((360.0 * $scale) - $beaconRadius), [float]((180.0 * $scale) - $beaconRadius), [float]($beaconRadius * 2.0), [float]($beaconRadius * 2.0))

    $beaconDot = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $dotRadius = [float](5.0 * $scale)
    $g.FillEllipse($beaconDot, [float]((360.0 * $scale) - $dotRadius), [float]((180.0 * $scale) - $dotRadius), [float]($dotRadius * 2.0), [float]($dotRadius * 2.0))

    # 6. High-Contrast Bottom Badge: "TRENDING.TT"
    $badgeRect = New-Object System.Drawing.RectangleF([float](126.0 * $scale), [float](426.0 * $scale), [float](260.0 * $scale), [float](46.0 * $scale))
    $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 9, 13, 22))
    $g.FillRectangle($badgeBrush, $badgeRect)

    $badgeBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 255, 255, 255), [float](1.5 * $scale))
    $g.DrawRectangle($badgeBorderPen, [float](126.0 * $scale), [float](426.0 * $scale), [float](260.0 * $scale), [float](46.0 * $scale))

    $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    $fontSize = [Math]::Max(9, [int](20.0 * $scale))
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString("TRENDING.TT", $font, $textBrush, $badgeRect, $format)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $outputPath ($size x $size)"
}

Generate-Concept2Icon -size 512 -outputPath "public\icon-512.png"
Generate-Concept2Icon -size 192 -outputPath "public\icon-192.png"
Generate-Concept2Icon -size 180 -outputPath "public\apple-touch-icon.png"
