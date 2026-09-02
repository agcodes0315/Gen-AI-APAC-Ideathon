param(
  [string]$ProjectRoot = "."
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# ============================================================
# MIRRORTRACE — FINAL EXACT TWO-CSS MERGER
#
# RESULT
# ------
# src/styles/mirrortrace-bundle-1.css
# src/styles/mirrortrace-bundle-2.css
#
# It preserves the CURRENT UI by compiling the CSS in the same
# module-import order the app currently uses.
#
# It DOES NOT rewrite JSX, content, Firebase, Gemini, MirrorRoom,
# Admin logic, journal logic, or API code.
#
# src/index.css stays untouched.
# ============================================================

function Fail([string]$Message) {
  throw "[MirrorTrace CSS Merge] $Message"
}

function Full([string]$Path) {
  return [System.IO.Path]::GetFullPath($Path)
}

function WriteUtf8([string]$Path, [string]$Content) {
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8)
}

function GetImports([string]$FilePath) {
  $text = [System.IO.File]::ReadAllText($FilePath)

  # Static ESM imports, including multiline imports.
  $pattern = '(?ms)^[ \t]*import\b(?:(?!;).)*?(?:from[ \t\r\n]+)?[''"]([^''"]+)[''"][ \t]*;'
  $matches = [regex]::Matches($text, $pattern)

  $list = New-Object System.Collections.Generic.List[string]
  foreach ($m in $matches) {
    $list.Add($m.Groups[1].Value)
  }
  return $list
}

function ResolveRelative([string]$Importer, [string]$Specifier) {
  if (-not $Specifier.StartsWith(".")) {
    return $null
  }

  $base = Split-Path -Parent $Importer
  $candidate = Join-Path $base $Specifier

  foreach ($suffix in @("", ".ts", ".tsx", ".js", ".jsx", ".css")) {
    $p = $candidate + $suffix
    if (Test-Path -LiteralPath $p -PathType Leaf) {
      return Full $p
    }
  }

  if (Test-Path -LiteralPath $candidate -PathType Container) {
    foreach ($name in @(
      "index.ts",
      "index.tsx",
      "index.js",
      "index.jsx",
      "index.css"
    )) {
      $p = Join-Path $candidate $name
      if (Test-Path -LiteralPath $p -PathType Leaf) {
        return Full $p
      }
    }
  }

  return $null
}

function ExpandCss(
  [string]$CssPath,
  [System.Collections.Generic.List[string]]$Stack
) {
  $cssFull = Full $CssPath

  if ($Stack.Contains($cssFull)) {
    Fail "Circular CSS @import detected: $cssFull"
  }

  $Stack.Add($cssFull)

  $text = [System.IO.File]::ReadAllText($cssFull)
  $dir = Split-Path -Parent $cssFull

  # Expand LOCAL @imports in-place. Remote @imports remain untouched.
  $pattern = '(?m)^[ \t]*@import[ \t]+(?:url\()?[''"]([^''"]+)[''"]\)?[ \t]*;[ \t]*$'

  $expanded = [regex]::Replace(
    $text,
    $pattern,
    {
      param($m)

      $spec = $m.Groups[1].Value

      if (
        $spec.StartsWith("http://") -or
        $spec.StartsWith("https://") -or
        $spec.StartsWith("//")
      ) {
        return $m.Value
      }

      $target = Join-Path $dir $spec

      if (-not (Test-Path -LiteralPath $target -PathType Leaf)) {
        Fail "Missing CSS @import '$spec' inside '$cssFull'"
      }

      $childStack = New-Object System.Collections.Generic.List[string]
      foreach ($x in $Stack) {
        $childStack.Add($x)
      }

      $child = ExpandCss -CssPath $target -Stack $childStack

      return @"

/* ===== EXPANDED @import: $spec ===== */
$child
/* ===== END @import: $spec ===== */

"@
    }
  )

  [void]$Stack.RemoveAt($Stack.Count - 1)
  return $expanded
}

# ------------------------------------------------------------
# Project
# ------------------------------------------------------------

$root = Full $ProjectRoot
$src = Join-Path $root "src"
$styles = Join-Path $src "styles"
$app = Join-Path $src "App.tsx"
$main = Join-Path $src "main.tsx"
$indexCss = Join-Path $src "index.css"

if (-not (Test-Path -LiteralPath $app -PathType Leaf)) {
  Fail "src/App.tsx not found."
}

if (-not (Test-Path -LiteralPath $main -PathType Leaf)) {
  Fail "src/main.tsx not found."
}

if (-not (Test-Path -LiteralPath $styles -PathType Container)) {
  Fail "src/styles folder not found."
}

Write-Host ""
Write-Host "MirrorTrace final two-CSS merger"
Write-Host "================================"
Write-Host ""

# ------------------------------------------------------------
# Backup FIRST
# ------------------------------------------------------------

$backup = Join-Path $root ".mirrortrace-before-two-css"

if (Test-Path -LiteralPath $backup) {
  Remove-Item -LiteralPath $backup -Recurse -Force
}

New-Item -ItemType Directory -Path $backup | Out-Null
Copy-Item -LiteralPath $src -Destination (Join-Path $backup "src") -Recurse -Force

Write-Host "[1/7] Full src backup created:"
Write-Host "      .mirrortrace-before-two-css"

# ------------------------------------------------------------
# Walk the actual App import graph in runtime order.
# This is what preserves the current UI cascade.
# ------------------------------------------------------------

$visitedModules = New-Object 'System.Collections.Generic.HashSet[string]'
$visitedCss = New-Object 'System.Collections.Generic.HashSet[string]'
$orderedCss = New-Object System.Collections.Generic.List[object]

function VisitModule([string]$ModulePath) {
  $module = Full $ModulePath

  if ($visitedModules.Contains($module)) {
    return
  }

  [void]$visitedModules.Add($module)

  foreach ($specifier in (GetImports $module)) {
    if (-not $specifier.StartsWith(".")) {
      continue
    }

    $resolved = ResolveRelative -Importer $module -Specifier $specifier

    if ($null -eq $resolved) {
      if ($specifier.EndsWith(".css")) {
        Fail "Unresolved CSS import '$specifier' from '$module'."
      }
      continue
    }

    $ext = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()

    if ($ext -eq ".css") {
      # index.css is a global Tailwind/base file and stays in main.tsx.
      if (
        (Test-Path -LiteralPath $indexCss) -and
        $resolved -eq (Full $indexCss)
      ) {
        continue
      }

      if (-not $visitedCss.Contains($resolved)) {
        [void]$visitedCss.Add($resolved)

        $stack = New-Object System.Collections.Generic.List[string]
        $expanded = ExpandCss -CssPath $resolved -Stack $stack

        $orderedCss.Add(
          [PSCustomObject]@{
            Path = $resolved
            ImportedBy = $module
            Css = $expanded
          }
        )
      }

      continue
    }

    if ($ext -in @(".ts", ".tsx", ".js", ".jsx")) {
      VisitModule $resolved
    }
  }
}

VisitModule $app

if ($orderedCss.Count -eq 0) {
  Fail "No CSS files were discovered from the App.tsx import graph."
}

Write-Host ""
Write-Host "[2/7] Current active CSS order:"
for ($i = 0; $i -lt $orderedCss.Count; $i++) {
  $rel = [System.IO.Path]::GetRelativePath($root, $orderedCss[$i].Path)
  Write-Host ("      {0,2}. {1}" -f ($i + 1), $rel)
}

# ------------------------------------------------------------
# Build exact ordered chunks.
# ------------------------------------------------------------

$chunks = New-Object System.Collections.Generic.List[string]

foreach ($item in $orderedCss) {
  $rel = [System.IO.Path]::GetRelativePath($root, $item.Path)
  $importer = [System.IO.Path]::GetRelativePath($root, $item.ImportedBy)

  $chunks.Add(@"

/* ============================================================
   BEGIN: $rel
   Original importing module: $importer
   ============================================================ */
$($item.Css)
/* ============================================================
   END: $rel
   ============================================================ */

"@)
}

# ------------------------------------------------------------
# Split the ordered CSS stream into TWO contiguous bundles.
# No selector/value rewriting. No reordering.
# ------------------------------------------------------------

$total = 0
foreach ($c in $chunks) {
  $total += $c.Length
}

$target = [Math]::Floor($total / 2)
$running = 0
$split = 1

for ($i = 0; $i -lt $chunks.Count; $i++) {
  $running += $chunks[$i].Length
  if ($running -ge $target) {
    $split = $i + 1
    break
  }
}

if ($split -ge $chunks.Count) {
  $split = [Math]::Max(1, $chunks.Count - 1)
}

$b1 = @"
/* ============================================================
   MIRRORTRACE BUNDLE 1 OF 2
   Generated from the current working CSS cascade.
   DO NOT reorder relative to bundle 2.
   ============================================================ */

"@

$b2 = @"
/* ============================================================
   MIRRORTRACE BUNDLE 2 OF 2
   Generated from the current working CSS cascade.
   DO NOT reorder relative to bundle 1.
   ============================================================ */

"@

for ($i = 0; $i -lt $chunks.Count; $i++) {
  if ($i -lt $split) {
    $b1 += $chunks[$i]
  }
  else {
    $b2 += $chunks[$i]
  }
}

$bundle1 = Join-Path $styles "mirrortrace-bundle-1.css"
$bundle2 = Join-Path $styles "mirrortrace-bundle-2.css"

WriteUtf8 $bundle1 $b1
WriteUtf8 $bundle2 $b2

if ((Get-Item $bundle1).Length -lt 100) {
  Fail "bundle 1 validation failed."
}

if ((Get-Item $bundle2).Length -lt 100) {
  Fail "bundle 2 validation failed."
}

Write-Host ""
Write-Host "[3/7] Created the two replacement files:"
Write-Host "      src/styles/mirrortrace-bundle-1.css"
Write-Host "      src/styles/mirrortrace-bundle-2.css"

# ------------------------------------------------------------
# Remove CSS imports from all source modules.
# Keep ONLY main.tsx -> ./index.css.
# ------------------------------------------------------------

$sourceFiles = Get-ChildItem -LiteralPath $src -Recurse -File |
  Where-Object {
    $_.Extension.ToLowerInvariant() -in @(".ts", ".tsx", ".js", ".jsx")
  }

$cssImportPattern =
  '(?ms)^[ \t]*import\b(?:(?!;).)*?[''"]([^''"]+\.css)[''"][ \t]*;[ \t]*\r?\n?'

foreach ($file in $sourceFiles) {
  $text = [System.IO.File]::ReadAllText($file.FullName)

  $updated = [regex]::Replace(
    $text,
    $cssImportPattern,
    {
      param($m)

      $spec = $m.Groups[1].Value

      if (
        $file.FullName -eq (Full $main) -and
        $spec -eq "./index.css"
      ) {
        return $m.Value
      }

      return ""
    }
  )

  if ($updated -ne $text) {
    WriteUtf8 $file.FullName $updated
  }
}

# ------------------------------------------------------------
# App.tsx owns the two bundles.
# ------------------------------------------------------------

$appText = [System.IO.File]::ReadAllText($app)

$appText =
  "import './styles/mirrortrace-bundle-1.css';`r`n" +
  "import './styles/mirrortrace-bundle-2.css';`r`n`r`n" +
  $appText

WriteUtf8 $app $appText

Write-Host "[4/7] Cleaned old CSS imports from TS/TSX files."
Write-Host "      App.tsx now imports only bundle 1 + bundle 2."

# ------------------------------------------------------------
# Delete ALL old CSS files in src/styles.
# Keep only bundle 1 + bundle 2.
# ------------------------------------------------------------

Get-ChildItem -LiteralPath $styles -File -Filter "*.css" |
  Where-Object {
    $_.Name -notin @(
      "mirrortrace-bundle-1.css",
      "mirrortrace-bundle-2.css"
    )
  } |
  Remove-Item -Force

# Remove CSS files OUTSIDE src/styles that were part of the active
# App CSS graph, except src/index.css.
foreach ($cssPath in $visitedCss) {
  if (
    $cssPath -ne (Full $bundle1) -and
    $cssPath -ne (Full $bundle2) -and
    (
      -not (Test-Path -LiteralPath $indexCss) -or
      $cssPath -ne (Full $indexCss)
    ) -and
    -not $cssPath.StartsWith((Full $styles))
  ) {
    if (Test-Path -LiteralPath $cssPath -PathType Leaf) {
      Remove-Item -LiteralPath $cssPath -Force
    }
  }
}

Write-Host "[5/7] Removed old active MirrorTrace CSS files."

# ------------------------------------------------------------
# Validation: exactly 2 CSS files in src/styles.
# ------------------------------------------------------------

$remaining = Get-ChildItem -LiteralPath $styles -File -Filter "*.css"

if ($remaining.Count -ne 2) {
  Fail "Expected exactly two CSS files in src/styles; found $($remaining.Count)."
}

# ------------------------------------------------------------
# Validation: only allowed CSS imports remain.
# ------------------------------------------------------------

$importsLeft = Get-ChildItem -LiteralPath $src -Recurse -File |
  Where-Object {
    $_.Extension.ToLowerInvariant() -in @(".ts", ".tsx", ".js", ".jsx")
  } |
  Select-String -Pattern "import\s+['""][^'""]+\.css['""]"

$unexpected = New-Object System.Collections.Generic.List[string]

foreach ($match in $importsLeft) {
  $line = $match.Line.Trim()

  $isIndex =
    (
      $match.Path -eq (Full $main) -and
      $line -match "['""]\./index\.css['""]"
    )

  $isBundle =
    (
      $match.Path -eq (Full $app) -and
      (
        $line -match "mirrortrace-bundle-1\.css" -or
        $line -match "mirrortrace-bundle-2\.css"
      )
    )

  if (-not ($isIndex -or $isBundle)) {
    $unexpected.Add(
      "$($match.Path):$($match.LineNumber): $line"
    )
  }
}

if ($unexpected.Count -gt 0) {
  Write-Host ""
  Write-Host "Unexpected CSS imports remain:" -ForegroundColor Yellow
  foreach ($x in $unexpected) {
    Write-Host "      $x"
  }
  Fail "CSS import validation failed."
}

Write-Host "[6/7] PASS: import validation succeeded."

# ------------------------------------------------------------
# Validate deleted CSS references.
# ------------------------------------------------------------

$stale = Get-ChildItem -LiteralPath $src -Recurse -File |
  Where-Object {
    $_.Extension.ToLowerInvariant() -in @(
      ".ts", ".tsx", ".js", ".jsx", ".css"
    )
  } |
  Select-String -Pattern "mirrortrace-(?!bundle-1|bundle-2)[A-Za-z0-9_-]+\.css"

if ($stale) {
  Write-Host ""
  Write-Host "Stale CSS references:" -ForegroundColor Yellow
  $stale | ForEach-Object {
    Write-Host "      $($_.Path):$($_.LineNumber): $($_.Line.Trim())"
  }
  Fail "Stale stylesheet references remain."
}

Write-Host "[7/7] PASS: no stale old stylesheet references remain."

Write-Host ""
Write-Host "DONE" -ForegroundColor Green
Write-Host "===="
Write-Host ""
Write-Host "src/styles now contains only:"
Write-Host "      mirrortrace-bundle-1.css"
Write-Host "      mirrortrace-bundle-2.css"
Write-Host ""
Write-Host "Your previous source is backed up at:"
Write-Host "      .mirrortrace-before-two-css"
Write-Host ""
Write-Host "Now run:"
Write-Host "      Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run build"
Write-Host ""
Write-Host "Then:"
Write-Host "      npm run dev"
