# 📚 Comandos del SSH CLI

## 🔧 Modo Debug Simplificado

### Activación Automática del Debug
El modo debug se activa automáticamente cuando:
- Un comando retorna código de salida != 0
- Hay errores de ejecución
- Fallan comandos críticos

### Experiencia de Conexión Directa
Al activarse, el modo debug muestra **inmediatamente**:
- 📋 **Log completo** de todos los comandos ejecutados
- 🔧 **Línea de comandos activa** para diagnóstico en tiempo real
- ⌨️  **Atajos de teclado** para navegación rápida
- ↕️  **Historial de comandos** con navegación por flechas

### Atajos de Teclado Principales
```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                            ⌨️  ATAJOS DISPONIBLES                           ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║ ↑ / ↓   = 📜 Navegar por historial de comandos (hasta 50)                  ║
║ Ctrl+Q  = 🔄 Salir del debug (volver al proceso)                           ║
║ Ctrl+X  = 🚪 Finalizar conexión completamente                               ║
║ Ctrl+L  = 📋 Actualizar y mostrar log completo                             ║
║ Ctrl+H  = 🆘 Mostrar ayuda con comandos útiles                             ║
║ Ctrl+C  = 📋 Mostrar menú de opciones avanzadas                           ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Comandos Debug Útiles por Categoría

#### 🔍 Diagnóstico de Sistema
```bash
ps aux | grep [proceso]              # Ver procesos específicos
systemctl status [servicio]         # Estado de servicios
systemctl list-units --failed       # Servicios fallidos
journalctl -u [servicio] -n 20      # Logs recientes de servicio
df -h                               # Espacio en disco
free -h                             # Memoria disponible
uptime                              # Carga del sistema
```

#### 🌐 Diagnóstico de Red
```bash
netstat -tlnp                       # Puertos abiertos
ss -tlnp                            # Alternativa moderna a netstat
curl -I http://localhost            # Probar servicios web
ping -c 3 [host]                    # Conectividad
nslookup [domain]                   # Resolución DNS
```

#### 📁 Diagnóstico de Archivos
```bash
ls -la                              # Permisos de archivos
find . -name "[archivo]"            # Buscar archivos
tail -f /var/log/[archivo]          # Seguir logs en tiempo real
nginx -t                            # Probar configuración nginx
apache2ctl configtest              # Probar configuración Apache
```

#### 🔧 Diagnóstico de Servicios Web
```bash
# Para Nginx
nginx -t                            # Verificar configuración
nginx -s reload                     # Recargar configuración
systemctl status nginx             # Estado del servicio

# Para Apache
apache2ctl configtest              # Verificar configuración
systemctl status apache2           # Estado del servicio

# Para bases de datos
systemctl status mysql             # MySQL/MariaDB
systemctl status postgresql        # PostgreSQL
```

### Flujo de Trabajo Optimizado

1. **Error detectado** → Modo debug se activa automáticamente
2. **Log completo visible** → Revisar historial y salida de comandos
3. **Diagnóstico rápido** → Ejecutar comandos con atajos de teclado
4. **Resolución** → Ctrl+Q para volver al proceso o Ctrl+X para finalizar

### Ejemplo de Sesión Debug
```
🔧 debug@web-server:~$ systemctl status nginx
● nginx.service - A high performance web server
   Loaded: loaded (/lib/systemd/system/nginx.service; enabled; vendor preset: enabled)
   Active: failed (Result: exit-code) since Mon 2025-10-06 14:30:15 UTC

🔧 debug@web-server:~$ journalctl -u nginx -n 5
Oct 06 14:30:15 web-server nginx[1234]: nginx: [emerg] bind() to 0.0.0.0:80 failed

🔧 debug@web-server:~$ sudo lsof -i :80
apache2   5678 www-data    4u  IPv6      0t0  TCP *:http (LISTEN)

🔧 debug@web-server:~$ sudo systemctl stop apache2
🔧 debug@web-server:~$ sudo systemctl start nginx
🔧 debug@web-server:~$ # Ctrl+Q (problema solucionado, volver al proceso)
```

### Opciones Post-Debug
Después de salir del modo debug:
```
🔄 ¿Cómo deseas continuar?
  🔄 Reiniciar proceso desde el inicio     # Vuelve a ejecutar todo
  ▶️  Continuar desde el comando que falló  # Reintenta comando
  ⏭️  Saltar comando fallido y continuar   # Omite comando y sigue
  🚪 Finalizar proceso completamente      # Termina proceso
```

## 🖱️ Modo Interactivo (Recomendado)

### Ejecutar Modo Interactivo
```bash
node index.mjs
```

**Funcionalidades del Modo Interactivo:**

#### **🚀 Menú Principal**
- **📋 Navegar procesos SSH por host**: Explora procesos organizados por hosts
- **🚀 Crear nuevo proceso SSH**: Wizard completo de creación con debug integrado
- **▶️ Ejecutar proceso (selección rápida)**: Ejecución directa con soporte debug
- **🗑️ Eliminar proceso**: Eliminación segura con confirmación
- **📊 Ver estadísticas**: Información detallada de todos los procesos
- **🆘 Ver ayuda**: Ayuda contextual completa
- **🚪 Salir**: Salida limpia del programa

#### **🏠 Navegación por Hosts**
La navegación se organiza en **3 niveles jerárquicos**:

**Nivel 1: Lista de Hosts**
```
📋 Procesos SSH Guardados (Agrupados por Host)
═══════════════════════════════════════════════════════
🏠 HOST ID: 1 | NOMBRE: Servidor Producción
📊 Total de procesos: 3
    1. Deploy Frontend
    2. Deploy Backend  
    3. Backup Database

🏠 HOST ID: 2 | NOMBRE: Servidor Testing
📊 Total de procesos: 2
    1. Test Suite
    2. Performance Test
```

**Nivel 2: Procesos del Host**
```
🏠 Host: Servidor Producción
📊 Procesos disponibles: 3
──────────────────────────────────────────────────

📝 Deploy Frontend (5 comandos)
📝 Deploy Backend (7 comandos)
📝 Backup Database (4 comandos)
⬅️  Volver a la lista de hosts
```

**Nivel 3: Detalles del Proceso**
```
📊 Detalles del Proceso
══════════════════════════════════════════════════
┌─ Información del proceso ────────────────────────┐
│ 📝 Nombre: Deploy Frontend                       │
│ 🏠 Host: Servidor Producción                     │
│ 🌐 Servidor: prod.empresa.com:22                 │
│ 👤 Usuario: deploy                               │
│ 📅 Creado: 05/10/25 14:30                       │
│ ⚙️  Comandos: 5 comando(s)                       │
└───────────────────────────────────────────────────┘

📋 Lista de comandos:
   1. cd /var/www/frontend
   2. git pull origin main
   3. npm install --production
   4. npm run build
   5. sudo systemctl restart nginx

🚀 Ejecutar este proceso
⬅️  Volver a la lista de procesos
```

#### **🎨 Características Visuales**
- **Pantallas Limpias**: Solo muestra información relevante
- **Banners Contextuales**: Headers específicos para cada operación
- **Navegación Intuitiva**: Volver atrás en cualquier momento
- **Confirmaciones Visuales**: Confirmaciones de éxito/error/cancelación
- **Progreso Visual**: Indicadores durante configuración y ejecución

---

## 📋 Modo CLI Tradicional

### Sintaxis General

```bash
node index.mjs [comando] [opciones]
```

### `help`
Muestra la ayuda completa del CLI con todos los comandos disponibles.

```bash
node index.mjs help
```

**Salida:**
- Lista de todos los comandos disponibles
- Ejemplos de uso
- Descripción de características principales
- Información sobre modo interactivo

---

### `list`
Lista todos los procesos SSH guardados **agrupados por nombre de host**.

```bash
node index.mjs list
```

**Nueva información mostrada:**
- **🏠 HOST ID**: Identificador numérico del host (para usar con `-h`)
- **NOMBRE**: Nombre del host configurado
- **📊 Total de procesos**: Cantidad de procesos para ese host
- **Posición**: Número de posición del proceso dentro del host (para usar con `-p`)
- **Nombre del proceso**: Nombre descriptivo del proceso

**Ejemplo de salida:**
```
📋 Procesos SSH Guardados (Agrupados por Host)
═══════════════════════════════════════════════════════
🏠 HOST ID: 1 | NOMBRE: Servidor Producción
📊 Total de procesos: 2
    1. Deploy Frontend
    2. Deploy Backend

🏠 HOST ID: 2 | NOMBRE: Servidor Testing  
📊 Total de procesos: 1
    1. Test Automation

💡 Uso: ssh-cli start -h <host_id> -p <posición> para ejecutar un proceso
📁 Procesos guardados en: ./process/
📁 Logs guardados en: ./logs/
```

---

### `start`
Inicia un nuevo proceso SSH interactivo o ejecuta un proceso guardado.

#### **🆕 Nuevo proceso con Wizard Visual**
```bash
node index.mjs start
```

**Flujo del Wizard Mejorado con Detección Inteligente:**

**Pantalla 1: Crear Nuevo Proceso**
- Banner específico de creación
- **🌐 Host remoto** (primer input): `servidor.ejemplo.com`
- Validación inmediata de formato
- **🔍 Detección automática**: Verifica si el host ya existe

**Pantalla 2: Configuración Inteligente**
- **Host Nuevo:**
  - Mensaje: `🆕 Host nuevo detectado`
  - Solicita: `🏷️ Nombre del Host` (obligatorio, min 3 caracteres)
  - Configuración completa: puerto, usuario, contraseña
  
- **Host Existente:**
  - Mensaje: `✅ Host encontrado: [Nombre] ([host])`
  - Muestra: `📊 Procesos existentes para este host: X`
  - Pre-completa puerto y usuario con valores existentes
  - Solo solicita contraseña

**Pantalla 3: Configurar Comandos**
- Pantalla dedicada para agregar comandos
- Información contextual del host
- Para hosts existentes: muestra procesos existentes
- Sugerencias inteligentes de comandos comunes
- Vista previa de comandos agregados
- Actualización visual al agregar más comandos

**Pantalla 4: Guardar Proceso**
- Resumen de toda la configuración
- Para hosts existentes: muestra `📊 Procesos existentes en este host: X`
- Opción de guardar para uso futuro
- Confirmación visual de guardado exitoso

**Pantalla 5: Resumen de Ejecución**
- Vista previa completa antes de ejecutar
- Información de conexión
- Lista de comandos a ejecutar
- Confirmación final

#### **🎯 Ejecutar proceso guardado (Método Recomendado)**
```bash
node index.mjs start -h <host_id> -p <posición>
```

**Parámetros:**
- `-h <host_id>`: ID numérico del host (obtenido con `list`)
- `-p <posición>`: Posición del proceso dentro del host (comenzando en 1)

**Ejemplos:**
```bash
node index.mjs start -h 1 -p 1  # Host ID 1, posición 1
node index.mjs start -h 2 -p 3  # Host ID 2, posición 3
```

#### **⚠️ Ejecutar proceso guardado (Método Obsoleto)**
```bash
node index.mjs start -p <ID>
```

**Parámetros:**
- `-p <ID>`: ID global del proceso guardado (obsoleto)

**Ejemplo:**
```bash
node index.mjs start -p 1
```

> ⚠️ **Nota**: Este método está obsoleto. Se recomienda usar el método por host ID y posición para mayor claridad.

**🚀 Características de ejecución mejoradas:**
- ✅ **Progreso en tiempo real**: Pantalla limpia con estado de cada comando
- 🔐 **Detección automática de sudo**: Envía contraseñas automáticamente
- 📁 **Contexto de directorio**: Mantiene el directorio de trabajo
- 🧹 **Interfaz limpia**: Solo muestra progreso actual
- 📊 **Resumen final**: Estadísticas completas con banners visuales
- 📄 **Logging detallado**: Guarda logs detallados de toda la sesión

---

### `delete`
Elimina un proceso SSH guardado permanentemente.

```bash
node index.mjs delete -p <ID>
```

**Parámetros:**
- `-p <ID>`: ID global del proceso a eliminar (requerido)

**Ejemplo:**
```bash
node index.mjs delete -p 2
```

**🗑️ Proceso de eliminación:**
1. Valida que el ID existe
2. Muestra información del proceso a eliminar
3. Confirma la eliminación
4. Actualiza archivo de configuración
5. Muestra confirmación final

## 🆕 Nuevas Funcionalidades v1.1.0

### **📊 Estadísticas Interactivas**
Accesible desde el modo interactivo:
- Estadísticas generales de procesos
- Desglose detallado por host
- Información de servidores únicos
- Promedio de comandos por proceso

### **✅ Validaciones Avanzadas**
- **Host Names**: Mínimo 3 caracteres, formato válido
- **Hosts**: Validación de formato IP/dominio
- **Puertos**: Rango válido 1-65535
- **Comandos**: No pueden estar vacíos
- **IDs de Proceso**: Validación de existencia

### **💡 Sugerencias Inteligentes**
Durante la creación de comandos:
```
Sugerencias comunes: ls, cd, pwd, ps aux, df -h, free -h, systemctl status
```

**Autocompletado dinámico:**
- `ls` → sugerencia: `ls -la`
- `git` → sugerencia: `git status`
- `sudo` → sugerencia: `sudo systemctl restart`
- `docker` → sugerencia: `docker ps`

### **🧹 Experiencia de Usuario Mejorada**
- **Pantallas Limpias**: `console.clear()` en cada transición
- **Banners Contextuales**: Headers específicos para cada operación
- **Navegación Intuitiva**: Opciones claras para volver atrás
- **Confirmaciones Visuales**: Mensajes de éxito/error profesionales
- **📜 Historial de comandos**: Navegación rápida con flechas arriba/abajo

## ⚠️ Validaciones y Mensajes de Error

### **Host ID inválido**
```
❌ ID de host inválido. Debe ser un número mayor a 0.
💡 Usa 'ssh-cli list' para ver los IDs de host disponibles.
```

### **Host inexistente**
```
❌ No se encontró el host con ID "3".
💡 Hay 2 host(s) disponible(s).
💡 Usa 'ssh-cli list' para ver los IDs de host disponibles.
```

### **Posición inválida**
```
❌ Posición inválida para el host ID "1" (Servidor Producción).
💡 El host "Servidor Producción" tiene 2 proceso(s).
💡 Usa 'ssh-cli list' para ver las posiciones disponibles.
```

### **Comando no reconocido**
```
⚠️  Comando 'comando-invalido' no reconocido.
💡 Iniciando modo interactivo...
```

## 💡 Consejos de Uso

1. **🖱️ Usa el modo interactivo** para una experiencia completa
2. **📋 Usa `list` frecuentemente** para verificar tus procesos organizados por host
3. **🏠 Nombres descriptivos de host** ayudan a organizar mejor los procesos
4. **🎯 Método recomendado**: Usa `-h <host_id> -p <posición>` en lugar del ID global obsoleto
5. **🧪 Prueba comandos** en un proceso temporal antes de guardarlo
6. **📄 Revisa los logs** si algún comando falla usando el modo interactivo
7. **🗑️ Organiza tus procesos** eliminando los que ya no uses
8. **📊 Agrupa procesos** del mismo servidor bajo el mismo nombre de host
9. **🔄 Navega libremente** entre hosts y procesos usando el modo interactivo