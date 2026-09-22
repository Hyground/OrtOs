$ErrorActionPreference = 'Stop'

function Read-Required([string]$prompt) {
    do {
        $value = Read-Host $prompt
    } while ([string]::IsNullOrWhiteSpace($value))
    return $value.Trim()
}

function Read-Password {
    $secure = Read-Host 'Contraseña de PostgreSQL cloud' -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }

    if ([string]::IsNullOrWhiteSpace($password) -or $password.Contains("`r") -or $password.Contains("`n")) {
        throw 'La contraseña no puede estar vacía ni contener saltos de línea.'
    }
    return $password
}

$root = Split-Path -Parent $PSScriptRoot
$dbHost = Read-Required 'Host PostgreSQL cloud (sin https:// ni puerto)'
$dbPort = Read-Host 'Puerto PostgreSQL [5432]'
if ([string]::IsNullOrWhiteSpace($dbPort)) { $dbPort = '5432' }
if ($dbPort -notmatch '^\d{1,5}$') { throw 'El puerto debe ser numérico.' }
$database = Read-Required 'Nombre de la base de datos OrtOs'
$username = Read-Required 'Usuario PostgreSQL cloud'
$password = Read-Password

$jwtBytes = [byte[]]::new(48)
$randomGenerator = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
try {
    $randomGenerator.GetBytes($jwtBytes)
} finally {
    $randomGenerator.Dispose()
}
$jwtSecret = [Convert]::ToBase64String($jwtBytes)
$datasourceUrl = "jdbc:postgresql://${dbHost}:$dbPort/$database?sslmode=require"
$utf8NoBom = [Text.UTF8Encoding]::new($false)

$apiEnvironment = @(
    'SPRING_PROFILES_ACTIVE=dev',
    "SPRING_DATASOURCE_URL=$datasourceUrl",
    "SPRING_DATASOURCE_USERNAME=$username",
    "SPRING_DATASOURCE_PASSWORD=$password",
    "ORTOS_JWT_SECRET=$jwtSecret",
    'ORTOS_CORS_ALLOWED_ORIGINS=http://localhost:5173',
    'ORTOS_SEED_ENABLED=false'
)

$dockerEnvironment = @(
    "SPRING_DATASOURCE_URL=$datasourceUrl",
    "SPRING_DATASOURCE_USERNAME=$username",
    "SPRING_DATASOURCE_PASSWORD=$password",
    "ORTOS_JWT_SECRET=$jwtSecret",
    'ORTOS_CORS_ALLOWED_ORIGINS=http://localhost:3000'
)

[IO.File]::WriteAllLines((Join-Path $root 'API\.env'), [string[]]$apiEnvironment, $utf8NoBom)
[IO.File]::WriteAllLines((Join-Path $root 'Docker\.env'), [string[]]$dockerEnvironment, $utf8NoBom)

Write-Host 'Configuración creada. Guarda los .env fuera de Git y no compartas su contenido.'
