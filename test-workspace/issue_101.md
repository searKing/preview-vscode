~~~pwsh
#!/usr/bin/env -S pwsh
#Requires -PSEdition 'Core'
#Requires -Version 7.5

Install-Module -Name 'Microsoft.WinGet.Client'  # `-RequiredVersion 1.9.25190`
Get-WinGetPackage 'Microsoft.MediaCreationTool' # `-Version "$Unknown"`

If ($IsWindows) { Start-Process "$Env:SystemDrive\Users\$([Environment]::UserName)\AppData\Local\Microsoft\WinGet\Packages\Microsoft.MediaCreationTool_Microsoft.Winget.Source_8wekyb3d8bbwe" }
~~~