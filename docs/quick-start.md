# 🚀 Guía de Inicio Rápido

## Requisitos Previos

- **Node.js** >= 16.0.0
- **npm** o **yarn**
- Acceso SSH a un servidor remoto

## ⚡ Instalación Rápida

1. **Clona o descarga el proyecto**
```bash
# Si tienes el repositorio
git clone <repository-url>
cd ssh-cli

# O simplemente descarga los archivos
```

2. **Instala las dependencias**
```bash
npm install
```

3. **Verifica la instalación**
```bash
node index.mjs help
```

## 🖱️ Modo Interactivo (Recomendado)

### ⚡ Inicio Inmediato
```bash
node index.mjs
```

Te llevará directamente al **menú principal interactivo** con navegación visual completa.

### 🎯 Tu Primera Experiencia Interactiva

#### **Pantalla 1: Menú Principal**
```
╔═════════════════════════════════════════════════════════════╗
║                                                    
║              _____ _____ _   _     _____  _     _  
║             |   __|   __| |_| |   |  ___|| |   | | 
║             |___  |___  |  _  |   | |___ | |___| | 
║             |_____|_____|_| |_|   |_____||_____|_| 
║                                                    
║             🚀 SSH Remote Command Executor v1.2.0  
║                                                    
╚═════════════════════════════════════════════════════════════╝

🚀 ¿Qué deseas hacer?
> 📋 Navegar procesos SSH por host
  🚀 Crear nuevo proceso SSH
  ▶️  Ejecutar proceso (selección rápida)
  🗑️  Eliminar proceso
  📊 Ver estadísticas
  🆘 Ver ayuda
  🚪 Salir
```

#### **Opción 1: 🚀 Crear nuevo proceso SSH**

**Pantalla de Creación (Flujo Inteligente):**
```
╔═════════════════════════════════════════════════════════════╗
║                                                    
║                🚀 CREAR NUEVO PROCESO SSH               
║                                                    
╚═════════════════════════════════════════════════════════════╝

? 🌐 Host remoto: prod.miempresa.com
```

**🔍 Detección Automática:**

**Caso 1: Host Nuevo**
```
🆕 Host nuevo detectado: prod.miempresa.com
? 🏷️  Nombre del Host: Mi Servidor Producción
? 🔌 Puerto SSH: (22)
? 👤 Usuario SSH: deploy
? 🔐 Contraseña: ********
```

**Caso 2: Host Existente**
```
✅ Host encontrado: Mi Servidor Producción (prod.miempresa.com)
📊 Procesos existentes para este host: 3
? 🔌 Puerto SSH (actual: 22): (22)
? 👤 Usuario SSH (actual: deploy): (deploy)
? 🔐 Contraseña: ********
```

**Pantalla de Comandos:**
```
╔═════════════════════════════════════════════════════════════╗
║                                                    
║               📋 CONFIGURAR COMANDOS SSH                
║                                                    
╚═════════════════════════════════════════════════════════════╝

🏠 Host: Mi Servidor Producción
🌐 Servidor: prod.miempresa.com:22
👤 Usuario: deploy

📋 Agrega comandos a ejecutar:
💡 Sugerencias comunes: ls, cd, pwd, ps aux, df -h, free -h, systemctl status
──────────────────────────────────────────────────────────────────

? ⚙️  Comando 1: cd /var/www/app
? ➕ ¿Quieres agregar otro comando? Yes
? ⚙️  Comando 2: git pull origin main
? ➕ ¿Quieres agregar otro comando? Yes
? ⚙️  Comando 3: sudo systemctl restart nginx
? ➕ ¿Quieres agregar otro comando? No
```

**Pantalla de Guardado:**
```
╔═════════════════════════════════════════════════════════════╗
║                                                    
║               💾 GUARDAR PROCESO SSH                    
║                                                    
╚═════════════════════════════════════════════════════════════╝

🏠 Host: Mi Servidor Producción
🌐 Servidor: prod.miempresa.com:22
👤 Usuario: deploy
📋 Comandos configurados: 3
  1. cd /var/www/app
  2. git pull origin main
  3. sudo systemctl restart nginx

? ¿Deseas guardar este proceso SSH para uso futuro? Yes
? Nombre para este proceso SSH: Deploy Aplicación
```

**Pantalla de Confirmación:**
```
╔═════════════════════════════════════════════════════════════╗
║                                                    
║               ✅ PROCESO GUARDADO EXITOSAMENTE              
║                                                    
╚═════════════════════════════════════════════════════════════╝

📝 Nombre del proceso: Deploy Aplicación
🏠 Host: Mi Servidor Producción
🌐 Servidor: prod.miempresa.com:22
👤 Usuario: deploy
📋 Comandos guardados: 3
📊 Total de procesos guardados: 1
```

#### **Opción 2: 📋 Navegar procesos por host**

**Nivel 1: Lista de Hosts**
```
📋 Procesos SSH Guardados (Agrupados por Host)
═══════════════════════════════════════════════════════
🏠 HOST ID: 1 | NOMBRE: Mi Servidor Producción
📊 Total de procesos: 1
    1. Deploy Aplicación

? ¿Qué host deseas navegar?
> 🏠 Mi Servidor Producción (1 proceso)
  🚪 Volver al menú principal
```

**Nivel 2: Procesos del Host**
```
🏠 Host: Mi Servidor Producción
📊 Procesos disponibles: 1
──────────────────────────────────────────────────

? 📋 Selecciona un proceso de "Mi Servidor Producción":
> 📝 Deploy Aplicación (3 comandos)
  ⬅️  Volver a la lista de hosts
```

**Nivel 3: Detalles del Proceso**
```
📊 Detalles del Proceso
══════════════════════════════════════════════════
┌─ Información del proceso ────────────────────────┐
│ 📝 Nombre: Deploy Aplicación                     │
│ 🏠 Host: Mi Servidor Producción                  │
│ 🌐 Servidor: prod.miempresa.com:22               │
│ 👤 Usuario: deploy                               │
│ 📅 Creado: 05/10/25 14:30                       │
│ ⚙️  Comandos: 3 comando(s)                       │
└───────────────────────────────────────────────────┘

📋 Lista de comandos:
   1. cd /var/www/app
   2. git pull origin main
   3. sudo systemctl restart nginx

? ¿Qué deseas hacer?
> 🚀 Ejecutar este proceso
  ⬅️  Volver a la lista de procesos
```

## 🎯 Modo CLI Tradicional

### Tu Primera Conexión SSH (Método Tradicional)

#### Paso 1: Ejecutar el CLI
```bash
node index.mjs start
```

#### Paso 2: Configurar la conexión
El CLI te pedirá la siguiente información con **detección inteligente**:

```
? � Host remoto: tu-servidor.com

� Host nuevo detectado: tu-servidor.com
? 🏷️  Nombre del Host: Mi Primer Servidor
? 🔌 Puerto SSH: 22
? 👤 Usuario SSH: tu-usuario
? 🔐 Contraseña: ********
```

#### Paso 3: Agregar comandos
```
? ⚙️  Comando 1: ls -la
? ➕ ¿Quieres agregar otro comando? Yes
? ⚙️  Comando 2: whoami
? ➕ ¿Quieres agregar otro comando? No
```

#### Paso 4: Guardar proceso (opcional)
```
? ¿Deseas guardar este proceso SSH para uso futuro? Yes
? Nombre para este proceso SSH: Mi Primer Proceso
```

#### Paso 5: Ejecutar
```
? 🚀 ¿Ejecutar ahora? Yes
```

## 📋 Ejemplo Completo: Deploy de Aplicación Web

### Escenario usando Modo Interactivo

1. **Ejecutar** `node index.mjs`
2. **Seleccionar** "🚀 Crear nuevo proceso SSH"
3. **Configurar conexión:**
   ```
   Host: Servidor Producción
   Host remoto: servidor-produccion.empresa.com
   Puerto SSH: 22
   Usuario SSH: deploy
   Contraseña: ********
   ```

4. **Agregar comandos de deploy:**
   ```
   Comando 1: cd /var/www/mi-app
   Comando 2: git pull origin main
   Comando 3: npm install --production
   Comando 4: npm run build
   Comando 5: sudo systemctl restart nginx
   Comando 6: sudo systemctl restart mi-app
   ```

5. **Guardar como "Deploy Producción"**

6. **Ejecutar inmediatamente**

### Reutilizar el proceso guardado

#### Método Interactivo:
```bash
node index.mjs
# → Navegar procesos SSH por host
# → Seleccionar "Servidor Producción"  
# → Seleccionar "Deploy Producción"
# → Ejecutar proceso
```

#### Método CLI:
```bash
# Listar procesos agrupados por host
node index.mjs list

# Ejecutar proceso Host ID 1, posición 1
node index.mjs start -h 1 -p 1
```

## 🔧 Comandos Básicos de Prueba

### Verificar conectividad (Modo Interactivo)
1. `node index.mjs`
2. "🚀 Crear nuevo proceso SSH"
3. Configurar servidor
4. Comando: `ping -c 3 google.com`

### Información del sistema
**Comandos sugeridos:**
- `uname -a` (información del sistema)
- `df -h` (espacio en disco)
- `free -m` (memoria)
- `whoami` (usuario actual)

### Gestión de archivos
**Comandos sugeridos:**
- `pwd` (directorio actual)
- `ls -la` (listar archivos)
- `cd /tmp` (cambiar directorio)
- `ls -la` (verificar cambio)

## 📊 Verificar Resultados

### Logs de ejecución
Los logs se guardan automáticamente en:
```
logs/ssh-log-[timestamp].txt
```

### Contenido del log mejorado
```
=== COMANDO: git pull origin main ===
DIRECTORIO ACTUAL: /var/www/app
COMANDO EJECUTADO: cd /var/www/app && git pull origin main
Already up to date.
=== FIN COMANDO (código: 0) ===

=== COMANDO: sudo systemctl restart nginx ===
DIRECTORIO ACTUAL: /var/www/app
COMANDO EJECUTADO: cd /var/www/app && sudo systemctl restart nginx
[AUTO-RESPONSE] Contraseña enviada automáticamente (Detectado prompt - confianza: 95%)
=== FIN COMANDO (código: 0) ===
```

## 🛠️ Solución de Problemas Comunes

### Error de conexión
```
❌ Error de conexión: connect ECONNREFUSED
```
**Solución**: Verifica host, puerto y conectividad de red.

### Error de autenticación
```
❌ Error de conexión: All configured authentication methods failed
```
**Solución**: Verifica usuario y contraseña en el modo interactivo.

### Host ID no encontrado
```
❌ No se encontró el host con ID "3".
💡 Hay 2 host(s) disponible(s).
```
**Solución**: Usa `node index.mjs list` o el modo interactivo para ver hosts disponibles.

### Comando sudo no responde
El CLI detecta automáticamente prompts de sudo y envía la contraseña, pero si falla:
- Verifica que la contraseña sea correcta
- Algunos comandos pueden necesitar `NOPASSWD` en sudoers

## ⚡ Consejos de Rendimiento

1. **🖱️ Usa el modo interactivo** para una experiencia completa y visual
2. **🧹 Pantallas limpias**: Solo se muestra información relevante
3. **📊 Navegación jerárquica**: Hosts → Procesos → Detalles
4. **💡 Sugerencias inteligentes**: Aprovecha las sugerencias de comandos
5. **🔄 Navegación libre**: Puedes volver atrás en cualquier momento
6. **📋 Organización por hosts**: Agrupa procesos del mismo servidor

## 🎯 Próximos Pasos

- Explora el **[modo interactivo completo](commands.md#modo-interactivo-recomendado)**
- Revisa [ejemplos de navegación](examples.md)
- Configura [opciones avanzadas](configuration.md)
- Lee sobre [solución de problemas](troubleshooting.md)