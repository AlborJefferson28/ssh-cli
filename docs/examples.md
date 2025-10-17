# 💡 Ejemplos de Uso

## 🔗 Ejemplos con Conexiones Paralelas (NUEVO v1.2.0)

### 1. Desarrollo Full-Stack Automático

**Escenario:** Iniciar servidor backend y frontend en paralelo automáticamente

**Ejecutar:** `node index.mjs`

**Proceso de Desarrollo:**
1. Crear proceso con comandos:
   ```bash
   cd /app/backend
   npm install
   npm run dev          # ← Comando de larga duración detectado
   cd /app/frontend
   npm install
   npm start           # ← Otro servidor detectado
   echo "Desarrollo listo"
   ```

2. **Detección Automática:**
   ```
   ✅ Conectado a dev-server.local
   📝 Ejecutando 6 tarea(s)...

     ✅ 1. cd /app/backend
     ✅ 2. npm install
     ⏳ 3. npm run dev

   ⠦ Ejecutando: npm run dev

   ⚠️  Ejecución en primer plano detectada: npm run dev
   📋 Comandos restantes: 3
   ⏰ Auto-selección en 45 segundos...
   ```

3. **Selección Automática de Paralelo:**
   ```
   🔗 Tiempo agotado, ejecutando en modo paralelo automáticamente...

   ✅ Conectado a dev-server.local
   📝 Ejecutando 6 tarea(s)...

     ✅ 1. cd /app/backend
     ✅ 2. npm install
     🔗 3. npm run dev
     ⏳ 4. cd /app/frontend

   ⠦ Ejecutando: cd /app/frontend
   ```

4. **Conexión Paralela Activa:**
   ```
   ✅ Conexión paralela activa
   📝 Ejecutando comandos restantes...

     ✅ 1. cd /app/frontend
     ✅ 2. npm install
     ⏳ 3. npm start

   ⠦ Ejecutando: npm start

   ⚠️  Ejecución en primer plano detectada: npm start
   � Comandos restantes: 1
   ```

5. **Resultado Final:**
   ```
   ✅ Proceso completado exitosamente
   🔗 Conexiones paralelas: 2 activas
   📊 Comandos ejecutados: 6/6
   � Tiempo total: 45 segundos

   Resumen:
     ✅ Backend servidor ejecutándose (puerto 3001)
     ✅ Frontend servidor ejecutándose (puerto 3000)
     ✅ Comandos restantes completados
   ```

### 2. Deployment con Validación por Estado

**Escenario:** Deploy de aplicación con validación automática

**Proceso de Deployment:**
1. Comandos configurados:
   ```bash
   cd /var/www/app
   git pull origin production
   npm run build
   pm2 restart app       # ← Servidor detectado
   nginx -t
   sudo systemctl reload nginx
   ```

2. **Validación por Estado del Proceso:**
   ```
   ✅ Conectado a prod-server.com
   📝 Ejecutando 6 tarea(s)...

     ✅ 1. cd /var/www/app
     ✅ 2. git pull origin production
     ✅ 3. npm run build
     ⏳ 4. pm2 restart app

   ⠦ Ejecutando: pm2 restart app

   🎯 Validando estado del proceso...
   ✅ Proceso detectado: app (PID: 15234)
   ✅ Puerto 3000 respondiendo correctamente
   ✅ Aplicación lista y funcionando
   ```

3. **Interfaz Limpia (Sin Mensajes Invasivos):**
   ```
   # ANTES (v1.1.x) - Mensajes invasivos:
   🔐 Enviando contraseña automáticamente para: sudo systemctl reload nginx
   🔧 Ejecutando comando y entrando en modo debug...
   ⏭️  Comando saltado: nginx -t

   # AHORA (v1.2.0) - Interfaz limpia:
   ✅ Conectado a prod-server.com
   📝 Ejecutando 6 tarea(s)...

     ✅ 4. pm2 restart app
     ✅ 5. nginx -t
     ⏳ 6. sudo systemctl reload nginx

   ⠦ Ejecutando: sudo systemctl reload nginx
   ```

## � Ejemplos con Validación Inteligente

### 3. Detección de Errores Críticos

**Escenario:** Comando falla inmediatamente vs. comando que necesita tiempo

**Comando que falla:**
```bash
invalid-command-that-does-not-exist
```

**Resultado:**
```
❌ Error crítico detectado: command not found
🚨 Fallo inmediato en: invalid-command-that-does-not-exist
⏱️  Tiempo de detección: 0.2 segundos
```

**Comando de servidor:**
```bash
npm run dev
```

**Resultado:**
```
⠦ Ejecutando: npm run dev
🎯 Validando por estado del proceso...
⏱️  Tiempo de validación: 30 segundos
✅ Servidor detectado y validado como activo
🔗 Listo para conexión paralela
```

## 🧹 Ejemplos de Interfaz Limpia

### 4. Comparación de Interfaces

**ANTES (v1.1.x) - Interfaz con ruido:**
```
� Enviando contraseña automáticamente para: sudo apt update
✅ Conectado a server.com
🔐 Detectado prompt sudo (confianza: 95%)
📝 Ejecutando 3 tarea(s)...
� [DEBUG MODE] Detectado prompt de contraseña
⏭️  Comando saltado: optional-command
🔧 Ejecutando comando y entrando en modo debug...
  ✅ 1. sudo apt update
  ⏳ 2. npm install
  ⏳ 3. npm start
[STDERR] npm WARN deprecated package@1.0.0
🔐 Contraseña enviada automáticamente (Formato típico - )
⠦ Ejecutando: npm install
```

**AHORA (v1.2.0) - Interfaz ultra-limpia:**
```
✅ Conectado a server.com
📝 Ejecutando 3 tarea(s)...

  ✅ 1. sudo apt update
  ⏳ 2. npm install
  ⏳ 3. npm start

⠦ Ejecutando: npm install
```

**Logs detallados (solo en archivos):**
```bash
# logs/ssh-log-1234567890.txt
[AUTO-RESPONSE] Contraseña enviada automáticamente (Detectado prompt sudo - )
=== COMANDO: sudo apt update ===
DIRECTORIO ACTUAL: /home/user
COMANDO EJECUTADO: cd /home/user && sudo apt update
[sudo] password for user: 
Reading package lists... Done
=== FIN COMANDO (código: 0) ===
```

## 📊 Ejemplos con Modo Debug

### 5. Deployment con Error y Debug

**Escenario:** Un proceso de deployment falla en medio de la ejecución

**Ejecutar:** `node index.mjs`

**Proceso de Deployment:**
1. Crear proceso con comandos:
   ```bash
   cd /var/www/app
   git pull origin main
   npm install
   sudo systemctl restart nginx  # ← Este comando falla
   sudo systemctl status nginx
   ```

2. **Error Detectado (Interfaz Limpia):**
   ```
   ❌ Error detectado en comando: sudo systemctl restart nginx
   🔧 Código de salida: 1

   � ¿Cómo deseas proceder?
     > � Entrar en modo debug
       ⏭️  Saltar este comando y continuar
       🚪 Finalizar proceso
   ```

3. **Modo Debug Activo:**
   ```
       🚪 Finalizar conexión completamente
   ```

4. **Diagnóstico en Debug:**
   ```bash
   🔧 Comando debug: nginx -t
   
   # Output:
   nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)
   nginx: configuration file /etc/nginx/nginx.conf test failed
   
   🔧 Comando debug: sudo lsof -i :80
   
   # Output:
   apache2   1234 www-data    4u  IPv6  0x123456      0t0  TCP *:http (LISTEN)
   ```

5. **Solución del Problema:**
   ```bash
   🔧 Comando debug: sudo systemctl stop apache2
   🔧 Comando debug: sudo systemctl restart nginx
   🔧 Comando debug: sudo systemctl status nginx
   
   # Output: ● nginx.service - A high performance web server
   #         Active: active (running) since...
   ```

6. **Opciones Post-Debug:**
   ```
   🔄 Salir del modo debug (volver al proceso)
   
   ╔═════════════════════════════════════════════════════════════╗
   ║             🔄 OPCIONES POST-DEBUG                      ║
   ╚═════════════════════════════════════════════════════════════╝
   📝 Proceso: Deployment Producción
   📊 Progreso: 3/5 comandos
   ⚠️  Error en comando: sudo systemctl restart nginx
   📋 Comandos restantes: 2
   
   🔄 ¿Cómo deseas continuar?
     > ▶️  Continuar desde el comando que falló
       ⏭️  Saltar comando fallido y continuar
       🔄 Reiniciar proceso desde el inicio
       🚪 Finalizar proceso completamente
   ```

### 2. Troubleshooting de Base de Datos

**Escenario:** Un script de migración de base de datos falla

**Comandos del Proceso:**
```bash
cd /opt/migrations
sudo systemctl status mysql
mysql -u root -p < migration-001.sql  # ← Falla aquí
mysql -u root -p < migration-002.sql
sudo systemctl restart app-backend
```

**Debug Interactivo:**
```bash
🔧 Comando debug: mysql -u root -p -e "SHOW DATABASES;"
# Error: Access denied for user 'root'@'localhost'

🔧 Comando debug: sudo mysql -e "SHOW DATABASES;"
# ✅ Funciona con sudo

🔧 Comando debug: sudo mysql -e "SELECT User, Host FROM mysql.user WHERE User='root';"
# ✅ Identifica problema de autenticación
```

**Solución aplicada en debug:**
```bash
🔧 Comando debug: sudo mysql < migration-001.sql
🔧 Comando debug: sudo mysql < migration-002.sql
# ✅ Migraciones aplicadas correctamente
```

## �🖱️ Ejemplos en Modo Interactivo (Recomendado)

### 1. Deploy Automático Comando 11: sudo systemctl status redis
```

### 2.1. Agregar Proceso a Host Existente

**Escenario:** Agregar un nuevo proceso al "Servidor Monitor" ya existente

**Ejecutar:** `node index.mjs`

**Navegación:**
1. Seleccionar: **🚀 Crear nuevo proceso SSH**
2. **Detección de Host Existente:**
   ```
   🌐 Host remoto: servidor-monitor.empresa.com
   
   ✅ Host encontrado: Servidor Monitor (servidor-monitor.empresa.com)
   📊 Procesos existentes para este host: 1
   🔌 Puerto SSH (actual: 22): [22]
   👤 Usuario SSH (actual: admin): [admin]
   🔐 Contraseña: ********
   ```

3. **Pantalla de Comandos con Contexto:**
   ```
   🏠 Host: Servidor Monitor
   🌐 Servidor: servidor-monitor.empresa.com:22
   👤 Usuario: admin
   📊 Procesos existentes: 1
   
   📋 Agrega comandos a ejecutar:
   ⚙️  Comando 1: sudo systemctl list-units --failed
   ➕ ¿Quieres agregar otro comando? Yes
   ⚙️  Comando 2: journalctl -f --lines=20
   ➕ ¿Quieres agregar otro comando? No
   ```

4. **Pantalla de Guardado:**
   ```
   🏠 Host: Servidor Monitor
   🌐 Servidor: servidor-monitor.empresa.com:22
   👤 Usuario: admin
   📋 Comandos configurados: 2
   📊 Procesos existentes en este host: 1
   
   ¿Deseas guardar este proceso SSH para uso futuro? Yes
   Nombre para este proceso SSH: Check System Errors
   ```

**Resultado:** El nuevo proceso se agrega automáticamente al host "Servidor Monitor" existente.

**Navegación posterior:**plicación Web

**Ejecutar:** `node index.mjs`

**Navegación Interactiva con Detección Inteligente:**
1. Seleccionar: **🚀 Crear nuevo proceso SSH**
2. **Pantalla de Configuración (Flujo Inteligente):**
   ```
   � Host remoto: servidor-prod.empresa.com
   
   � Host nuevo detectado: servidor-prod.empresa.com
   🏷️  Nombre del Host: Servidor Producción
   🔌 Puerto SSH: 22
   👤 Usuario SSH: deploy
   🔐 Contraseña: ********
   ```

3. **Pantalla de Comandos:**
   ```
   🏠 Host: Servidor Producción
   🌐 Servidor: servidor-prod.empresa.com:22
   👤 Usuario: deploy
   
   📋 Agrega comandos a ejecutar:
   ⚙️  Comando 1: cd /var/www/mi-aplicacion
   ➕ ¿Quieres agregar otro comando? Yes
   ⚙️  Comando 2: git pull origin main
   ➕ ¿Quieres agregar otro comando? Yes
   ⚙️  Comando 3: npm install --production
   ➕ ¿Quieres agregar otro comando? Yes
   ⚙️  Comando 4: npm run build
   ➕ ¿Quieres agregar otro comando? Yes
   ⚙️  Comando 5: sudo systemctl restart nginx
   ➕ ¿Quieres agregar otro comando? Yes
   ⚙️  Comando 6: sudo systemctl restart mi-aplicacion
   ➕ ¿Quieres agregar otro comando? Yes
   ⚙️  Comando 7: sudo systemctl status mi-aplicacion
   ➕ ¿Quieres agregar otro comando? No
   ```

4. **Pantalla de Guardado:**
   ```
   🏠 Host: Servidor Producción
   🌐 Servidor: servidor-prod.empresa.com:22
   👤 Usuario: deploy
   📋 Comandos configurados: 7
   
   ¿Deseas guardar este proceso SSH para uso futuro? Yes
   Nombre para este proceso SSH: Deploy Aplicación Web
   ```

5. **Confirmación y Ejecución:**
   ```
   🚀 ¿Ejecutar ahora? Yes
   ```

**Reutilización:**
- **Navegación:** `node index.mjs` → "📋 Navegar procesos SSH por host" → "Servidor Producción" → "Deploy Aplicación Web" → "🚀 Ejecutar"
- **CLI:** `node index.mjs start -h 1 -p 1`

### 2. Monitoreo de Sistema Interactivo

**Ejecutar:** `node index.mjs`

**Configuración del Proceso con Detección Inteligente:**
```
🌐 Host remoto: servidor-monitor.empresa.com

🆕 Host nuevo detectado: servidor-monitor.empresa.com
🏷️  Nombre del Host: Servidor Monitor
🔌 Puerto SSH: 22
👤 Usuario SSH: admin
🔐 Contraseña: ********
```

**Comandos mediante Wizard:**
```
🏠 Host: Servidor Monitor
🌐 Servidor: servidor-monitor.empresa.com:22
👤 Usuario: admin

📋 CONFIGURAR COMANDOS SSH

Comando 1: echo "=== INFORMACIÓN DEL SISTEMA ==="
Comando 2: uname -a
Comando 3: echo "=== USO DE DISCO ==="
Comando 4: df -h
Comando 5: echo "=== USO DE MEMORIA ==="
Comando 6: free -m
Comando 7: echo "=== PROCESOS TOP ==="
Comando 8: top -bn1 | head -15
Comando 9: echo "=== SERVICIOS CRÍTICOS ==="
Comando 10: sudo systemctl status nginx
Comando 11: sudo systemctl status mysql
Comando 12: sudo systemctl status redis
```

**Navegación posterior:**
```
📋 Procesos SSH Guardados (Agrupados por Host)
═══════════════════════════════════════════════════════
🏠 HOST ID: 1 | NOMBRE: Servidor Producción
📊 Total de procesos: 1
    1. Deploy Aplicación Web

🏠 HOST ID: 2 | NOMBRE: Servidor Monitor
📊 Total de procesos: 2
    1. Monitoreo Sistema Completo
    2. Check System Errors
```

### 3. Gestión Multi-Host con Navegación Visual

**Escenario:** Varios servidores con múltiples procesos cada uno

**Host 1: Servidor Producción**
- Deploy Frontend
- Deploy Backend  
- Backup Database
- Restart Services

**Host 2: Servidor Testing**
- Run Test Suite
- Performance Test
- Deploy Staging

**Host 3: Servidor Desarrollo**
- Git Sync
- Database Seed
- Start Dev Server

**Navegación visual resultante:**
```
📋 Procesos SSH Guardados (Agrupados por Host)
═══════════════════════════════════════════════════════
🏠 HOST ID: 1 | NOMBRE: Servidor Producción  
📊 Total de procesos: 4
    1. Deploy Frontend
    2. Deploy Backend
    3. Backup Database
    4. Restart Services

🏠 HOST ID: 2 | NOMBRE: Servidor Testing
📊 Total de procesos: 3
    1. Run Test Suite
    2. Performance Test
    3. Deploy Staging

🏠 HOST ID: 3 | NOMBRE: Servidor Desarrollo
📊 Total de procesos: 3
    1. Git Sync
    2. Database Seed
    3. Start Dev Server

? ¿Qué host deseas navegar?
> 🏠 Servidor Producción (4 procesos)
  🏠 Servidor Testing (3 procesos)
  🏠 Servidor Desarrollo (3 procesos)
  🚪 Volver al menú principal
```

**Navegación en Host específico:**
```
🏠 Host: Servidor Producción
📊 Procesos disponibles: 4
──────────────────────────────────────────────────

? 📋 Selecciona un proceso de "Servidor Producción":
> 📝 Deploy Frontend (5 comandos)
  📝 Deploy Backend (7 comandos)
  📝 Backup Database (4 comandos)
  📝 Restart Services (3 comandos)
  ⬅️  Volver a la lista de hosts
```

### 4. Eliminación Segura con Confirmación Visual

**Ejecutar:** `node index.mjs`

**Navegación:**
1. Seleccionar: **🗑️ Eliminar proceso**
2. **Lista de procesos:**
   ```
   ? 🗑️  Selecciona el proceso a eliminar:
   > 📝 Deploy Frontend - 🏠 Servidor Producción (servidor-prod.com)
     📝 Test Old Process - 🏠 Servidor Testing (test.empresa.com)
     📝 Backup Database - 🏠 Servidor Producción (servidor-prod.com)
     ❌ Cancelar
   ```

3. **Confirmación visual:**
   ```
   ╔═════════════════════════════════════════════════════════════╗
   ║                                                    
   ║               ⚠️  PROCESO A ELIMINAR                       
   ║                                                    
   ╚═════════════════════════════════════════════════════════════╝
   
   ⚠️  Estás a punto de eliminar:
   ┌─ Proceso a eliminar ──────────────────────────────────────┐
   │ 📝 Nombre: Test Old Process                               │
   │ 🏠 Host: Servidor Testing                                 │
   │ 🌐 Servidor: test.empresa.com:22                          │
   │ 👤 Usuario: tester                                        │
   │ ⚙️  Comandos: 3 comando(s)                                │
   └────────────────────────────────────────────────────────────┘
   
   ? ⚠️  ¿Estás seguro de que deseas eliminar este proceso? No
   ```

4. **Resultado:**
   ```
   ╔═════════════════════════════════════════════════════════════╗
   ║                                                    
   ║               ❌ ELIMINACIÓN CANCELADA                      
   ║                                                    
   ╚═════════════════════════════════════════════════════════════╝
   
   El proceso no fue eliminado.
   ```

### 5. Estadísticas Visuales en Modo Interactivo

**Ejecutar:** `node index.mjs` → **📊 Ver estadísticas**

**Resultado:**
```
📊 Estadísticas de Procesos SSH
══════════════════════════════════════════════════════
📝 Total de procesos: 10
🏠 Hosts únicos: 3
⚙️  Total de comandos: 47
📊 Promedio de comandos por proceso: 4.7

📋 Desglose por host:
  🏠 Servidor Producción
     📝 Procesos: 4
     ⚙️  Comandos: 22
     🌐 Servidores: servidor-prod.empresa.com:22

  🏠 Servidor Testing
     📝 Procesos: 3
     ⚙️  Comandos: 14
     🌐 Servidores: test.empresa.com:22

  🏠 Servidor Desarrollo
     📝 Procesos: 3
     ⚙️  Comandos: 11
     🌐 Servidores: dev.empresa.com:22

──────────────────────────────────────────────────────────────
Presiona Enter para continuar...
```

---

## 🔧 Ejemplos en Modo CLI Tradicional

### 1. Deploy con Nuevo Sistema de Selección

**Listar procesos agrupados:**
```bash
node index.mjs list
```

**Salida:**
```
📋 Procesos SSH Guardados (Agrupados por Host)
═══════════════════════════════════════════════════════
🏠 HOST ID: 1 | NOMBRE: Servidor Producción
📊 Total de procesos: 2
    1. Deploy Frontend
    2. Deploy Backend

💡 Uso: ssh-cli start -h <host_id> -p <posición> para ejecutar un proceso
```

**Ejecutar proceso específico:**
```bash
# Ejecutar "Deploy Frontend" (Host ID 1, posición 1)
node index.mjs start -h 1 -p 1

# Ejecutar "Deploy Backend" (Host ID 1, posición 2)  
node index.mjs start -h 1 -p 2
```

### 2. Creación de Proceso con Validaciones

```bash
node index.mjs start
```

**Flujo con validaciones:**
```
╔═════════════════════════════════════════════════════════════╗
║                                                    
║                🚀 CREAR NUEVO PROCESO SSH               
║                                                    
╚═════════════════════════════════════════════════════════════╝

? 🏷️  Nombre del Host: AB
❌ El nombre debe tener al menos 3 caracteres
? 🏷️  Nombre del Host: Mi Servidor Test

? 🌐 Host remoto: servidor@inválido
❌ Formato de host inválido. Usa solo letras, números, puntos y guiones.
? 🌐 Host remoto: test-server.com

? 🔌 Puerto SSH: 99999
❌ Puerto inválido. Debe ser un número entre 1 y 65535.
? 🔌 Puerto SSH: 2222

? 👤 Usuario SSH: 
❌ El usuario es obligatorio
? 👤 Usuario SSH: admin

? 🔐 Contraseña: 
❌ La contraseña es obligatoria
? 🔐 Contraseña: ********
```

### 3. Manejo de Errores de Selección

**Host ID inválido:**
```bash
node index.mjs start -h 5 -p 1
```
```
❌ No se encontró el host con ID "5".
💡 Hay 3 host(s) disponible(s).
💡 Usa 'ssh-cli list' para ver los IDs de host disponibles.
```

**Posición inválida:**
```bash
node index.mjs start -h 1 -p 5
```
```
❌ Posición inválida para el host ID "1" (Servidor Producción).
💡 El host "Servidor Producción" tiene 2 proceso(s).
💡 Usa 'ssh-cli list' para ver las posiciones disponibles.
```

### 4. Comando No Reconocido → Modo Interactivo

```bash
node index.mjs comando-inexistente
```
```
⚠️  Comando 'comando-inexistente' no reconocido.
💡 Iniciando modo interactivo...

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
```

---

## 🔍 Ejemplos de Casos de Uso Específicos

### Desarrollo con Docker

**Configuración interactiva:**
- **Host:** `Servidor Docker`
- **Proceso:** `Deploy Docker App`

**Comandos:**
```bash
cd /var/www/docker-app
git pull origin main
sudo docker-compose down
sudo docker-compose pull
sudo docker-compose up -d
sudo docker ps
sudo docker logs mi-container --tail 20
```

### PHP/Laravel Deployment

**Configuración interactiva:**
- **Host:** `Servidor Laravel`
- **Proceso:** `Deploy Laravel Production`

**Comandos:**
```bash
cd /var/www/laravel-app
git pull origin main
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
sudo systemctl restart php8.1-fpm
sudo systemctl restart nginx
```

### Python/Django Deployment

**Configuración interactiva:**
- **Host:** `Servidor Django`
- **Proceso:** `Deploy Django App`

**Comandos:**
```bash
cd /var/www/django-app
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

---

## 💡 Consejos para Ejemplos Avanzados

### 1. Organización por Propósito
```
🏠 Servidor Producción
    1. Deploy Frontend
    2. Deploy Backend
    3. Deploy API
    4. Backup Database
    5. Restart All Services
    6. Health Check

🏠 Servidor Testing
    1. Deploy Staging
    2. Run Integration Tests
    3. Performance Tests
    4. Security Scan

🏠 Servidor Desarrollo
    1. Sync Development
    2. Reset Database
    3. Start Dev Services
    4. Run Unit Tests
```

### 2. Comandos con Manejo de Errores
```bash
# En lugar de:
git pull origin main

# Usa en el wizard:
git pull origin main || echo "❌ FALLÓ: Git pull"
npm install --production || echo "❌ FALLÓ: npm install"
sudo systemctl restart nginx && echo "✅ ÉXITO: nginx reiniciado" || echo "❌ FALLÓ: nginx restart"
```

### 3. Comandos Informativos
```bash
echo "=== INICIANDO DEPLOY $(date) ==="
echo "Usuario: $(whoami)"
echo "Directorio: $(pwd)"
echo "Branch actual: $(git branch --show-current)"
echo "=== DEPLOY COMPLETADO ==="
```

### 4. Verificaciones Intermedias
```bash
git pull origin main
if [ $? -eq 0 ]; then echo "✅ Git pull exitoso"; else echo "❌ Git pull falló"; exit 1; fi
npm run build
if [ $? -eq 0 ]; then echo "✅ Build exitoso"; else echo "❌ Build falló"; exit 1; fi
```

---

## 🚀 Flujos Completos de Trabajo

### Flujo de Deploy Completo (Modo Interactivo)

1. **Inicio:** `node index.mjs`
2. **Navegación:** 📋 Navegar procesos SSH por host
3. **Selección:** Servidor Producción → Deploy Frontend
4. **Revisión:** Ver comandos y configuración
5. **Ejecución:** 🚀 Ejecutar este proceso
6. **Monitoreo:** Ver progreso en tiempo real
7. **Verificación:** Revisar logs y resultado final

### Flujo de Mantenimiento (Modo CLI)

1. **Lista:** `node index.mjs list`
2. **Selección:** Identificar Host ID y posición
3. **Ejecución:** `node index.mjs start -h 2 -p 3`
4. **Monitoreo:** Seguir progreso automáticamente
5. **Logs:** Revisar archivo de log generado

Todos estos ejemplos aprovechan las nuevas funcionalidades del modo interactivo con navegación visual, validaciones avanzadas, y la organización mejorada por hosts.