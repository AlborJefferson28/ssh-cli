# Release 1.2.0 (2025-10-17)

Versión: v1.2.0
Fecha: 2025-10-17

Resumen ejecutivo
------------------
Esta versión introduce mejoras significativas en la experiencia interactiva y en la ejecución de comandos remotos: soporte para comandos de larga duración con selección interactiva, ejecución de conexiones SSH en paralelo y una batería de pruebas unitarias e integración ampliadas. Además se han corregido fallos en la gestión de procesos en primer plano y se actualizaron documentación y empaquetado.

Cambios principales
------------------
- Nueva funcionalidad: soporte para comandos de larga duración con selección interactiva — ahora es posible gestionar y ejecutar comandos que requieren interacción o tiempos de ejecución prolongados desde la interfaz interactiva.
- Nueva funcionalidad: conexiones SSH paralelas — permite ejecutar múltiples conexiones/operaciones en paralelo para flujos de trabajo de despliegue y pruebas más rápidos.
- Calidad: se añadieron pruebas unitarias e integración ampliadas que cubren la interfaz de visualización, conexiones paralelas, detección de prompts de contraseña y validación del estado de procesos.
- Corrección: arreglo de errores relacionados con el manejo de procesos en primer plano (foreground processes) para evitar estados inconsistentes y cierres inesperados.
- Documentación: actualización de guías y troubleshooting para reflejar las nuevas características y procedimientos recomendados.

Compatibilidad y migración
-------------------------
La actualización es compatible hacia atrás con los archivos de procesos existentes. No se requieren acciones obligatorias por parte de los usuarios, aunque recomendamos:

- Hacer backup de `process/ssh-processes.json` antes de actualizar.
- Reinstalar dependencias y ejecutar la suite de tests en entornos CI: `npm install && npm test`.

Notas de versión técnica
-----------------------
- Versión previa en `package.json`: 1.1.1
- Tipo de incremento: minor (añade nuevas funcionalidades sin romper compatibilidad)

Autores
-------
Jefferson Albor y colaboradores

Referencias
-----------
- Repositorio: https://github.com/AlborJefferson28/ssh-cli
- CHANGELOG.md: historial detallado de cambios

Si encuentras problemas después de la actualización, por favor genera un reporte siguiendo las instrucciones en `docs/troubleshooting.md` y crea un issue en el repositorio con el archivo `error-report.txt`.
