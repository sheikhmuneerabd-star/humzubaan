$base = "http://localhost:3000"

function Call($method, $path, $body, $token) {
  $headers = @{}
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  try {
    if ($body) {
      return Invoke-RestMethod -Method $method -Uri "$base$path" -ContentType "application/json" -Headers $headers -Body ($body | ConvertTo-Json)
    }
    return Invoke-RestMethod -Method $method -Uri "$base$path" -Headers $headers
  } catch {
    if ($_.ErrorDetails.Message) { return "ERROR: " + $_.ErrorDetails.Message }
    return "ERROR: " + $_.Exception.Message
  }
}

Write-Host "`n1) Register" -ForegroundColor Cyan
Call "Post" "/api/auth/register" @{ name = "Test User"; email = "test@example.com"; password = "Test12345" } $null

Write-Host "`n2) Login" -ForegroundColor Cyan
$login = Call "Post" "/api/auth/login" @{ email = "test@example.com"; password = "Test12345" } $null
$login

Write-Host "`n3) /me (token ke saath)" -ForegroundColor Cyan
Call "Get" "/api/users/me" $null $login.token

Write-Host "`n4) Galat password" -ForegroundColor Cyan
Call "Post" "/api/auth/login" @{ email = "test@example.com"; password = "Galat12345" } $null

Write-Host "`n5) Chhota password" -ForegroundColor Cyan
Call "Post" "/api/auth/register" @{ name = "A B"; email = "x@example.com"; password = "123" } $null

Write-Host "`n6) Bina token ke /me" -ForegroundColor Cyan
Call "Get" "/api/users/me" $null $null