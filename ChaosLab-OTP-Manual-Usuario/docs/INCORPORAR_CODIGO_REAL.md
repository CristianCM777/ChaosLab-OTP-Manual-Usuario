# Cómo añadir los archivos HTML y JS reales del proyecto original

**Los ejemplos incluidos en este repositorio NO equivalen al código final del frontend de ChaosLab OTP.** Para reemplazarlos por el código original es necesario obtenerlo del entorno Ubuntu donde funciona el proyecto.

Desde PowerShell en Windows (en el directorio donde guardas `labsuser.pem`, con la instancia iniciada), ejecuta, sustituyendo la dirección por la IPv4 pública actual:

```powershell
scp -i ".\labsuser.pem" -r ubuntu@IP_PUBLICA_ACTUAL:/home/ubuntu/erlang-proyectos/proyectos/21-pruebas-de-caos/frontend .\frontend-real
```

Así tendrás las carpetas `pages/` y `js/` de la versión que está ejecutando Cowboy. **Antes de subirlos a GitHub**, revisa que no contengan claves privadas ni información sensible, y que puedes redistribuir el material del diseño de Stitch.

Si deseas incluir código Erlang real, puedes copiar de forma parecida `src/`, `test/` y `rebar.config`, preferiblemente a un repositorio de implementación separado en vez de mezclarlo con el manual.

No se ha realizado ninguna descarga real desde EC2 al crear este manual. Las rutas son instrucciones para que la realices desde tu equipo.
