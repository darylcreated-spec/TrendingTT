Add-Type -AssemblyName System.Drawing

function Render-SampleToPng {
    param(
        [string]$optionName,
        [string]$outputPath
    )

    $size = 512
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Red Field
    $redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $g.FillRectangle($redBrush, $rect)

    # White Border Stripe
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $polyWhite = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(0.0, 0.0)),
        (New-Object System.Drawing.PointF(120.0, 0.0)),
        (New-Object System.Drawing.PointF(512.0, 392.0)),
        (New-Object System.Drawing.PointF(512.0, 512.0)),
        (New-Object System.Drawing.PointF(392.0, 512.0)),
        (New-Object System.Drawing.PointF(0.0, 120.0))
    )
    $g.FillPolygon($whiteBrush, $polyWhite)

    # Black Stripe
    $blackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 10, 10, 12))
    $polyBlack = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(0.0, 0.0)),
        (New-Object System.Drawing.PointF(88.0, 0.0)),
        (New-Object System.Drawing.PointF(512.0, 424.0)),
        (New-Object System.Drawing.PointF(512.0, 512.0)),
        (New-Object System.Drawing.PointF(424.0, 512.0)),
        (New-Object System.Drawing.PointF(0.0, 88.0))
    )
    $g.FillPolygon($blackBrush, $polyBlack)

    # Shadow under arrow
    $shadowPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 0, 0, 0), 46.0)
    $shadowPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $shadowPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $shadowPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $shadowPath = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(88.0, 386.0)),
        (New-Object System.Drawing.PointF(190.0, 284.0)),
        (New-Object System.Drawing.PointF(280.0, 346.0)),
        (New-Object System.Drawing.PointF(416.0, 166.0))
    )
    $shadowHead = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(316.0, 166.0)),
        (New-Object System.Drawing.PointF(416.0, 166.0)),
        (New-Object System.Drawing.PointF(416.0, 266.0))
    )
    $g.DrawLines($shadowPen, $shadowPath)
    $g.DrawLines($shadowPen, $shadowHead)

    # Arrow Path
    $arrowPath = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(88.0, 380.0)),
        (New-Object System.Drawing.PointF(190.0, 278.0)),
        (New-Object System.Drawing.PointF(280.0, 340.0)),
        (New-Object System.Drawing.PointF(416.0, 160.0))
    )
    $arrowHead = [System.Drawing.PointF[]]@(
        (New-Object System.Drawing.PointF(316.0, 160.0)),
        (New-Object System.Drawing.PointF(416.0, 160.0)),
        (New-Object System.Drawing.PointF(416.0, 260.0))
    )

    if ($optionName -eq "A") {
        # Pure White
        $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 42.0)
        $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
        $g.DrawLines($whitePen, $arrowPath)
        $g.DrawLines($whitePen, $arrowHead)

        $beaconOuter = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $g.FillEllipse($beaconOuter, (416.0 - 22.0), (160.0 - 22.0), 44.0, 44.0)
        $beaconInner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
        $g.FillEllipse($beaconInner, (416.0 - 14.0), (160.0 - 14.0), 28.0, 28.0)
    }
    elseif ($optionName -eq "B") {
        # White casing + Golden pulse
        $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 42.0)
        $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
        $g.DrawLines($whitePen, $arrowPath)
        $g.DrawLines($whitePen, $arrowHead)

        $amberPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 253, 224, 71), 18.0)
        $amberPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $amberPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $amberPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
        $g.DrawLines($amberPen, $arrowPath)
        $amberHead = [System.Drawing.PointF[]]@(
            (New-Object System.Drawing.PointF(338.0, 160.0)),
            (New-Object System.Drawing.PointF(416.0, 160.0)),
            (New-Object System.Drawing.PointF(416.0, 238.0))
        )
        $g.DrawLines($amberPen, $amberHead)

        $beaconOuter = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $g.FillEllipse($beaconOuter, (416.0 - 22.0), (160.0 - 22.0), 44.0, 44.0)
        $beaconInner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
        $g.FillEllipse($beaconInner, (416.0 - 14.0), (160.0 - 14.0), 28.0, 28.0)
        $beaconCore = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 253, 224, 71))
        $g.FillEllipse($beaconCore, (416.0 - 6.0), (160.0 - 6.0), 12.0, 12.0)
    }
    elseif ($optionName -eq "C") {
        # Black halo outline + White arrow + Radar ring
        $outerPen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 54.0)
        $outerPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $outerPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $outerPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
        $g.DrawLines($outerPen, $arrowPath)
        $g.DrawLines($outerPen, $arrowHead)

        $whitePen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 38.0)
        $whitePen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
        $whitePen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
        $whitePen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
        $g.DrawLines($whitePen, $arrowPath)
        $g.DrawLines($whitePen, $arrowHead)

        $radarPen = New-Object System.Drawing.Pen([System.Drawing.Color]::White, 4.0)
        $radarPen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash
        $g.DrawEllipse($radarPen, (416.0 - 32.0), (160.0 - 32.0), 64.0, 64.0)

        $beaconOuter = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
        $g.FillEllipse($beaconOuter, (416.0 - 16.0), (160.0 - 16.0), 32.0, 32.0)
        $beaconInner = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 206, 17, 38))
        $g.FillEllipse($beaconInner, (416.0 - 10.0), (160.0 - 10.0), 20.0, 20.0)
    }

    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Rendered sample $optionName to $outputPath"
}

$artifactDir = "C:\Users\daryl\.gemini\antigravity\brain\e4a3aa5d-8e13-421d-aa79-7b013ba3ee4e"
Render-SampleToPng -optionName "A" -outputPath "$artifactDir\sample_icon_A.png"
Render-SampleToPng -optionName "B" -outputPath "$artifactDir\sample_icon_B.png"
Render-SampleToPng -optionName "C" -outputPath "$artifactDir\sample_icon_C.png"
