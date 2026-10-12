Add-Type -AssemblyName System.Drawing

$artifactDir = "C:\Users\daryl\.gemini\antigravity\brain\e4a3aa5d-8e13-421d-aa79-7b013ba3ee4e"

function Draw-BaseFlag {
    param($g, [int]$size)
    $scale = [float]($size / 512.0)
    
    # Official Scarlet Red Field
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.FillRectangle($redBrush, $rect)

    # White Border Stripe (Top-Left to Bottom-Right)
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

    # Central Black Stripe
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

    # Subtle inner border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(60, 255, 255, 255), [float](4.0 * $scale))
    $g.DrawRectangle($borderPen, [float](2.0 * $scale), [float](2.0 * $scale), [float]($size - 4.0 * $scale), [float]($size - 4.0 * $scale))
}

# -------------------------------------------------------------
# Concept 1: Modern 3D Ribbon / Glass Trend Arrow (Smooth soaring curve cutting across the flag)
# -------------------------------------------------------------
function Render-Concept1 {
    $size = 512
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    Draw-BaseFlag $g $size

    # Soft dark drop shadow
    $shadowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 0, 0, 0), 48.0)
    $shadowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $shadowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $shadowPath = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(70.0, 410.0)),
        (New-Object System.Drawing.PointF(200.0, 360.0)),
        (New-Object System.Drawing.PointF(320.0, 260.0)),
        (New-Object System.Drawing.PointF(420.0, 130.0))
    )
    $g.DrawCurve($shadowPen, $shadowPath, 0.4)

    # Shadow Arrowhead
    $sHead = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(320.0, 130.0)),
        (New-Object System.Drawing.PointF(420.0, 130.0)),
        (New-Object System.Drawing.PointF(420.0, 230.0))
    )
    $shadowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawLines($shadowPen, $sHead)

    # White Curved Rocket/Ribbon Vector
    $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 40.0)
    $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $path = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(70.0, 400.0)),
        (New-Object System.Drawing.PointF(200.0, 350.0)),
        (New-Object System.Drawing.PointF(320.0, 250.0)),
        (New-Object System.Drawing.PointF(420.0, 120.0))
    )
    $g.DrawCurve($whitePen, $path, 0.4)

    # Arrow Head
    $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $head = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(320.0, 120.0)),
        (New-Object System.Drawing.PointF(420.0, 120.0)),
        (New-Object System.Drawing.PointF(420.0, 220.0))
    )
    $g.DrawLines($whitePen, $head)

    # Glossy / Vibrant Coral Cyan/Ice Accent down the center for ultra-modern app vibe
    $cyanPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 56, 189, 248), 14.0)
    $cyanPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $cyanPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawCurve($cyanPen, $path, 0.4)
    $cHead = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(345.0, 120.0)),
        (New-Object System.Drawing.PointF(420.0, 120.0)),
        (New-Object System.Drawing.PointF(420.0, 195.0))
    )
    $cyanPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawLines($cyanPen, $cHead)

    # Apex Live Star/Beacon
    $starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillEllipse($starBrush, (420.0 - 18.0), (120.0 - 18.0), 36.0, 36.0)
    $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 2, 132, 199))
    $g.FillEllipse($dotBrush, (420.0 - 8.0), (120.0 - 8.0), 16.0, 16.0)

    $bmp.Save("$artifactDir\concept_1_smooth_ribbon.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Concept 1 done"
}

# -------------------------------------------------------------
# Concept 2: Circular Frosted Glass Badge with Bold White Trending Arrow
# (Preserves the full national flag clean and un-obscured in background)
# -------------------------------------------------------------
function Render-Concept2 {
    $size = 512
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    Draw-BaseFlag $g $size

    # Circular Dark Frosted Glass Lens in center
    $center = 256.0
    $radius = 160.0
    
    # Outer drop shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(160, 0, 0, 0))
    $g.FillEllipse($shadowBrush, ($center - $radius - 8.0), ($center - $radius + 8.0), (($radius + 8.0) * 2), (($radius + 8.0) * 2))

    # Dark Glass Plate
    $glassBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215, 15, 23, 42))
    $g.FillEllipse($glassBrush, ($center - $radius), ($center - $radius), ($radius * 2), ($radius * 2))

    # Chrome / White rim
    $rimPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(230, 255, 255, 255), 5.0)
    $g.DrawEllipse($rimPen, ($center - $radius), ($center - $radius), ($radius * 2), ($radius * 2))

    # Glowing Red Accent Ring
    $redRim = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 239, 68, 68), 3.0)
    $g.DrawEllipse($redRim, ($center - $radius + 8.0), ($center - $radius + 8.0), (($radius - 8.0) * 2), (($radius - 8.0) * 2))

    # Bold Clean Ascending Arrow inside the glass circle
    $arrowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 32.0)
    $arrowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $arrowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $arrowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $path = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(150.0, 320.0)),
        (New-Object System.Drawing.PointF(220.0, 250.0)),
        (New-Object System.Drawing.PointF(280.0, 290.0)),
        (New-Object System.Drawing.PointF(360.0, 180.0))
    )
    $g.DrawLines($arrowPen, $path)

    $head = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(290.0, 180.0)),
        (New-Object System.Drawing.PointF(360.0, 180.0)),
        (New-Object System.Drawing.PointF(360.0, 250.0))
    )
    $g.DrawLines($arrowPen, $head)

    # Ruby Red beacon in arrowhead
    $redBeacon = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 239, 68, 68))
    $g.FillEllipse($redBeacon, (360.0 - 12.0), (180.0 - 12.0), 24.0, 24.0)

    $bmp.Save("$artifactDir\concept_2_frosted_lens.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Concept 2 done"
}

# -------------------------------------------------------------
# Concept 3: Solid Silhouette Trending Arrow (Filled geometric rocket/triangle arrow)
# -------------------------------------------------------------
function Render-Concept3 {
    $size = 512
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    Draw-BaseFlag $g $size

    # Heavy dark shadow
    $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(190, 0, 0, 0))
    $sOffset = 10.0
    
    # Polygon points for solid geometric dynamic trending arrow
    $polyPoints = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(90.0, 390.0)),
        (New-Object System.Drawing.PointF(190.0, 280.0)),
        (New-Object System.Drawing.PointF(260.0, 330.0)),
        (New-Object System.Drawing.PointF(340.0, 220.0)),
        (New-Object System.Drawing.PointF(340.0, 290.0)),
        (New-Object System.Drawing.PointF(440.0, 130.0)),
        (New-Object System.Drawing.PointF(280.0, 130.0)),
        (New-Object System.Drawing.PointF(320.0, 180.0)),
        (New-Object System.Drawing.PointF(250.0, 270.0)),
        (New-Object System.Drawing.PointF(190.0, 220.0)),
        (New-Object System.Drawing.PointF(70.0, 350.0))
    )

    $sPolyPoints = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(90.0, [float](390.0 + $sOffset))),
        (New-Object System.Drawing.PointF(190.0, [float](280.0 + $sOffset))),
        (New-Object System.Drawing.PointF(260.0, [float](330.0 + $sOffset))),
        (New-Object System.Drawing.PointF(340.0, [float](220.0 + $sOffset))),
        (New-Object System.Drawing.PointF(340.0, [float](290.0 + $sOffset))),
        (New-Object System.Drawing.PointF(440.0, [float](130.0 + $sOffset))),
        (New-Object System.Drawing.PointF(280.0, [float](130.0 + $sOffset))),
        (New-Object System.Drawing.PointF(320.0, [float](180.0 + $sOffset))),
        (New-Object System.Drawing.PointF(250.0, [float](270.0 + $sOffset))),
        (New-Object System.Drawing.PointF(190.0, [float](220.0 + $sOffset))),
        (New-Object System.Drawing.PointF(70.0, [float](350.0 + $sOffset)))
    )
    $g.FillPolygon($shadowBrush, $sPolyPoints)

    # Solid White Fill
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillPolygon($whiteBrush, $polyPoints)

    # Inset subtle silver border
    $silverPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 226, 232, 240), 4.0)
    $g.DrawPolygon($silverPen, $polyPoints)

    # Inner live red pulse bar inside the arrow
    $innerRed = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
    $innerPoints = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(100.0, 370.0)),
        (New-Object System.Drawing.PointF(190.0, 270.0)),
        (New-Object System.Drawing.PointF(258.0, 320.0)),
        (New-Object System.Drawing.PointF(380.0, 160.0)),
        (New-Object System.Drawing.PointF(350.0, 160.0)),
        (New-Object System.Drawing.PointF(250.0, 280.0)),
        (New-Object System.Drawing.PointF(190.0, 240.0)),
        (New-Object System.Drawing.PointF(90.0, 350.0))
    )
    $g.FillPolygon($innerRed, $innerPoints)

    $bmp.Save("$artifactDir\concept_3_solid_silhouette.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Concept 3 done"
}

# -------------------------------------------------------------
# Concept 4: Glowing Neon Laser Pulse Arrow on Flag
# -------------------------------------------------------------
function Render-Concept4 {
    $size = 512
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    Draw-BaseFlag $g $size

    # Dark background underglow so neon stands out intensely
    $underPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 0, 0, 0), 60.0)
    $underPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $underPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $underPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $path = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(90.0, 380.0)),
        (New-Object System.Drawing.PointF(180.0, 290.0)),
        (New-Object System.Drawing.PointF(270.0, 340.0)),
        (New-Object System.Drawing.PointF(420.0, 150.0))
    )
    $head = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(310.0, 150.0)),
        (New-Object System.Drawing.PointF(420.0, 150.0)),
        (New-Object System.Drawing.PointF(420.0, 260.0))
    )
    $g.DrawLines($underPen, $path)
    $g.DrawLines($underPen, $head)

    # Neon Outer Cyan/Electric Glow
    $glowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(160, 56, 189, 248), 38.0)
    $glowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $glowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $glowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawLines($glowPen, $path)
    $g.DrawLines($glowPen, $head)

    # Brilliant Pure White Core Laser
    $corePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 18.0)
    $corePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $corePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $corePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawLines($corePen, $path)
    $g.DrawLines($corePen, $head)

    # Beacon Apex
    $bOuter = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 56, 189, 248))
    $g.FillEllipse($bOuter, (420.0 - 24.0), (150.0 - 24.0), 48.0, 48.0)
    $bCore = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillEllipse($bCore, (420.0 - 12.0), (150.0 - 12.0), 24.0, 24.0)

    $bmp.Save("$artifactDir\concept_4_neon_laser.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Concept 4 done"
}

# -------------------------------------------------------------
# Concept 5: Minimalist Integrated Flag Vector
# (The diagonal black stripe of the flag ITSELF turns upward at the end into the white arrow)
# -------------------------------------------------------------
function Render-Concept5 {
    $size = 512
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    Draw-BaseFlag $g $size

    # Ultra-clean Sharp Chevron Trending Mark hovering at center-right
    $shadowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 0, 0, 0), 48.0)
    $shadowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Square
    $shadowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Square
    $shadowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Miter

    $cPath = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(110.0, 390.0)),
        (New-Object System.Drawing.PointF(220.0, 280.0)),
        (New-Object System.Drawing.PointF(300.0, 340.0)),
        (New-Object System.Drawing.PointF(420.0, 160.0))
    )
    $cHead = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(320.0, 160.0)),
        (New-Object System.Drawing.PointF(420.0, 160.0)),
        (New-Object System.Drawing.PointF(420.0, 260.0))
    )
    $g.DrawLines($shadowPen, $cPath)
    $g.DrawLines($shadowPen, $cHead)

    # Sharp Pure White Precision Chevron
    $sharpPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 36.0)
    $sharpPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Square
    $sharpPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Square
    $sharpPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Miter
    $g.DrawLines($sharpPen, $cPath)
    $g.DrawLines($sharpPen, $cHead)

    $bmp.Save("$artifactDir\concept_5_sharp_precision.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Concept 5 done"
}

Render-Concept1
Render-Concept2
Render-Concept3
Render-Concept4
Render-Concept5
