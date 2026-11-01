$line = Get-Content apps\web\.env.local | Where-Object { $_ -like "GROQ_API_KEY=*" }
$key = $line -replace "GROQ_API_KEY=", ""
$models = (Invoke-RestMethod -Uri "https://api.groq.com/openai/v1/models" -Headers @{ Authorization = "Bearer $key" }).data
$models | Select-Object id | Format-Table -AutoSize