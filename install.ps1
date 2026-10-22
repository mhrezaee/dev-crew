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
foreach ($dir in 'agents', 'skills', 'templates/dev-crew') {
    New-Item -ItemType Directory -Force -Path (Join-Path $dest $dir) | Out-Null
}

Copy-Item (Join-Path $src 'agents/*.md') (Join-Path $dest 'agents') -Force
Get-ChildItem (Join-Path $src 'skills') -Directory | ForEach-Object {
    Copy-Item $_.FullName (Join-Path $dest 'skills') -Recurse -Force
}
Copy-Item (Join-Path $src 'templates/CLAUDE.md') (Join-Path $dest 'templates/dev-crew/CLAUDE.md') -Force

$agents = (Get-ChildItem (Join-Path $src 'agents') -Filter *.md).Count
$skills = (Get-ChildItem (Join-Path $src 'skills') -Directory).Count
Write-Host "Done: $agents agents and $skills skills (including workflow commands)."
Write-Host 'Note: guardrail hooks are only active when installed as a plugin (/plugin install dev-crew@dev-crew).'
Write-Host 'Restart Claude Code, then try: /onboard'
