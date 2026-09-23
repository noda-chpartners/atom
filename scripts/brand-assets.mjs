import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";

const icon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#141311"/>
  <path fill="#f3efe6" fill-rule="evenodd" d="M16 5.8 27 26.8h-4.1l-2.3-5.3H11.4l-2.3 5.3H5L16 5.8Zm0 8.2-2.8 6.4h5.6L16 14Z"/>
</svg>`;

const svg = Buffer.from(icon);
await sharp(svg).resize(32, 32).png().toFile("public/favicon-32.png");
await sharp(svg).resize(180, 180).png().toFile("public/apple-touch-icon.png");

const ps1 = String.raw`
param(
  [string]$Source,
  [string]$Dest,
  [string]$Eyebrow,
  [string]$Title,
  [string]$Line
)
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Image]::FromFile($Source)
$bmp = New-Object System.Drawing.Bitmap 1200, 630
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::FromArgb(255, 20, 19, 17))
$scale = [Math]::Max(1200 / $src.Width, 630 / $src.Height)
$drawW = $src.Width * $scale
$drawH = $src.Height * $scale
$g.DrawImage($src, [single]((1200 - $drawW) / 2), [single]((630 - $drawH) / 2), [single]$drawW, [single]$drawH)
$rect = New-Object System.Drawing.Rectangle 0, 0, 1200, 630
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $rect,
  [System.Drawing.Color]::FromArgb(230, 20, 19, 17),
  [System.Drawing.Color]::FromArgb(40, 20, 19, 17),
  0
)
$g.FillRectangle($brush, $rect)
$cream = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 243, 239, 230))
$muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 231, 179, 154))
$fontEye = New-Object System.Drawing.Font("Yu Gothic", 22, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fontTitle = New-Object System.Drawing.Font("Yu Mincho", 64, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$fontLine = New-Object System.Drawing.Font("Yu Gothic", 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString($Eyebrow, $fontEye, $muted, 78, 168)
$g.DrawString($Title, $fontTitle, $cream, 72, 214)
$g.DrawString($Line, $fontLine, $cream, 78, 390)
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$params = New-Object System.Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)
$bmp.Save($Dest, $codec, $params)
$g.Dispose()
$bmp.Dispose()
$src.Dispose()
$brush.Dispose()
$cream.Dispose()
$muted.Dispose()
$fontEye.Dispose()
$fontTitle.Dispose()
$fontLine.Dispose()
`;

const png32 = readFileSync("public/favicon-32.png");
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
const entry = Buffer.alloc(16);
entry.writeUInt8(32, 0);
entry.writeUInt8(32, 1);
entry.writeUInt16LE(1, 4);
entry.writeUInt16LE(32, 6);
entry.writeUInt32LE(png32.length, 8);
entry.writeUInt32LE(22, 12);
writeFileSync("public/favicon.ico", Buffer.concat([header, entry, png32]));

const ps1Path = join(tmpdir(), "atom-ogp.ps1");
writeFileSync(ps1Path, ps1);
const result = spawnSync(
	"powershell",
	[
		"-NoProfile",
		"-File",
		ps1Path,
		"-Source",
		"src/assets/images/hero-studio.jpg",
		"-Dest",
		"public/ogp.jpg",
		"-Eyebrow",
		"株式会社ATOM",
		"-Title",
		"あなたの声が、未来を変える。",
		"-Line",
		"動画編集  /  SNS運用  /  営業",
	],
	{ stdio: "inherit" },
);

if (result.status !== 0) {
	process.exit(result.status ?? 1);
}
