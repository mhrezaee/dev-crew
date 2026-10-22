<#
.SYNOPSIS
  Install dev-crew agents, skills and commands into Claude Code.
.EXAMPLE
  ./install.ps1            # user-level   ($HOME\.claude)
  ./install.ps1 -Project   # project-level (.\.claude in the current directory)
#>
param([switch]$Project)

$ErrorActionPreference = 'Stop'
$src = $PSScriptRoot
$dest = if ($Project) { Join-Path (Get-Location) '.claude' } else { Join-Path $HOME '.claude' }

Write-Host "Installing dev-crew into $dest"
foreach ($dir in 'agents', 'skills', 'commands', 'templates/dev-crew') {
    New-Item -ItemType Directory -Force -Path (Join-Path $dest $dir) | Out-Null
}

Copy-Item (Join-Path $src 'agents/*.md') (Join-Path $dest 'agents') -Force
Copy-Item (Join-Path $src 'commands/*.md') (Join-Path $dest 'commands') -Force
Get-ChildItem (Join-Path $src 'skills') -Directory | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $dest 'skills') -Recurse -Force
}
Copy-Item (Join-Path $src 'templates/CLAUDE.md') (Join-Path $dest 'templates/dev-crew/CLAUDE.md') -Force

$agents = (Get-ChildItem (Join-Path $src 'agents') -Filter *.md).Count
$skills = (Get-ChildItem (Join-Path $src 'skills') -Directory).Count
$commands = (Get-ChildItem (Join-Path $src 'commands') -Filter *.md).Count
Write-Host "Done: $agents agents, $skills skills, $commands commands."
Write-Host 'Restart Claude Code, then try: /onboard'
