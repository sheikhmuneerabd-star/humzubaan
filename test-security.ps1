$base = "http://localhost:3000"
$body = '{"email":"nobody@example.com","password":"WrongPass123"}'

1..12 | ForEach-Object {
  try {
    Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType "application/json" -Body $body | Out-Null
    "$_ : OK (hona nahi chahiye tha)"
  } catch {
    $code = [int]$_.Exception.Response.StatusCode
    "$_ : $code"
  }
}