param(
    [long]$UserId = 1
)

$workspace = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$source = Join-Path $workspace "workspace_artifacts"
$target = Join-Path $source "users\$UserId"

if (-not (Test-Path -LiteralPath $source)) {
    Write-Host "workspace_artifacts does not exist: $source"
    exit 0
}

New-Item -ItemType Directory -Force -Path $target | Out-Null

$legacyDirs = @("prd", "review", "deploy", "reports", "docs")
foreach ($dir in $legacyDirs) {
    $legacyPath = Join-Path $source $dir
    if (Test-Path -LiteralPath $legacyPath) {
        Copy-Item -LiteralPath $legacyPath -Destination $target -Recurse -Force
    }
}

$legacyCode = Join-Path $source "code"
$targetCode = Join-Path $target "code"
if ((Test-Path -LiteralPath $legacyCode) -and -not (Test-Path -LiteralPath $targetCode)) {
    Copy-Item -LiteralPath $legacyCode -Destination $target -Recurse -Force
}

Write-Host "Migrated legacy work product files to $target"
