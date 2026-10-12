Add-Type -AssemblyName System.Drawing

function Generate-PwaIcon {
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

    # 1. Base Red Field of Trinidad and Tobago National Flag (#CE1126)
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.FillRectangle($redBrush, $rect)

    # 2. National Flag Diagonal Band: White border stripe (Top-Left to Bottom-Right)
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

    # 3. National Flag Central Black stripe
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

    # 4. Shadow under the Trending Arrow
    $shadowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 0, 0, 0), [float](46.0 * $scale))
    $shadowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $shadowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $shadowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $shadowOffset = [float](6.0 * $scale)
    $shadowPath = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF([float](88.0 * $scale), [float]((380.0 * $scale) + $shadowOffset))),
        (New-Object System.Drawing.PointF([float](190.0 * $scale), [float]((278.0 * $scale) + $shadowOffset))),
        (New-Object System.Drawing.PointF([float](280.0 * $scale), [float]((340.0 * $scale) + $shadowOffset))),
        (New-Object System.Drawing.PointF([float](416.0 * $scale), [float]((160.0 * $scale) + $shadowOffset)))
    )
    $g.DrawLines($shadowPen, $shadowPath)

    $shadowHead = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF([float](316.0 * $scale), [float]((160.0 * $scale) + $shadowOffset))),
        (New-Object System.Drawing.PointF([float](416.0 * $scale), [float]((160.0 * $scale) + $shadowOffset))),
        (New-Object System.Drawing.PointF([float](416.0 * $scale), [float]((260.0 * $scale) + $shadowOffset)))
    )
    $g.DrawLines($shadowPen, $shadowHead)

    # 5. Crisp White Trending Arrow Body
    $whiteArrowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float](38.0 * $scale))
    $whiteArrowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whiteArrowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whiteArrowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $arrowPath = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF([float](88.0 * $scale), [float](380.0 * $scale))),
        (New-Object System.Drawing.PointF([float](190.0 * $scale), [float](278.0 * $scale))),
        (New-Object System.Drawing.PointF([float](280.0 * $scale), [float](340.0 * $scale))),
        (New-Object System.Drawing.PointF([float](416.0 * $scale), [float](160.0 * $scale)))
    )
    $g.DrawLines($whiteArrowPen, $arrowPath)

    $arrowHead = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF([float](316.0 * $scale), [float](160.0 * $scale))),
        (New-Object System.Drawing.PointF([float](416.0 * $scale), [float](160.0 * $scale))),
        (New-Object System.Drawing.PointF([float](416.0 * $scale), [float](260.0 * $scale)))
    )
    $g.DrawLines($whiteArrowPen, $arrowHead)

    # 6. Vibrant Golden-Amber core stripe inside the arrow
    $amberPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 253, 224, 71), [float](16.0 * $scale))
    $amberPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $amberPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $amberPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawLines($amberPen, $arrowPath)

    $amberHead = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF([float](340.0 * $scale), [float](160.0 * $scale))),
        (New-Object System.Drawing.PointF([float](416.0 * $scale), [float](160.0 * $scale))),
        (New-Object System.Drawing.PointF([float](416.0 * $scale), [float](236.0 * $scale)))
    )
    $g.DrawLines($amberPen, $amberHead)

    # 7. Beacon Dot at the apex
    $outerBeacon = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillEllipse($outerBeacon, [float]((416.0 * $scale) - (20.0 * $scale)), [float]((160.0 * $scale) - (20.0 * $scale)), [float](40.0 * $scale), [float](40.0 * $scale))

    $innerBeacon = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
    $g.FillEllipse($innerBeacon, [float]((416.0 * $scale) - (12.0 * $scale)), [float]((160.0 * $scale) - (12.0 * $scale)), [float](24.0 * $scale), [float](24.0 * $scale))

    # 8. High-Contrast Bottom Badge: "TRENDING.TT"
    $badgeRect = New-Object System.Drawing.RectangleF([float](76.0 * $scale), [float](420.0 * $scale), [float](360.0 * $scale), [float](56.0 * $scale))
    $badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(235, 10, 15, 26))
    $g.FillRectangle($badgeBrush, $badgeRect)

    $badgeBorderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 255, 255, 255), [float](2.0 * $scale))
    $g.DrawRectangle($badgeBorderPen, [float](76.0 * $scale), [float](420.0 * $scale), [float](360.0 * $scale), [float](56.0 * $scale))

    $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    $fontSize = [Math]::Max(10, [int](26.0 * $scale))
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

Generate-PwaIcon -size 512 -outputPath "public\icon-512.png"
Generate-PwaIcon -size 192 -outputPath "public\icon-192.png"
Generate-PwaIcon -size 180 -outputPath "public\apple-touch-icon.png"
