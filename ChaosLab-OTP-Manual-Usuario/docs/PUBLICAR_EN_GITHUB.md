# Publicar el manual como repositorio propio

Este paquete es una carpeta GitHub-ready. No se publica automáticamente en tu cuenta.

1. Descomprimir el ZIP en Windows.
2. Entrar a [GitHub — New repository](https://github.com/new) con tu sesión iniciada.
3. Elegir nombre, por ejemplo `chaoslab-otp-manual-usuario`, y crear **repositorio vacío**, sin generar otro README ni `.gitignore`.
4. Abrir PowerShell dentro de la carpeta `ChaosLab-OTP-Manual-Usuario` y ejecutar:

```powershell
git init -b main
git add .
git commit -m "Agregar manual de usuario ChaosLab OTP"
git remote add origin https://github.com/TU_USUARIO/chaoslab-otp-manual-usuario.git
git push -u origin main
```

Sustituir `TU_USUARIO` por tu nombre de usuario de GitHub. El gestor de credenciales puede pedirte iniciar sesión.

**Importante:** no subas `labsuser.pem`, contraseñas, IP privadas sensibles, secretos o archivos de configuración con credenciales.

Si después incorporas el código final del proyecto, documenta su procedencia y asegúrate de tener permiso para publicarlo.
