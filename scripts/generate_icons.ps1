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

    # Background plate: Rich deep slate / black
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.FillRectangle($bgBrush, $rect)

    # Scale factor based on 512 base size
    $scale = $size / 512.0

    # Trinidad Flag subtle diagonal band
    $diagBrushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 255, 255, 255))
    $polyPointsWhite = @(
        (New-Object System.Drawing.PointF(0, (460 * $scale))),
        (New-Object System.Drawing.PointF((70 * $scale), $size)),
        (New-Object System.Drawing.PointF($size, (70 * $scale))),
        (New-Object System.Drawing.PointF((442 * $scale), 0))
    )
    $g.FillPolygon($diagBrushWhite, $polyPointsWhite)

    $diagBrushBlack = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 2, 6, 23))
    $polyPointsBlack = @(
        (New-Object System.Drawing.PointF(0, (488 * $scale))),
        (New-Object System.Drawing.PointF((36 * $scale), $size)),
        (New-Object System.Drawing.PointF($size, (36 * $scale))),
        (New-Object System.Drawing.PointF((476 * $scale), 0))
    )
    $g.FillPolygon($diagBrushBlack, $polyPointsBlack)

    # Outer border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(120, 220, 38, 38), (4 * $scale))
    $g.DrawRectangle($borderPen, (2 * $scale), (2 * $scale), ($size - 4 * $scale), ($size - 4 * $scale))

    # Glow effect behind trending line
    $glowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 239, 68, 68), (56 * $scale))
    $glowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $glowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $glowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $pathPoints = @(
        (New-Object System.Drawing.PointF((96 * $scale), (360 * $scale))),
        (New-Object System.Drawing.PointF((196 * $scale), (260 * $scale))),
        (New-Object System.Drawing.PointF((284 * $scale), (320 * $scale))),
        (New-Object System.Drawing.PointF((416 * $scale), (150 * $scale)))
    )
    $g.DrawLines($glowPen, $pathPoints)

    # Core Trending Flare Arrow (Scarlet Red)
    $trendPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 220, 38, 38), (38 * $scale))
    $trendPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $trendPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $trendPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawLines($trendPen, $pathPoints)

    # Arrow Head
    $arrowHeadPoints = @(
        (New-Object System.Drawing.PointF((320 * $scale), (150 * $scale))),
        (New-Object System.Drawing.PointF((416 * $scale), (150 * $scale))),
        (New-Object System.Drawing.PointF((416 * $scale), (246 * $scale)))
    )
    $g.DrawLines($trendPen, $arrowHeadPoints)

    # Beacon Apex Circle (White center with crimson aura)
    $auraBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 255, 68, 68))
    $auraRadius = 26 * $scale
    $g.FillEllipse($auraBrush, ((416 * $scale) - $auraRadius), ((150 * $scale) - $auraRadius), ($auraRadius * 2), ($auraRadius * 2))

    $beaconBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $beaconRadius = 16 * $scale
    $g.FillEllipse($beaconBrush, ((416 * $scale) - $beaconRadius), ((150 * $scale) - $beaconRadius), ($beaconRadius * 2), ($beaconRadius * 2))

    # Bottom Text "TRENDING.TT"
    $fontFamily = [System.Drawing.FontFamily]::GenericSansSerif
    $fontSize = [Math]::Max(12, [int](34 * $scale))
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $textRect = New-Object System.Drawing.RectangleF(0, (405 * $scale), $size, (60 * $scale))
    $g.DrawString("TRENDING.TT", $font, $textBrush, $textRect, $format)

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Generated $outputPath ($size x $size)"
}

Generate-PwaIcon -size 512 -outputPath "public\icon-512.png"
Generate-PwaIcon -size 192 -outputPath "public\icon-192.png"
Generate-PwaIcon -size 180 -outputPath "public\apple-touch-icon.png"
