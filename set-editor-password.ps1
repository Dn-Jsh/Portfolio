# Run locally in an interactive PowerShell terminal. Never paste the project
# secret key or the new password into chat or save them in this file.
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectUrl = 'https://rvhxnagrfzwxwezpymbf.supabase.co'
$userId = 'c3c07b8c-66a8-425e-8380-3a2801fe50af'
$expectedEmail = 'danjeshuaf@gmail.com'
$userUrl = "$projectUrl/auth/v1/admin/users/$userId"

function Read-SecretText([string]$Prompt) {
  $secureValue = Read-Host $Prompt -AsSecureString
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    $secureValue.Dispose()
  }
}

$secretKey = $null
$newPassword = $null
$confirmation = $null
$requestBody = $null
$headers = $null

try {
  $secretKey = Read-SecretText 'Portfolio project legacy service_role key'
  $newPassword = Read-SecretText 'New editor password (12+ characters)'
  $confirmation = Read-SecretText 'Confirm new editor password'

  if ([string]::IsNullOrWhiteSpace($secretKey)) {
    throw 'A service_role key is required.'
  }
  if ($newPassword.Length -lt 12) {
    throw 'The new password must have at least 12 characters.'
  }
  if ($newPassword -cne $confirmation) {
    throw 'The passwords do not match.'
  }

  $headers = @{ apikey = $secretKey; Authorization = "Bearer $secretKey" }
  $user = Invoke-RestMethod -Method Get -Uri $userUrl -Headers $headers
  if ($user.id -ne $userId -or $user.email -ne $expectedEmail) {
    throw 'The Supabase account did not match the expected portfolio editor.'
  }

  $requestBody = @{ password = $newPassword } | ConvertTo-Json -Compress
  $updatedUser = Invoke-RestMethod -Method Put -Uri $userUrl -Headers $headers -ContentType 'application/json' -Body $requestBody
  if ($updatedUser.id -ne $userId) {
    throw 'Supabase did not confirm the password update.'
  }

  Write-Host 'Password set. Sign in at https://portfolio-nine-jet-22.vercel.app/editportfolio/login'
} finally {
  $requestBody = $null
  $confirmation = $null
  $newPassword = $null
  $secretKey = $null
  $headers = $null
}
