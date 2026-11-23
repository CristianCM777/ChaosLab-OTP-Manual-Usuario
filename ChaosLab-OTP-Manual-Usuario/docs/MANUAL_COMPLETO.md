# Manual de usuario e instalación — Pruebas de Caos en Erlang/OTP

**Proyecto:** 21 — Pruebas de Caos  
**Tecnologías:** Erlang/OTP 25, Rebar3, Cowboy 2.12.0, JavaScript, HTML y Tailwind CSS  
**Entorno utilizado:** Ubuntu 24.04 en AWS Academy Learner Lab (EC2)  
**Repositorio base:** https://github.com/tectijuana/erlang-proyectos/tree/main/proyectos/21-pruebas-de-caos

## 1. Introducción

Este proyecto permite estudiar la tolerancia a fallos en Erlang/OTP mediante experimentos de caos controlados. Se provoca intencionalmente un fallo en un proceso `gen_server` y se comprueba cómo lo recupera su supervisor. El sistema registra los resultados y muestra la información desde una interfaz web.

El experimento **no realiza ataques ni agota la memoria del servidor**: utiliza un fallo controlado del *worker B* para observar el comportamiento de las estrategias de supervisión.

## 2. Objetivo

Comparar el comportamiento de tres estrategias de supervisión OTP y registrar el tiempo transcurrido durante la ejecución y verificación de la recuperación de los procesos.

| Estrategia | Comportamiento al fallar el worker B |
| --- | --- |
| `one_for_one` | Se reinicia únicamente el worker B. |
| `rest_for_one` | Se reinician B y los workers iniciados después de B; con el orden A, B, C, se reinician B y C. |
| `one_for_all` | Se reinician los tres workers A, B y C. |

La aplicación maneja un supervisor raíz, tres subsupervisores y nueve workers (`A`, `B`, `C` por estrategia).

## 3. Requisitos previos

- Ubuntu con Erlang/OTP compatible con la versión utilizada en el proyecto (se desarrolló con OTP 25).
- Rebar3 (se utilizó la versión 3.19).
- Git para obtener el código.
- Conectividad para descargar dependencias de Rebar3 durante la primera compilación.
- Navegador web moderno.
- Si se ejecuta en EC2, acceso SSH mediante una llave `.pem` y puerto TCP 22 permitido desde la IP pública del usuario.

Verificar herramientas:

```bash
erl -version
rebar3 version
git --version
```

## 4. Obtener el proyecto

Si todavía no se dispone del repositorio:

```bash
git clone https://github.com/tectijuana/erlang-proyectos.git
cd erlang-proyectos/proyectos/21-pruebas-de-caos
```

**Importante:** las funciones y pantallas descritas corresponden a la versión desarrollada en la rama `desarrollo-pruebas-caos`. Si esa rama está publicada en GitHub, cambiar a ella mediante:

```bash
git fetch origin
git switch desarrollo-pruebas-caos
```

Si todavía no está publicada, debe utilizarse la copia local del proyecto o el repositorio/fork al que se haya subido esa rama. El repositorio base por sí solo puede no contener las modificaciones descritas.

## 5. Compilar y ejecutar

Ubicarse en el directorio del proyecto y ejecutar:

```bash
rebar3 compile
rebar3 eunit
rebar3 shell
```

Dentro de la consola Erlang, iniciar el servidor HTTP:

```erlang
caos_http:iniciar().
```

El servicio escucha en `127.0.0.1:8080`. Abrir en el navegador del servidor (o a través de un túnel SSH):

```text
http://localhost:8080/dashboard
```

Para cerrar la consola Erlang:

```erlang
q().
```

**Nota:** si se cierra la consola Erlang que hospeda Cowboy, la aplicación web deja de responder hasta que se vuelva a iniciar el servicio.

## 6. Acceso desde Windows a una instancia EC2

En AWS Academy, iniciar Learner Lab, verificar que EC2 esté **En ejecución** y copiar su **IPv4 pública actual**. Esa IP puede cambiar al detener y volver a iniciar una instancia.

En PowerShell, desde la carpeta que contiene `labsuser.pem`:

```powershell
ssh -i ".\labsuser.pem" -L 8080:127.0.0.1:8080 ubuntu@IP_PUBLICA
```

Sustituir `IP_PUBLICA` por la dirección asignada a la instancia. Una vez establecida la conexión y con Cowboy iniciado, abrir:

```text
http://localhost:8080/dashboard
```

El túnel `-L` permite acceder al puerto HTTP local de la instancia sin publicar el puerto 8080 en Internet. En el grupo de seguridad de EC2, permitir SSH/TCP 22 **solo desde la IP pública actual** del usuario (`/32`). Si SSH devuelve `Connection timed out`, verificar el estado de EC2, la IP, la regla de entrada y la conectividad TCP 22.

## 7. Manual de uso de la interfaz

### 7.1 Dashboard

Es la pantalla inicial. Presenta las métricas generales de los experimentos, la comparación de estrategias y la actividad reciente. Incluye una vista del árbol de supervisión que consulta los PID actuales de los procesos.

- **Actualizar datos:** recarga la información del panel.
- **Ver historial:** abre la pantalla del historial.
- **Nuevo experimento:** abre el cuadro de ejecución.
- **Inyectar Caos:** solicita una confirmación y envía un experimento real al backend.

### 7.2 Árbol de supervisión

Muestra el supervisor raíz, los subsupervisores `sup_one_for_one`, `sup_rest_for_one` y `sup_one_for_all`, y sus nueve workers. Se visualizan sus identificadores de proceso o **PID**.

Un PID es el identificador de un proceso Erlang (por ejemplo, `<0.209.0>`). Tras el reinicio de un worker, el nuevo proceso normalmente tiene otro PID; esto ayuda a observar la recuperación.

### 7.3 Experimentos

1. Seleccionar la estrategia `one_for_one`, `rest_for_one` o `one_for_all`.
2. Elegir la cantidad de experimentos, entre **1 y 100**.
3. Presionar **Ejecutar experimento de caos**.
4. Confirmar la operación para provocar el fallo controlado del worker B.
5. Revisar la cantidad de ejecuciones exitosas y fallidas, los tiempos de recuperación, la gráfica y el detalle de cada resultado.

Se recomienda comenzar con **1 o 2 experimentos** para la demostración en clase. Durante la ejecución pueden aparecer informes `CRASH REPORT` en Erlang: son esperados cuando corresponden al fallo intencional.

### 7.4 Historial

Consulta los experimentos guardados por el backend. Permite revisar resultados anteriores, filtrar por estrategia o resultado, buscar procesos, pasar entre páginas y copiar información en formato JSON.

El historial se guarda mediante el módulo `caos_historial.erl` en el archivo local `experimentos_caos.log`, por lo que los registros no dependen exclusivamente de la memoria del navegador.

### 7.5 Estadísticas

Presenta indicadores globales y por estrategia, entre ellos:

- Número total de experimentos.
- Experimentos exitosos y fallidos.
- Tiempo promedio, mínimo y máximo de recuperación.
- Comparación visual del comportamiento de las tres estrategias.

**Interpretación:** un menor tiempo observado no significa necesariamente que una estrategia sea mejor en cualquier sistema. Las estrategias reinician distintos conjuntos de procesos y los resultados dependen del número de muestras y las condiciones de prueba.

## 8. Arquitectura y archivos principales

| Archivo | Función |
| --- | --- |
| `src/caos_worker.erl` | Define el comportamiento de los workers `gen_server`. |
| `src/caos_worker_multi.erl` | Apoya el manejo de los workers de las distintas estrategias. |
| `src/caos_estrategia_sup.erl` | Configura los subsupervisores y las estrategias OTP. |
| `src/p21_pruebas_de_caos_sup.erl` | Define el árbol de supervisión principal. |
| `src/caos_experimento.erl` | Provoca el fallo controlado, comprueba reinicios y registra tiempos. |
| `src/caos_historial.erl` | Guarda los resultados en el historial persistente. |
| `src/caos_estadisticas.erl` | Calcula métricas resumidas. |
| `src/caos_http.erl` | Configura Cowboy, las rutas REST y los archivos web. |
| `src/caos_ejecutar_handler.erl` | Procesa las solicitudes de ejecución de experimentos. |
| `src/caos_arbol_handler.erl` | Entrega datos del árbol de supervisión. |
| `src/caos_historial_handler.erl` | Entrega los registros del historial. |
| `src/caos_estrategias_handler.erl` | Entrega estadísticas por estrategia. |
| `frontend/pages/` | Cinco páginas HTML de la interfaz. |
| `frontend/js/` | Lógica del frontend para consultar la API y actualizar cada pantalla. |

## 9. API REST

Con Cowboy en ejecución, pueden consultarse los siguientes endpoints:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/salud` | Comprueba si la API responde. |
| `GET` | `/api/arbol` | Consulta los supervisores, workers, PID y estados. |
| `GET` | `/api/historial` | Obtiene experimentos almacenados. |
| `GET` | `/api/estadisticas` | Obtiene estadísticas generales. |
| `GET` | `/api/estadisticas/estrategias` | Obtiene estadísticas por estrategia. |
| `POST` | `/api/experimentos` | Ejecuta uno o varios experimentos controlados. |

Ejemplo de comprobación:

```bash
curl http://127.0.0.1:8080/api/salud
```

Ejemplo de experimento **(provoca un fallo real y controlado)**:

```bash
curl -X POST http://127.0.0.1:8080/api/experimentos \
  -H "Content-Type: application/json" \
  -d '{"estrategia":"one_for_one","cantidad":1}'
```

La propiedad `estrategia` acepta `one_for_one`, `rest_for_one` o `one_for_all`; `cantidad` acepta enteros de 1 a 100. La API devuelve información de éxito o fallo y el tiempo observado en cada ejecución.

## 10. Verificación del funcionamiento

Ejecutar desde el directorio del proyecto:

```bash
rebar3 compile
rebar3 eunit
```

En la última revisión del desarrollo se obtuvo:

```text
2 tests, 0 failures
```

Con Cowboy iniciado, se verificó que los cinco endpoints `GET` respondían `HTTP 200`. También se comprobó manualmente la ejecución de experimentos desde la interfaz.

**Nota:** esas son evidencias de una ejecución de prueba; no constituyen garantía de que todas las instalaciones funcionen sin configurar su entorno.

## 11. Problemas frecuentes

**No abre `http://localhost:8080/dashboard`:** comprobar que la consola Erlang siga abierta, que se haya ejecutado `caos_http:iniciar().` y que el túnel SSH esté activo si se utiliza EC2.

**SSH muestra `Connection timed out`:** verificar que la instancia esté en ejecución, confirmar su IPv4 pública y comprobar que el grupo de seguridad permita TCP 22 desde la IP pública actual. Un ping fallido por sí solo no demuestra que SSH esté bloqueado.

**Los cambios del frontend no aparecen:** recargar con `Ctrl + F5` para evitar recursos almacenados en caché.

**Aparecen mensajes `CRASH REPORT` durante una prueba:** pueden ser normales cuando corresponden al fallo controlado intencional. Revisar el resultado del experimento para confirmar la recuperación.

**Falla la compilación o falta alguna dependencia:** ejecutar `rebar3 compile` con acceso a Internet y revisar las versiones de Erlang, Rebar3 y las dependencias indicadas en `rebar.config`.

## 12. Conclusión

Pruebas de Caos demuestra cómo Erlang/OTP gestiona fallos mediante supervisores. Al comparar `one_for_one`, `rest_for_one` y `one_for_all`, se observa que cada política reinicia un conjunto distinto de workers. La API REST y la interfaz web permiten ejecutar experimentos controlados, consultar PID reales, analizar tiempos de recuperación y conservar un historial de los resultados.

---

**Sugerencia para GitHub Gist:** crear un Gist público o secreto con el nombre `manual-pruebas-caos-erlango-otp.md` (puede cambiarse a `manual-pruebas-caos-erlang-otp.md`) y pegar el contenido completo de este archivo. Un Gist secreto no es privado: cualquier persona con el enlace puede acceder a él.
