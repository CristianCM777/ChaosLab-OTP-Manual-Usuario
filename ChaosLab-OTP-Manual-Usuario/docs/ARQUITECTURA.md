# Arquitectura del proyecto original Erlang/OTP

```text
p21_pruebas_de_caos_sup (raíz)
  ├── sup_one_for_one
  │   ├── sup_one_for_one_a
  │   ├── sup_one_for_one_b
  │   └── sup_one_for_one_c
  ├── sup_rest_for_one
  │   ├── sup_rest_for_one_a
  │   ├── sup_rest_for_one_b
  │   └── sup_rest_for_one_c
  └── sup_one_for_all
      ├── sup_one_for_all_a
      ├── sup_one_for_all_b
      └── sup_one_for_all_c
```

Cada supervisor controla tres `gen_server`. La prueba de caos provoca una terminación anormal deliberada, inspecciona PID y respuestas después de la recuperación y registra el resultado.

## Módulos del backend

| Módulo en el proyecto original | Responsabilidad |
|---|---|
| `caos_worker.erl`, `caos_worker_multi.erl` | Procesos `gen_server` |
| `caos_estrategia_sup.erl` | Estrategias OTP y especificación de reinicio |
| `p21_pruebas_de_caos_sup.erl` | Supervisor principal |
| `caos_experimento.erl` | Inyección de caída, evaluación y medición |
| `caos_historial.erl` | Registro en `experimentos_caos.log` |
| `caos_estadisticas.erl` | Totales, tiempos y resúmenes |
| `caos_http.erl` | Servicio Cowboy y rutas REST |
| `caos_ejecutar_handler.erl` y otros handlers | Comunicación HTTP |

## API observada durante el desarrollo

| Método | Endpoint | Acción |
|---|---|---|
| `GET` | `/api/salud` | Estado de la API |
| `GET` | `/api/arbol` | Supervisores, workers y PID |
| `GET` | `/api/historial` | Registro histórico |
| `GET` | `/api/estadisticas` | Métricas globales |
| `GET` | `/api/estadisticas/estrategias` | Métricas por supervisor |
| `POST` | `/api/experimentos` | Ejecutar prueba controlada |

### Solicitud POST de ejemplo

```json
{"estrategia":"rest_for_one","cantidad":1}
```

La API acepta opcionalmente `"proceso":"sup_rest_for_one_a"` para la inyección selectiva usada desde el árbol, en la versión ampliada. La versión original del formulario usa B por defecto.

### Qué mide el sistema

Los tiempos de la aplicación son medidas de ejecución y verificación del experimento; no garantizan representar la disponibilidad completa de un servicio comercial. Un experimento 'exitoso' demuestra que la comprobación implementada se cumplió, no que la caída no ocurrió.

## Nota sobre `shutdown`

En las especificaciones OTP utilizadas se configuró `restart => permanent` y `shutdown => 5000`: `permanent` es el tipo de reinicio y `5000` es el plazo de apagado del hijo, no un tiempo de recuperación esperado ni `brutal_kill`.
