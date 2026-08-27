# Mapa de riesgo del proyecto

**Grupo:** G12
**Integrantes:*Ariel Fernandez, Benjamin Diaz, Ignacio Silva, Leandro Placencia*
**Fecha:*27-08-2026*

Este archivo se completa en el taller de arqueología del proyecto (clase 3) y se
retoma en la clase 15 y en la clase 17, cuando se arme el plan de pruebas. Se
entrega completándolo en el repositorio del grupo, con un commit.

## Ronda 1: hallazgos en el código

Escala de la tercera columna: **directo** (apareció en la primera búsqueda),
**con vueltas** (hubo que abrir varios archivos antes), **no lo encontramos**.

| # | Pregunta | Archivo y línea | ¿Cuánto costó? | Lo que llama la atención |
|---|---|---|---|---|
| 1 | ¿Dónde se verifica la contraseña al iniciar sesión? |app/core/security.py:24 |directo |el mismo archivo emite los tokens |
| 2 | ¿Cuánto dura un token de sesión antes de expirar? |app/core/config.py:6 |directo |el tiempo de expiración del token es muy alto para ser un access token |
| 3 | ¿Dónde guarda el navegador el token, y qué hace la aplicación ante un `401`? |src/services/api.ts:21-31 |directo |la aplicacion redirige al login |
| 4 | ¿Qué código HTTP devuelve la API si el token es inválido? ¿Y si es válido pero el usuario ya no existe? |src/services/api.ts:21-31 |con vueltas |no hay validacion de usuarios en caso de que este deje de existir |
| 5 | ¿Dónde se decide si alguien es administrador? |app/api/dependencies.py:48-55 app/api/dependencies.py:41-46 |con vueltas | deberia ser error 401 |
| 6 | ¿Qué endpoints se pueden llamar sin estar autenticado? |app/api/endpoints/auth.py:15-38 app/api/endpoints/users.py:29-48 |con vueltas |tanto /register como /login pueden llamarse sin estar autenticado |
| 7 | ¿Qué impide que dos personas modifiquen el mismo entrenamiento a la vez? |app/api/endpoints/workouts.py:119-133 |con vueltas | no evita que mas de una persona modifique el mismo elemento a la vez|

"No lo encontramos" es un hallazgo válido: puede significar que no existe, y
también que el sistema es difícil de analizar.

## Ronda 2: riesgo por módulo

Impacto y probabilidad van de 1 a 5. El riesgo es el producto de ambos, y sirve
para ordenar los módulos, no para medir cuánto probar.

| Módulo | Impacto (1-5) | Probabilidad (1-5) | Riesgo | ¿Por qué? |
|---|---|---|---|---|
| Autenticación y tokens |5 |3 |15 | es importante que los tokens tengan un lapso de expiración mas corto en caso de filtracion |
| Registro de entrenamientos |4 |4 |16|La funcion principal de la aplicación es registrar y mantener un seguimiento de los entrenamientos |
| Base de datos de ejercicios | 2|2 |4 |Depende de los datos que almacene la base de datos |
| Plantillas de entrenamiento | 2|4 |8 |Es útil pero no esencial para el correcto funcionamiento de la aplicación |
| Panel de administración |5 |3 |15 |Es importante que la administración del sistema funcione correctamente porque es donde se organizan y distribuyen los datos|
| Historial y estadísticas |1 |2 |2|No afecta tanto a la experiencia del usuario a comparacion de otros aspectos |
| Interfaz responsive |3 |3 |9 |Es importante ya que de esto depende la experiencia del usuario dentro de la aplicacion |

La columna del porqué es la única que se puede discutir: una justificación
nombra un usuario y una consecuencia.

## Ronda 3: si tuviéramos una sola tarde

Tres cosas, en orden de prioridad, con una frase de justificación cada una.

1. **Probar la seguridad de la creacion y uso de los tokens** *Porque se necesita justificar la seguridad del sistema y resguardar la integridad de los datos del usuario*
2. **Comprobar la integridad de los datos al momento de modificarlos y actualizarlos** *Porque es importante que exista coherencia en los datos y reducir errores*
3. **Comprobar que los errores estuvieran correctos y entreguen la información correcta al usuario o a otros desarrolladores** *Porque sirve para tener mejor retroalimentación como desarrolladores e indicar al usuario como proceder*
