$headers = @{
    "Content-Type" = "application/json"
}

$body = @{
    gridSize = @{
        width = 20
        height = 20
    }
    terrain = @(@(0) * 20) * 20
    units = @{
        teamA = @(
            @{
                type = "soldier"
                position = @{ x = 2; y = 5 }
                hp = 100
                maxHp = 100
                attack = 15
                defense = 5
                range = 1
                speed = 3
            }
        )
        teamB = @(
            @{
                type = "soldier"
                position = @{ x = 17; y = 5 }
                hp = 100
                maxHp = 100
                attack = 15
                defense = 5
                range = 1
                speed = 3
            }
        )
    }
    code = @{
        teamA = 'return { action: "move", target: { x: 15, y: 10 } };'
        teamB = 'return { action: "move", target: { x: 5, y: 10 } };'
    }
    maxTicks = 100
} | ConvertTo-Json -Depth 10

Write-Host "`n🧪 Testing WASM Engine via API`n"
Write-Host "Creating simulation..."

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/simulations" -Method Post -Headers $headers -Body $body

Write-Host "`n📊 Response:"
Write-Host "  Success: $($response.success)"
Write-Host "  Simulation ID: $($response.simulationId)"
Write-Host "  Engine: $($response.engine)"
Write-Host "`n✅ Check backend console for engine initialization message`n"
