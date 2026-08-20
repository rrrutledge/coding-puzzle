param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("interview", "restore", "status")]
    [string]$Mode
)

$ClaudeDir = "C:\Users\russe\.claude"
$RepoDir = "C:\Users\russe\dev\hubspot-interview-prep"

$Links = @{
    "CLAUDE.md" = @{
        personal  = "C:\Users\russe\OneDrive\Claude\.claude\CLAUDE.md"
        interview = "$RepoDir\interview-profile\CLAUDE.md"
    }
    "settings.json" = @{
        personal  = "C:\Users\russe\OneDrive\Claude\.claude\settings.json"
        interview = "$RepoDir\interview-profile\settings.json"
    }
}

if ($Mode -eq "status") {
    foreach ($name in $Links.Keys) {
        $link = Join-Path $ClaudeDir $name
        $item = Get-Item -Path $link -Force -ErrorAction SilentlyContinue
        if ($item -and $item.LinkType -eq "SymbolicLink") {
            Write-Host "$name -> $($item.Target)"
        } elseif ($item) {
            Write-Host "$name is a REAL FILE, not a symlink: $link"
        } else {
            Write-Host "$name does not exist at $link"
        }
    }
    exit 0
}

$targetKey = if ($Mode -eq "interview") { "interview" } else { "personal" }

foreach ($name in $Links.Keys) {
    $link = Join-Path $ClaudeDir $name
    $target = $Links[$name][$targetKey]

    if (-not (Test-Path $target)) {
        Write-Error "ABORT: target for $name does not exist: $target"
        exit 1
    }

    if (Test-Path $link) {
        Remove-Item -Path $link -Force
    }

    New-Item -ItemType SymbolicLink -Path $link -Target $target | Out-Null
    Write-Host "$name -> $target"
}

Write-Host "`nSwapped to: $Mode"
