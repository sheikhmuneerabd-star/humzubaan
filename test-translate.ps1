[Console]::OutputEncoding = [Text.Encoding]::UTF8
$base = "http://localhost:3000"

function Call($method, $path, $body, $token) {
  $headers = @{}
  if ($token) { $headers["Authorization"] = "Bearer $token" }
  try {
    if ($body) {
      $bytes = [Text.Encoding]::UTF8.GetBytes(($body | ConvertTo-Json))
      return Invoke-RestMethod -Method $method -Uri "$base$path" -ContentType "application/json; charset=utf-8" -Headers $headers -Body $bytes
    }
    return Invoke-RestMethod -Method $method -Uri "$base$path" -Headers $headers
  } catch {
    $msg = $_.Exception.Message
    if ($_.Exception.Response) {
      try {
        $sr = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
        $msg = $sr.ReadToEnd()
      } catch {}
    }
    return "ERROR: $msg"
  }
}

$login = Call "Post" "/api/auth/login" @{ email = "test@example.com"; password = "Test12345" } $null
$t = $login.token
if (-not $t) { Write-Host "Login fail: $login" -ForegroundColor Red; exit }

Write-Host "`n1) Incoming: English -> Roman Urdu" -ForegroundColor Cyan
$r1 = Call "Post" "/api/translate" @{ mode = "incoming"; script = "roman"; text = "Hi! I need a landing page for my bakery. Can you finish it by Friday? My budget is `$50. Please share a few samples first." } $t
$r1 | Format-List

Write-Host "`n2) Outgoing: Roman Urdu -> English" -ForegroundColor Cyan
$r2 = Call "Post" "/api/translate" @{ mode = "outgoing"; script = "roman"; tone = "professional"; text = "Ji bilkul main Friday tak website complete kr dunga. Pehly main aap ko 2 samples bhej dunga." } $t
$r2 | Format-List

Write-Host "`n3) Usage" -ForegroundColor Cyan
Call "Get" "/api/usage/me" $null $t | Format-List

Write-Host "`n4) Khali text" -ForegroundColor Cyan
Call "Post" "/api/translate" @{ mode = "incoming"; text = "   " } $t

Write-Host "`n5) Bina login" -ForegroundColor Cyan
Call "Post" "/api/translate" @{ mode = "incoming"; text = "Hello" } $null