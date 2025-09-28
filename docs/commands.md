# 📚 Comandos del SSH CLI

## Sintaxis General

```bash
node index.mjs [comando] [opciones]
```

## 📋 Lista de Comandos

### `help`
Muestra la ayuda completa del CLI con todos los comandos disponibles.

```bash
node index.mjs help
```

**Salida:**
- Lista de todos los comandos disponibles
- Ejemplos de uso
- Descripción de características principales

---

### `list`
Lista todos los procesos SSH guardados con su información detallada.

```bash
node index.mjs list
```

**Información mostrada:**
- **ID**: Número único del proceso
- **Nombre**: Nombre descriptivo del proceso
- **Host**: Servidor de destino y puerto
- **Usuario**: Usuario SSH configurado
- **Fecha de creación**: Cuándo se guardó el proceso
- **Comandos**: Lista completa de comandos a ejecutar

**Ejemplo de salida:**
```
┌─ ID: 1 ──────────────────────────────────────────────────────────┐
│ 📝 Nombre: Deploy Producción                                      │
│ 🌐 Host: servidor.empresa.com:22                                  │
│ 👤 Usuario: deploy                                                │
│ 📅 Creado: 28/09/25 14:30                                        │
│ ⚙️  Comandos: 3 comando(s)                                        │
│                                                                   │
│ 📋 Lista de comandos:                                             │
│    1. cd /var/www/app                                             │
│    2. git pull origin main                                        │
│    3. sudo systemctl restart nginx                                │
└──────────────────────────────────────────────────────────────────┘
```

---

### `start`
Inicia un nuevo proceso SSH interactivo o ejecuta un proceso guardado.

#### Nuevo proceso
```bash
node index.mjs start
```

**Flujo interactivo:**
1. **Host remoto**: Dirección IP o dominio del servidor
2. **Puerto SSH**: Puerto SSH (por defecto 22)
3. **Usuario SSH**: Nombre de usuario para la conexión
4. **Contraseña**: Contraseña del usuario (oculta con asteriscos)
5. **Comandos**: Uno o más comandos a ejecutar
6. **Guardar proceso**: Opción de guardar la configuración para uso futuro

#### Ejecutar proceso guardado
```bash
node index.mjs start -p <ID>
```

**Parámetros:**
- `-p <ID>`: ID del proceso guardado (obtenido con `list`)

**Ejemplo:**
```bash
node index.mjs start -p 1
```

**Características de ejecución:**
- ✅ **Progreso en tiempo real**: Muestra el estado de cada comando
- 🔐 **Detección automática de sudo**: Envía contraseñas automáticamente
- 📁 **Contexto de directorio**: Mantiene el directorio de trabajo
- 📊 **Resumen final**: Estadísticas de ejecución completas
- 📄 **Logging**: Guarda logs detallados de toda la sesión

---

### `delete`
Elimina un proceso SSH guardado permanentemente.

```bash
node index.mjs delete -p <ID>
```

**Parámetros:**
- `-p <ID>`: ID del proceso a eliminar (requerido)

**Ejemplo:**
```bash
node index.mjs delete -p 2
```

**Proceso de eliminación:**
1. Valida que el ID existe
2. Muestra información del proceso a eliminar
3. Elimina el proceso del archivo de configuración
4. Confirma la eliminación exitosa

**Ejemplo de salida:**
```
🗑️  Eliminando proceso:
┌─ Proceso a eliminar ─────────────────────────────────────────────┐
│ 📝 Nombre: Test Server                                            │
│ 🌐 Host: test.ejemplo.com:22                                      │
│ 👤 Usuario: testuser                                              │
│ ⚙️  Comandos: 2 comando(s)                                        │
└──────────────────────────────────────────────────────────────────┘

✅ Proceso eliminado exitosamente.
📊 Procesos restantes: 3
```

## ⚠️ Validaciones

### Comando `start -p`
- Valida que el ID sea un número válido
- Verifica que el proceso existe en la lista
- Solicita contraseña nuevamente por seguridad

### Comando `delete -p`
- Requiere el parámetro `-p` obligatoriamente
- Valida que el ID sea un número mayor a 0
- Verifica que el proceso existe antes de eliminar

## 🔍 Mensajes de Error

### ID inválido
```
❌ Número de proceso inválido. Usa 'list' para ver los procesos disponibles.
```

### Parámetro faltante
```
❌ Debes especificar el ID del proceso a eliminar.
💡 Uso: node index.mjs delete -p <ID>
   Ejemplo: node index.mjs delete -p 2
   Usa 'node index.mjs list' para ver los procesos disponibles.
```

### Sin procesos guardados
```
📭 No hay procesos SSH guardados para eliminar.
```

## 💡 Consejos de Uso

1. **Usa `list` frecuentemente** para verificar tus procesos guardados
2. **Nombres descriptivos** ayudan a identificar procesos rápidamente
3. **Prueba comandos** en un proceso temporal antes de guardarlo
4. **Revisa los logs** si algún comando falla
5. **Organiza tus procesos** eliminando los que ya no uses