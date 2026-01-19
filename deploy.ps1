# PowerShell Deployment Script for Jekyll

param (
    [string]$commitMessage = "Auto-deploy"
)

# Clear the console
Clear-Host

# Ensure the script runs from the directory where it is located (project root)
Set-Location -Path $PSScriptRoot

if (-not (Test-Path "Gemfile")) {
    throw "Gemfile not found in '$PSScriptRoot'. Please ensure this script is located in the Jekyll project root."
}

# IMPORTANT: Define the target directory for deployment.
# This is the local path to your GitHub Pages repository (e.g., your-username.github.io).
# PLEASE UPDATE THIS PATH to your actual repository location.
$targetDir = "D:\Github\qingleiji.github.io"

# Ensure the script exits on any error
$ErrorActionPreference = "Stop"

# Run Jekyll build using bundle exec
Write-Host "Building Jekyll site..."
cmd /c "bundle exec jekyll build --verbose > build.log 2>&1"
if ($LASTEXITCODE -ne 0) {
    Get-Content "build.log" | Write-Host
    throw "Jekyll build failed. Check build.log for details."
}

# Integrate external '2026' project as a subpage
$pythonProjectSource = "C:\Users\Qingl\OneDrive\Projects\Python\2026"
$pythonProjectDest = "_site\2026"

if (Test-Path -Path $pythonProjectSource) {
    Write-Host "Copying external '2026' project to _site/2026..."
    if (-not (Test-Path -Path $pythonProjectDest)) {
        New-Item -ItemType Directory -Force -Path $pythonProjectDest | Out-Null
    }
    Copy-Item -Path "$pythonProjectSource\*" -Destination $pythonProjectDest -Recurse -Force
}

# Check if the target directory exists, if not, create it
if (-not (Test-Path -Path $targetDir -PathType Container)) {
    Write-Host "Target directory does not exist. Creating it..."
    New-Item -ItemType Directory -Force -Path $targetDir
}

# Copy the contents of the _site folder to the target directory
Write-Host "Copying files to target directory..."
Copy-Item -Path "_site\*" -Destination $targetDir -Recurse -Force

Write-Host "Deployment complete!"

# Change directory to the target repository
Set-Location -Path $targetDir

Write-Host "Now in $(Get-Location)"
git status

# Ask the user if they want to commit and push
$answer = Read-Host "Do you want to commit and push changes? (yes/y/no/n)"
$answer = $answer.ToLower()

if ($answer -eq "yes" -or $answer -eq "y") {
    $inputMessage = Read-Host "Enter commit message (Press Enter to use '$commitMessage')"
    if (-not [string]::IsNullOrWhiteSpace($inputMessage)) {
        $commitMessage = $inputMessage
    }

    # Stage all changes
    git add .

    # Commit the changes with the provided message
    git commit -m "$commitMessage"

    # Push the changes
    git push

    Write-Host "Changes have been committed and pushed successfully."
}
elseif ($answer -eq "no" -or $answer -eq "n") {
    Write-Host "No changes committed or pushed. Exiting."
}
else {
    Write-Host "Invalid input. Please enter yes/y or no/n."
    exit 1
}
