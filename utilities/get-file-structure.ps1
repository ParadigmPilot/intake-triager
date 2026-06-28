<#
.GOVERNANCE
# ============================================================================
# IDENTITY
# ============================================================================
name: get-file-structure
path: products/intake-triager/utilities/get-file-structure.ps1
project: Hopper

# ============================================================================
# CLASSIFICATION
# ============================================================================
doctype: Query-Script
artifact: script
structural_role: singleton
level: Operational
scope: local
layer: M0

# ============================================================================
# VERSIONING
# ============================================================================
version: "1.2.0"
created_by: SamRHarkreader
created_with: Claude Opus 4.6
created_at: 2026-03-23T10:00:00-06:00
updated_by: SamRHarkreader
updated_with: Claude Opus 4.8
updated_at: 2026-06-15T09:30:00-06:00

# ============================================================================
# PURPOSE
# ============================================================================
purpose: Generates a flat, sorted list of all file and directory paths under the intake-triager product root, relative to that root. Designed for AI consumption - no tree characters, no icons, one path per line. Skips build artifacts and junk (node_modules, dist, .git, coverage, etc.) so the output is signal-only. Use on-demand when AI needs file-level visibility into intake-triager.

# ============================================================================
# RELATIONSHIPS
# ============================================================================
# Companion to get-folder-structure.ps1 (directories only)
# Use this when file-level detail is needed; use get-folder-structure.ps1 for session start

# ============================================================================
# CHANGELOG
# ============================================================================
# 1.2.0 (2026-06-15)
#   - Refocused on intake-triager only. Removed the multi-product machinery
#     (-ExcludeProducts switch and the \products\ exclusion regex) - meaningless
#     when the root IS a single product.
#   - Removed -ExcludeBackups switch; .bak files are now eliminated by default
#     via the new -ExcludeFiles pattern list (with *.log, .DS_Store, Thumbs.db).
#   - Expanded default folder exclusions to cover Vite/Vitest/Storybook noise.
#   - Walk the tree once and reuse for both output and the count report.

# ============================================================================
# GOVERNANCE
# ============================================================================
governance_spec_version: "1.0"
classification_status: pending
#>

# Flat File Structure Generator (AI-Optimized) - intake-triager
# Produces one relative path per line for every useful file and directory under
# the intake-triager root - no tree, no icons, no build/junk noise.
# Author: Sam R. Harkreader / Paradigm Pilot, Inc.

# USAGE:
#   .\products\intake-triager\utilities\get-file-structure.ps1 -OpenAfterCreate
#   .\products\intake-triager\utilities\get-file-structure.ps1 -OutputMarkdown 'my-structure.md'
#   .\products\intake-triager\utilities\get-file-structure.ps1 -ExcludeFolders 'node_modules','dist','.git' -ExcludeFiles '*.bak','*.log'
#   Powershell -ExecutionPolicy Bypass -File C:\DevTools\hopper\products\intake-triager\utilities\get-file-structure.ps1 -OutputMarkdown 'triager-structure-flat.md'

[CmdletBinding()]
param(
    [Parameter(Position = 0, HelpMessage = "Path to the intake-triager root directory")]
    [ValidateScript({
            if (Test-Path $_ -PathType Container) { $true }
            else { throw "Path '$_' does not exist or is not a directory" }
        })]
    [string]$Path = "C:\DevTools\hopper\products\intake-triager",

    [Parameter(HelpMessage = "Folder names to exclude (skipped entirely - never recursed into)")]
    [ValidateNotNull()]
    [string[]]$ExcludeFolders = @(
        'node_modules', 'dist', 'build', '.git',
        '.vite', 'coverage', 'storybook-static', '.turbo', '.cache'
    ),

    [Parameter(HelpMessage = "File name patterns to exclude (supports wildcards, e.g. '*.bak')")]
    [ValidateNotNull()]
    [string[]]$ExcludeFiles = @('*.bak', '*.log', '.DS_Store', 'Thumbs.db'),

    [Parameter(HelpMessage = "Output file path (.md default)")]
    [string]$OutputMarkdown = "triager-structure-flat.md",

    [Parameter(HelpMessage = "Open the file after creation")]
    [switch]$OpenAfterCreate = $false
)

# Normalize root path for consistent replacement
$normalizedRoot = (Resolve-Path $Path).Path.TrimEnd('\')

# Build folder-exclusion set (handles both array and comma-delimited string input)
$excludeFolderSet = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($folder in $ExcludeFolders) {
    # Handle case where -File mode passes 'a','b','c' as a single comma-delimited string
    foreach ($name in ($folder -split ',')) {
        $trimmed = $name.Trim().Trim("'`"")
        if ($trimmed) { [void]$excludeFolderSet.Add($trimmed) }
    }
}

# Build file-pattern list (same comma-delimited safety as above)
$excludeFilePatterns = [System.Collections.Generic.List[string]]::new()
foreach ($pattern in $ExcludeFiles) {
    foreach ($name in ($pattern -split ',')) {
        $trimmed = $name.Trim().Trim("'`"")
        if ($trimmed) { $excludeFilePatterns.Add($trimmed) }
    }
}

# Recursive walker - skips excluded directories entirely (never enters them)
# and drops files matching any exclusion pattern.
function Get-FilteredItems {
    param(
        [string]$Dir,
        [System.Collections.Generic.HashSet[string]]$SkipFolders,
        [string[]]$SkipFilePatterns
    )
    foreach ($item in Get-ChildItem -Path $Dir -Force -ErrorAction SilentlyContinue) {
        if ($item.PSIsContainer) {
            # Skip excluded folder trees at the directory level - don't recurse into them
            if ($SkipFolders.Contains($item.Name)) { continue }

            # Emit the directory, then recurse
            $item
            Get-FilteredItems -Dir $item.FullName -SkipFolders $SkipFolders -SkipFilePatterns $SkipFilePatterns
        }
        else {
            # Skip junk / non-useful files by name pattern
            $skip = $false
            foreach ($pat in $SkipFilePatterns) {
                if ($item.Name -like $pat) { $skip = $true; break }
            }
            if ($skip) { continue }

            # Emit this file
            $item
        }
    }
}

# Walk the tree ONCE - reuse for both output and the count report
$walkedItems = @(Get-FilteredItems -Dir $normalizedRoot `
        -SkipFolders $excludeFolderSet -SkipFilePatterns $excludeFilePatterns)

# Format relative paths, sort, and write output
$walkedItems |
ForEach-Object { $_.FullName.Replace("$normalizedRoot\", '') -replace '\\', '/' } |
Sort-Object |
Set-Content -Path $OutputMarkdown -Encoding UTF8

# Report - count files vs directories
$fileCount = ($walkedItems | Where-Object { -not $_.PSIsContainer }).Count
$dirCount = ($walkedItems | Where-Object { $_.PSIsContainer }).Count
$totalCount = $fileCount + $dirCount
Write-Host "get-file-structure: $totalCount paths ($fileCount files, $dirCount dirs) written to $OutputMarkdown" -ForegroundColor Green

if ($OpenAfterCreate) {
    Start-Process $OutputMarkdown
}
