@echo off
setlocal enabledelayedexpansion

:: Carpeta base del proyecto
set "BASE=web-client"

:: Ruta de la carpeta de modelos DTO para preservar archivos
set "MODELO_DTO=%BASE%\modelo"

:: Si ya existe la carpeta web-client
if exist %BASE% (
    echo Se detecta la carpeta existente "%BASE%", limpiando excepto DTOs...

    :: Crear temporal si hay DTOs
    if exist %MODELO_DTO% (
        mkdir tempDTO
        copy %MODELO_DTO%\*DTO.js tempDTO\ >nul 2>&1
    )

    rmdir /s /q %BASE%
)

:: Crear estructura de carpetas
mkdir %BASE%
mkdir %BASE%\modelo
mkdir %BASE%\servicios
mkdir %BASE%\controlador
mkdir %BASE%\vista

:: Restaurar DTOs si existen
if exist tempDTO (
    copy tempDTO\* %BASE%\modelo\ >nul
    rmdir /s /q tempDTO
    echo DTOs restaurados.
)

:: Crear archivos 
echo. > %BASE%\vista\login.html
echo. > %BASE%\vista\signup.html
echo. > %BASE%\vista\facility.html
echo. > %BASE%\vista\booking.html
echo. > %BASE%\vista\paypal.html

echo. > %BASE%\servicios\UserService.js
echo. > %BASE%\servicios\FacilityService.js
echo. > %BASE%\servicios\BookingService.js
echo. > %BASE%\servicios\NotificationService.js

echo. > %BASE%\controlador\ApiService.js
echo. > %BASE%\controlador\RequestQueueManager.js
echo. > %BASE%\controlador\QRCodeScanner.js

echo Nueva estructura MVC generada correctamente en "%BASE%"
pause
