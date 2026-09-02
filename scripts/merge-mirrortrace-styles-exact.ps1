param(
  [string]$ProjectRoot = "."
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# ============================================================
# MIRRORTRACE — EXACT TWO-FILE CSS MERGER
#
# PURPOSE
# -------
# Merge the CURRENT working UI stylesheet graph into exactly:
#
#   src/styles/mirrortrace-merged-1.css
#   src/styles/mirrortrace-merged-2.css
#
# while preserving the original CSS cascade order as closely as
# possible by walking the actual App.tsx module import graph.
#
# It does NOT rewrite component JSX/content/logic.
#
# It:
#   1. backs up affected files
#   2. discovers CSS imports in module-import order
#   3. expands local CSS @imports in-place
#   4. writes two contiguous CSS bundles
#   5. removes old CSS import lines from TS/TSX source files
#   6. imports only the two merged files from App.tsx
#   7. deletes now-unused src/styles/*.css
#   8. removes src/mirrortrace-motion.css if it was merged
#   9. validates no stale CSS references remain
#
# IMPORTANT
# ---------
# src/index.css is deliberately NOT merged or deleted.
# Tailwind/global base styling stays exactly where it is.
# ============================================================

function Fail([string]$Message) {
  throw "[MirrorTrace CSS Merge] $Message"
}

function Write-Utf8NoBom {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Content
  )

  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($Path, $Content, $utf8)
}

function Normalize-FullPath {
  param(
    [Parameter(Mandatory=$true)][string]$Path
  )

  return [System.IO.Path]::GetFullPath($Path)
}

function Resolve-RelativeModule {
  param(
    [Parameter(Mandatory=$true)][string]$Importer,
    [Parameter(Mandatory=$true)][string]$Specifier
  )

  if (-not $Specifier.StartsWith(".")) {
    return $null
  }

  $baseDir = Split-Path -Parent $Importer
  $candidate = Join-Path $baseDir $Specifier

  $extensions = @(
    "",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".css"
  )

  foreach ($ext in $extensions) {
    $path = $candidate + $ext
    if (Test-Path -LiteralPath $path -PathType Leaf) {
      return Normalize-FullPath $path
    }
  }

  # Handle directory imports like ./components/Foo -> ./components/Foo/index.tsx
  if (Test-Path -LiteralPath $candidate -PathType Container) {
    foreach ($indexName in @(
      "index.ts",
      "index.tsx",
      "index.js",
      "index.jsx",
      "index.css"
    )) {
      $indexPath = Join-Path $candidate $indexName
      if (Test-Path -LiteralPath $indexPath -PathType Leaf) {
        return Normalize-FullPath $indexPath
      }
    }
  }

  return $null
}

function Get-StaticImportsInOrder {
  param(
    [Parameter(Mandatory=$true)][string]$ModulePath
  )

  $content = [System.IO.File]::ReadAllText($ModulePath)

  # Supports:
  #   import './x.css';
  #   import X from './x.tsx';
  #   import { X } from './x.ts';
  #
  # Import blocks may span multiple lines.
  $pattern = '(?ms)^[ \t]*import\b(?:(?!;).)*?(?:from[ \t\r\n]+)?[''"]([^''"]+)[''"][ \t]*;'

  $matches = [regex]::Matches($content, $pattern)

  $results = New-Object System.Collections.Generic.List[string]

  foreach ($match in $matches) {
    $results.Add($match.Groups[1].Value)
  }

  return $results
}

function Expand-CssText {
  param(
    [Parameter(Mandatory=$true)][string]$CssPath,
    [Parameter(Mandatory=$true)][System.Collections.Generic.List[string]]$Stack
  )

  $full = Normalize-FullPath $CssPath

  if ($Stack.Contains($full)) {
    $cycle = ($Stack + $full) -join " -> "
    Fail "CSS @import cycle detected: $cycle"
  }

  $Stack.Add($full)

  $css = [System.IO.File]::ReadAllText($full)
  $dir = Split-Path -Parent $full

  # Expand local @imports at their exact position.
  # External URL imports are preserved untouched.
  $pattern = '(?m)^[ \t]*@import[ \t]+(?:url\()?[''"]([^''"]+)[''"]\)?[ \t]*;[ \t]*$'

  $expanded = [regex]::Replace(
    $css,
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

      $resolved = Join-Path $dir $spec

      if (-not (Test-Path -LiteralPath $resolved -PathType Leaf)) {
        Fail "CSS @import target not found: '$spec' imported by '$full'"
      }

      $childStack = New-Object System.Collections.Generic.List[string]
      foreach ($item in $Stack) {
        $childStack.Add($item)
      }

      $child = Expand-CssText -CssPath $resolved -Stack $childStack

      return @"

/* ===== BEGIN EXPANDED @import: $spec ===== */
$child
/* ===== END EXPANDED @import: $spec ===== */

"@
    }
  )

  [void]$Stack.RemoveAt($Stack.Count - 1)

  return $expanded
}

# ------------------------------------------------------------
# Resolve project paths
# ------------------------------------------------------------

$root = Normalize-FullPath $ProjectRoot
$src = Join-Path $root "src"
$appPath = Join-Path $src "App.tsx"
$mainPath = Join-Path $src "main.tsx"
$stylesDir = Join-Path $src "styles"
$indexCss = Join-Path $src "index.css"
$motionCss = Join-Path $src "mirrortrace-motion.css"

if (-not (Test-Path -LiteralPath $src -PathType Container)) {
  Fail "src folder not found: $src"
}

if (-not (Test-Path -LiteralPath $appPath -PathType Leaf)) {
  Fail "src/App.tsx not found."
}

if (-not (Test-Path -LiteralPath $mainPath -PathType Leaf)) {
  Fail "src/main.tsx not found."
}

if (-not (Test-Path -LiteralPath $stylesDir -PathType Container)) {
  New-Item -ItemType Directory -Path $stylesDir | Out-Null
}

Write-Host ""
Write-Host "MirrorTrace exact two-file CSS merge"
Write-Host "===================================="
Write-Host "Project: $root"
Write-Host ""

# ------------------------------------------------------------
# Safety check: keep index.css independent.
# ------------------------------------------------------------

if (Test-Path -LiteralPath $indexCss -PathType Leaf) {
  $indexText = [System.IO.File]::ReadAllText($indexCss)

  if (
    $indexText -match '@import[^;]*(?:styles[/\\]mirrortrace-|mirrortrace-motion\.css)'
  ) {
    Fail @"
src/index.css imports a MirrorTrace override stylesheet.
The script is stopping BEFORE making changes because moving that import
could change cascade order. Remove that import manually or send index.css
for inspection.
"@
  }
}

# ------------------------------------------------------------
# Walk the real App module graph in import order.
#
# JS/TS modules are de-duplicated like ESM modules.
# CSS modules imported from JS/TS are also de-duplicated.
# Local CSS @imports are expanded at each @import location.
# ------------------------------------------------------------

$visitedModules = New-Object 'System.Collections.Generic.HashSet[string]'
$visitedCssModules = New-Object 'System.Collections.Generic.HashSet[string]'
$cssSequence = New-Object System.Collections.Generic.List[object]

function Visit-Module {
  param(
    [Parameter(Mandatory=$true)][string]$ModulePath
  )

  $fullModule = Normalize-FullPath $ModulePath

  if ($visitedModules.Contains($fullModule)) {
    return
  }

  [void]$visitedModules.Add($fullModule)

  $imports = Get-StaticImportsInOrder -ModulePath $fullModule

  foreach ($specifier in $imports) {
    if (-not $specifier.StartsWith(".")) {
      continue
    }

    $resolved = Resolve-RelativeModule -Importer $fullModule -Specifier $specifier

    if ($null -eq $resolved) {
      # Let Vite handle unresolved non-CSS imports later.
      # But unresolved relative CSS is dangerous and must fail.
      if ($specifier.ToLowerInvariant().EndsWith(".css")) {
        Fail "Could not resolve CSS import '$specifier' from '$fullModule'."
      }

      continue
    }

    $ext = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()

    if ($ext -eq ".css") {
      # index.css is intentionally left alone in main.tsx.
      if ($resolved -eq (Normalize-FullPath $indexCss)) {
        continue
      }

      if (-not $visitedCssModules.Contains($resolved)) {
        [void]$visitedCssModules.Add($resolved)

        $stack = New-Object System.Collections.Generic.List[string]
        $expanded = Expand-CssText -CssPath $resolved -Stack $stack

        $cssSequence.Add(
          [PSCustomObject]@{
            Path = $resolved
            Source = $specifier
            ImportedBy = $fullModule
            Css = $expanded
          }
        )
      }

      continue
    }

    if ($ext -in @(".ts", ".tsx", ".js", ".jsx")) {
      Visit-Module -ModulePath $resolved
    }
  }
}

Visit-Module -ModulePath $appPath

if ($cssSequence.Count -eq 0) {
  Fail "No CSS imports were discovered from the App.tsx module graph."
}

Write-Host "Discovered CSS modules in original dependency order:"
for ($i = 0; $i -lt $cssSequence.Count; $i++) {
  $rel = [System.IO.Path]::GetRelativePath(
    $root,
    $cssSequence[$i].Path
  )
  Write-Host ("  {0,2}. {1}" -f ($i + 1), $rel)
}

# ------------------------------------------------------------
# Build one exact ordered stream, then split ONLY at a stylesheet
# boundary. Importing file 1 then file 2 preserves the same order.
# ------------------------------------------------------------

$chunks = New-Object System.Collections.Generic.List[string]

foreach ($item in $cssSequence) {
  $rel = [System.IO.Path]::GetRelativePath($root, $item.Path)

  $chunk = @"

/* ============================================================
   BEGIN ORIGINAL STYLESHEET: $rel
   Originally imported by:
   $([System.IO.Path]::GetRelativePath($root, $item.ImportedBy))
   ============================================================ */

$($item.Css)

/* ============================================================
   END ORIGINAL STYLESHEET: $rel
   ============================================================ */

"@

  $chunks.Add($chunk)
}

$totalChars = 0
foreach ($chunk in $chunks) {
  $totalChars += $chunk.Length
}

$half = [Math]::Floor($totalChars / 2)
$running = 0
$splitIndex = 1

for ($i = 0; $i -lt $chunks.Count; $i++) {
  $running += $chunks[$i].Length

  if ($running -ge $half) {
    $splitIndex = $i + 1
    break
  }
}

# Never produce an empty file.
if ($splitIndex -ge $chunks.Count) {
  $splitIndex = [Math]::Max(1, $chunks.Count - 1)
}

$bundle1 = ""
$bundle2 = ""

for ($i = 0; $i -lt $chunks.Count; $i++) {
  if ($i -lt $splitIndex) {
    $bundle1 += $chunks[$i]
  }
  else {
    $bundle2 += $chunks[$i]
  }
}

if ([string]::IsNullOrWhiteSpace($bundle1)) {
  Fail "Generated mirrortrace-merged-1.css is empty."
}

if ([string]::IsNullOrWhiteSpace($bundle2)) {
  Fail "Generated mirrortrace-merged-2.css is empty."
}

$header1 = @"
/* ============================================================
   MIRRORTRACE MERGED STYLES — PART 1 OF 2
   AUTO-GENERATED FROM THE CURRENT WORKING IMPORT GRAPH.

   DO NOT REORDER THIS FILE RELATIVE TO PART 2.
   App.tsx must import part 1 first, then part 2.
   ============================================================ */

"@

$header2 = @"
/* ============================================================
   MIRRORTRACE MERGED STYLES — PART 2 OF 2
   AUTO-GENERATED FROM THE CURRENT WORKING IMPORT GRAPH.

   DO NOT REORDER THIS FILE RELATIVE TO PART 1.
   ============================================================ */

"@

$bundle1 = $header1 + $bundle1
$bundle2 = $header2 + $bundle2

# ------------------------------------------------------------
# Create a backup BEFORE touching source files.
# ------------------------------------------------------------

$backupRoot = Join-Path $root ".mirrortrace-css-merge-backup"

if (Test-Path -LiteralPath $backupRoot) {
  Remove-Item -LiteralPath $backupRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $backupRoot | Out-Null

Copy-Item -LiteralPath $src -Destination (Join-Path $backupRoot "src") -Recurse -Force

Write-Host ""
Write-Host "Backup created:"
Write-Host "  $backupRoot"
Write-Host ""

# ------------------------------------------------------------
# Write merged files FIRST.
# ------------------------------------------------------------

$merged1 = Join-Path $stylesDir "mirrortrace-merged-1.css"
$merged2 = Join-Path $stylesDir "mirrortrace-merged-2.css"

Write-Utf8NoBom -Path $merged1 -Content $bundle1
Write-Utf8NoBom -Path $merged2 -Content $bundle2

if ((Get-Item -LiteralPath $merged1).Length -lt 100) {
  Fail "mirrortrace-merged-1.css failed size validation."
}

if ((Get-Item -LiteralPath $merged2).Length -lt 100) {
  Fail "mirrortrace-merged-2.css failed size validation."
}

Write-Host "Created:"
Write-Host "  src/styles/mirrortrace-merged-1.css"
Write-Host "  src/styles/mirrortrace-merged-2.css"

# ------------------------------------------------------------
# Remove CSS import statements from all TS/TSX/JS/JSX under src,
# EXCEPT main.tsx -> ./index.css.
#
# No JSX/logic is touched.
# ------------------------------------------------------------

$sourceFiles = Get-ChildItem -LiteralPath $src -Recurse -File |
  Where-Object {
    $_.Extension.ToLowerInvariant() -in @(".ts", ".tsx", ".js", ".jsx")
  }

$cssImportPattern = '(?ms)^[ \t]*import\b(?:(?!;).)*?[''"]([^''"]+\.css)[''"][ \t]*;[ \t]*\r?\n?'

foreach ($file in $sourceFiles) {
  $text = [System.IO.File]::ReadAllText($file.FullName)

  $updated = [regex]::Replace(
    $text,
    $cssImportPattern,
    {
      param($m)

      $specifier = $m.Groups[1].Value

      # main.tsx must keep index.css exactly where it is.
      if (
        $file.FullName -eq (Normalize-FullPath $mainPath) -and
        $specifier -eq "./index.css"
      ) {
        return $m.Value
      }

      return ""
    }
  )

  if ($updated -ne $text) {
    Write-Utf8NoBom -Path $file.FullName -Content $updated
  }
}

# ------------------------------------------------------------
# Add exactly two imports to App.tsx.
# They are placed at the top so their internal sequence is fixed.
# index.css remains imported by main.tsx after App, as before.
# ------------------------------------------------------------

$appText = [System.IO.File]::ReadAllText($appPath)

$mergedImports = @"
import './styles/mirrortrace-merged-1.css';
import './styles/mirrortrace-merged-2.css';

"@

$appText = $mergedImports + $appText
Write-Utf8NoBom -Path $appPath -Content $appText

# ------------------------------------------------------------
# Delete obsolete CSS files only AFTER merged files exist.
#
# - Delete every old CSS file under src/styles.
# - Keep the two merged files.
# - Delete src/mirrortrace-motion.css only if it was part of the
#   discovered CSS graph.
# - Keep src/index.css untouched.
# ------------------------------------------------------------

Get-ChildItem -LiteralPath $stylesDir -File -Filter "*.css" |
  Where-Object {
    $_.FullName -ne (Normalize-FullPath $merged1) -and
    $_.FullName -ne (Normalize-FullPath $merged2)
  } |
  Remove-Item -Force

$motionFull = Normalize-FullPath $motionCss

if (
  (Test-Path -LiteralPath $motionCss -PathType Leaf) -and
  $visitedCssModules.Contains($motionFull)
) {
  Remove-Item -LiteralPath $motionCss -Force
}

# ------------------------------------------------------------
# Validation
# ------------------------------------------------------------

$finalStyleFiles = Get-ChildItem -LiteralPath $stylesDir -File -Filter "*.css"

if ($finalStyleFiles.Count -ne 2) {
  Fail "Expected exactly 2 CSS files in src/styles, found $($finalStyleFiles.Count)."
}

$remainingCssImports = Get-ChildItem -LiteralPath $src -Recurse -File |
  Where-Object {
    $_.Extension.ToLowerInvariant() -in @(".ts", ".tsx", ".js", ".jsx")
  } |
  Select-String -Pattern "import\s+['""][^'""]+\.css['""]"

$unexpectedImports = @()

foreach ($match in $remainingCssImports) {
  $line = $match.Line.Trim()

  $allowed =
    (
      $match.Path -eq (Normalize-FullPath $mainPath) -and
      $line -match "['""]\./index\.css['""]"
    ) -or
    (
      $match.Path -eq (Normalize-FullPath $appPath) -and
      (
        $line -match "mirrortrace-merged-1\.css" -or
        $line -match "mirrortrace-merged-2\.css"
      )
    )

  if (-not $allowed) {
    $unexpectedImports += "$($match.Path):$($match.LineNumber): $line"
  }
}

if ($unexpectedImports.Count -gt 0) {
  Write-Host ""
  Write-Host "Unexpected CSS imports remain:" -ForegroundColor Yellow
  $unexpectedImports | ForEach-Object { Write-Host "  $_" }
  Fail "Validation failed because unexpected CSS imports remain."
}

$staleReferences = Get-ChildItem -LiteralPath $src -Recurse -File |
  Where-Object {
    $_.Extension.ToLowerInvariant() -in @(".ts", ".tsx", ".js", ".jsx", ".css")
  } |
  Select-String -Pattern "mirrortrace-(?!merged-1|merged-2)[A-Za-z0-9_-]+\.css"

if ($staleReferences) {
  Write-Host ""
  Write-Host "Stale stylesheet references remain:" -ForegroundColor Yellow
  $staleReferences |
    ForEach-Object {
      Write-Host "  $($_.Path):$($_.LineNumber): $($_.Line.Trim())"
    }

  Fail "Validation failed because stale MirrorTrace CSS references remain."
}

Write-Host ""
Write-Host "SUCCESS" -ForegroundColor Green
Write-Host "======="
Write-Host ""
Write-Host "Final style files:"
Write-Host "  src/styles/mirrortrace-merged-1.css"
Write-Host "  src/styles/mirrortrace-merged-2.css"
Write-Host ""
Write-Host "App.tsx imports:"
Write-Host "  import './styles/mirrortrace-merged-1.css';"
Write-Host "  import './styles/mirrortrace-merged-2.css';"
Write-Host ""
Write-Host "main.tsx still keeps:"
Write-Host "  import './index.css';"
Write-Host ""
Write-Host "Backup:"
Write-Host "  .mirrortrace-css-merge-backup"
Write-Host ""
Write-Host "Next run:"
Write-Host "  Remove-Item -Recurse -Force .\node_modules\.vite -ErrorAction SilentlyContinue; npm run build"
Write-Host ""
Write-Host "If build passes:"
Write-Host "  npm run dev"
