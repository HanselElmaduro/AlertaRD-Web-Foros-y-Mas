# Validación de la entrega

Fecha: 19 de septiembre de 2026.

## Comprobaciones ejecutadas

| Comprobación | Resultado | Alcance |
| --- | --- | --- |
| Compilación Sites / Vinext | Correcta | Worker, recursos del navegador y migración empaquetados |
| TypeScript `tsc --noEmit` | Correcto | Proyecto completo, incluidos los tests |
| API `node tests/run.mjs` | 27 grupos aprobados, 0 fallidos | Manejadores reales, SQLite aislado en memoria |
| Portada y navegación | Revisadas en navegador | Vista de escritorio; imágenes suministradas, enlaces internos y carga de datos |
| Votaciones | Comprobadas en navegador | Persistencia D1 local, porcentaje actualizado y deduplicación |
| Encuesta | Comprobada en navegador | Carga de 13 preguntas, error de campos obligatorios y paso de página; guardado/consentimiento cubiertos en API |
| Foro | Comprobado en navegador y API | Debates oficiales, comentarios, publicación moderada y resultados |
| Simuladores | Revisados en navegador y API | Activación visual y cancelación de accidente; eventos ficticios persistidos |
| Credenciales y entorno | Revisados | Sin claves en el código ni en el ZIP; entrega administrativa por separado |

## Cobertura de las 27 pruebas de API

1. Inicio sin participación ficticia, encuesta de 13 preguntas y cinco debates oficiales.
2. Invitados no pueden acceder a administración, exportación ni gestión.
3. Votos persistentes y actualizables sin duplicados.
4. Votos inválidos y peticiones con origen ajeno rechazados.
5. Configuración ideal actualizada en un único registro.
6. Consentimiento, versión de encuesta, persistencia y duplicados.
7. Comentarios pendientes privados y propiedad verificada.
8. Hilos nuevos sujetos a moderación.
9. Propuestas anónimas guardadas de forma privada.
10. Registro conserva historial de invitado, deriva contraseña y rota sesión.
11. Login, logout, historial y debates guardados.
12. Clave privada de primer administrador de uso único y control de roles.
13. Aprobación y opiniones destacadas alimentan los resultados públicos.
14. Respuestas a comentarios y likes reversibles.
15. Reportes, resolución y ocultación de contenido.
16. Aprobación, destacado y cierre de hilos.
17. Votos en debates sin duplicados.
18. Creación y desactivación de encuestas por administrador.
19. Preguntas inmutables después de recibir respuestas.
20. Decisiones públicas con estado.
21. Exportación CSV autenticada sin correos.
22. Permisos limitados del moderador.
23. Registro de simulaciones sin integraciones de emergencia.
24. Eliminación del contenido propio.
25. Búsqueda con parámetros SQL.
26. Eliminación de cuenta y participación relacionada.
27. Límite de frecuencia aplicado en servidor.

## Límites de esta verificación

- Los datos de prueba se mantienen en entornos locales o en memoria; no se importan a la base publicada.
- El diseño tiene reglas adaptables a 1200, 1000, 800 y 550 píxeles, pero no se completó una matriz de pruebas en dispositivos Android/iPhone físicos. La vista de navegador disponible fue de escritorio.
- La conexión a Supabase, las migraciones PostgreSQL y la edición alternativa de Vercel requieren verificación en esos servicios con credenciales del responsable.
- No se realizó auditoría de penetración, prueba de carga ni certificación WCAG. Hay foco visible, labels, controles de teclado y reducción de movimiento; esto no equivale a una certificación.
- No se verifican correos ni se envían mensajes de recuperación: el sistema de correo transaccional no está configurado.
- La entrega inicial tiene acceso privado. El responsable debe crear su cuenta administradora antes de gestionar una convocatoria pública.

Para repetir las pruebas, sigue los comandos del README. Los resultados son evidencia técnica de estos recorridos, no evidencia de opiniones ciudadanas ni de efectividad de respuesta a emergencias.
