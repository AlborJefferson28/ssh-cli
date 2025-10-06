# 🔧 Solución de Problemas

## 🚨 Problemas Comunes del Modo Debug

### Problema: El modo debug no se activa cuando hay errores

**Síntomas:**
- Un comando falla pero no aparece la opción de modo debug
- El proceso se termina inmediatamente después del error
- No se muestra el menú de opciones post-error

**Soluciones:**
```bash
# 1. Verificar que el proceso se está ejecutando en modo interactivo
ssh-cli  # (sin argumentos para modo interactivo)

# 2. Asegúrate de que el comando realmente está fallando
# El modo debug solo se activa con códigos de salida != 0

# 3. Verificar logs para ver si hay errores de conexión
ls -la logs/ssh-log-*.txt | tail -5
```

### Problema: Los atajos de teclado no funcionan en modo debug

**Síntomas:**
- Ctrl+Q, Ctrl+X no responden
- Los atajos no salen del modo debug
- El modo debug se comporta como terminal normal

**Soluciones:**
```bash
# 1. Verificar compatibilidad del terminal
echo $TERM
# Debe mostrar algo como: xterm-256color, screen, etc.

# 2. Si usas tmux/screen, verificar configuración
# Algunos multiplexores interceptan Ctrl+X

# 3. Alternativa: usar Ctrl+C para menú visual
# Ctrl+C siempre mostrará el menú de opciones

# 4. En caso extremo, usar Ctrl+D o cerrar terminal
```

### Problema: El modo debug no muestra el log completo

**Síntomas:**
- Solo aparece la línea de comandos
- No se ve el historial de comandos ejecutados
- Falta información del host/usuario

**Soluciones:**
```bash
# 1. Usar Ctrl+L para refrescar el log
# Esto limpia pantalla y muestra todo el historial

# 2. Verificar tamaño de terminal
# El log se adapta al ancho de terminal (80 caracteres mínimo)

# 3. Si el log es muy largo, se trunca automáticamente
# Usa comandos como 'tail' para ver información específica
```

### Problema: Los comandos debug no funcionan

**Síntomas:**
- Los comandos en modo debug no se ejecutan
- Error "conexión cerrada" durante debug
- Timeout en comandos debug

**Soluciones:**
```bash
# 1. Verificar que la conexión SSH sigue activa
# El modo debug usa la misma conexión que el proceso principal

# 2. Probar comandos simples primero
# En modo debug, empezar con: pwd, ls, whoami

# 3. Si la conexión se perdió, reiniciar el proceso
# El modo debug no puede recuperar conexiones perdidas
```

### Problema: No puedo salir del modo debug

**Síntomas:**
- Las opciones "Salir del modo debug" no funcionan
- Quedo atrapado en el loop de debug
- El CLI no responde

**Soluciones:**
```bash
# 1. Usar Ctrl+C para forzar salida del CLI
# Esto cerrará toda la aplicación

# 2. En modo debug, elegir "Finalizar conexión"
# Esto terminará el proceso completamente

# 3. Reiniciar terminal si es necesario
```

## 🚨 Problemas Comunes del Modo Interactivo

### Problema: El modo interactivo no se muestra correctamente

**Síntomas:**
- Los menús no aparecen con formato visual
- Texto desordenado o caracteres raros
- Las opciones no son seleccionables

**Soluciones:**
```bash
# 1. Verificar que inquirer.js esté instalado
npm list inquirer

# 2. Si no está instalado, reinstalar dependencias
npm install

# 3. Verificar compatibilidad de terminal
echo $TERM

# 4. Si usas Windows, usar PowerShell o Git Bash
# 5. Limpiar terminal y reintentar
clear && node index.mjs
```

### Problema: La navegación por hosts no funciona

**Síntomas:**
- Error "No se encontró el host con ID X"
- La lista de hosts aparece vacía
- Los procesos no se agrupan por host

**Soluciones:**
```bash
# 1. Verificar que existen procesos guardados
node index.mjs list

# 2. Verificar la estructura del archivo de procesos
cat process/ssh-processes.json | grep -A 5 -B 5 "hostName"

# 3. Si el archivo está corrupto, hacer backup y recrear
cp process/ssh-processes.json process/ssh-processes.json.backup
echo "[]" > process/ssh-processes.json

# 4. Recrear procesos con el nuevo formato interactivo
node index.mjs
```

### Problema: Los comandos visuales no se ejecutan

**Síntomas:**
- El wizard de comandos no aparece
- No se pueden agregar múltiples comandos
- Los comandos no se guardan correctamente

**Soluciones:**
```bash
# 1. Verificar permisos en el directorio process
ls -la process/

# 2. Crear directorio si no existe
mkdir -p process

# 3. Verificar que el archivo JSON es válido
node -e "console.log(JSON.parse(require('fs').readFileSync('process/ssh-processes.json', 'utf8')))"

# 4. Si hay error de sintaxis JSON, reparar:
cp process/ssh-processes.json process/backup.json
echo "[]" > process/ssh-processes.json
```

### Problema: La pantalla no se limpia correctamente

**Síntomas:**
- El `console.clear()` no funciona
- Los menús se superponen
- Texto anterior permanece visible

**Soluciones:**
```bash
# En Linux/macOS:
export TERM=xterm-256color

# En Windows PowerShell:
$env:TERM = "xterm-256color"

# Alternativa manual:
clear && node index.mjs

# Si persiste, desactivar clear (editar index.mjs):
# Comentar líneas que contengan console.clear()
```

### Problema: La detección de hosts existentes no funciona

**Síntomas:**
- Hosts existentes siempre se tratan como nuevos
- Se solicita nombre de host para hosts ya registrados
- No se pre-completan puerto y usuario para hosts conocidos

**Soluciones:**
```bash
# 1. Verificar que el host coincide exactamente
# El sistema busca por coincidencia exacta del campo 'host'
cat process/ssh-processes.json | grep -A 3 -B 3 "host.*:"

# 2. Verificar formato del host en archivo de procesos
# Debe ser: "host": "servidor.ejemplo.com"
# No: "host": " servidor.ejemplo.com " (espacios)

# 3. Si hay inconsistencias, limpiar manualmente
# Buscar y corregir hosts con espacios extra o formatos incorrectos
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('process/ssh-processes.json'));
data.forEach(p => p.config.host = p.config.host.trim());
fs.writeFileSync('process/ssh-processes.json', JSON.stringify(data, null, 2));
console.log('Hosts limpiados');
"

# 4. Verificar que todos los procesos tienen hostName
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('process/ssh-processes.json'));
console.log('Procesos sin hostName:', data.filter(p => !p.config.hostName).length);
"
```

### Problema: Los valores por defecto no se muestran correctamente

**Síntomas:**
- Para hosts existentes no aparecen valores sugeridos
- Los inputs aparecen vacíos aunque el host exista
- El puerto y usuario no se pre-completan

**Soluciones:**
```bash
# 1. Verificar la estructura de datos en el archivo de procesos
cat process/ssh-processes.json | jq '.[0].config'

# 2. Asegurar que los campos existen y tienen valores válidos
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('process/ssh-processes.json'));
console.log('Estructura de config del primer proceso:');
console.log(JSON.stringify(data[0]?.config, null, 2));
"

# 3. Si faltan campos, agregar valores por defecto
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('process/ssh-processes.json'));
data.forEach(p => {
  if (!p.config.port) p.config.port = '22';
  if (!p.config.hostName) p.config.hostName = 'Sin nombre';
});
fs.writeFileSync('process/ssh-processes.json', JSON.stringify(data, null, 2));
console.log('Campos faltantes agregados');
"
```

### Problema: La pantalla no se limpia correctamente
```

---

## 🔌 Problemas de Conexión SSH

### Error: "Host key verification failed"

**Síntomas:**
```
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@    WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!     @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
```

**Soluciones:**
```bash
# 1. Eliminar la clave antigua del known_hosts
ssh-keygen -R servidor.ejemplo.com

# 2. Conectar manualmente para aceptar nueva clave
ssh usuario@servidor.ejemplo.com

# 3. Luego usar ssh-cli normalmente
node index.mjs
```

### Error: "Connection refused" o "No route to host"

**Síntomas:**
```
Error: connect ECONNREFUSED 192.168.1.100:22
Error: connect EHOSTUNREACH 192.168.1.100:22
```

**Soluciones:**
```bash
# 1. Verificar conectividad básica
ping servidor.ejemplo.com

# 2. Verificar que SSH está corriendo
telnet servidor.ejemplo.com 22

# 3. Verificar firewall local
sudo ufw status  # Ubuntu
sudo iptables -L  # Otras distros

# 4. Verificar DNS
nslookup servidor.ejemplo.com

# 5. Probar con IP directa
node index.mjs start
# Usar IP en lugar de nombre de host
```

### Error: "Authentication failed"

**Síntomas:**
```
Error: All configured authentication methods failed
Error: Authentication failed
```

**Soluciones:**
```bash
# 1. Verificar credenciales manualmente
ssh usuario@servidor.ejemplo.com

# 2. Si funciona manual, revisar el proceso guardado:
node index.mjs list
# Verificar que el usuario es correcto

# 3. Recrear el proceso con credenciales correctas
node index.mjs
# Seleccionar "Crear nuevo proceso SSH"

# 4. Para problemas de clave SSH:
ssh-copy-id usuario@servidor.ejemplo.com
```

### Error: "Permission denied (publickey)"

**Síntomas:**
```
Error: Permission denied (publickey)
```

**Soluciones:**
```bash
# 1. Verificar si el servidor acepta password
ssh -o PreferredAuthentications=password usuario@servidor.ejemplo.com

# 2. Generar clave SSH si no existe
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"

# 3. Copiar clave al servidor
ssh-copy-id usuario@servidor.ejemplo.com

# 4. Si ssh-cli sigue fallando, verificar configuración SSH local
cat ~/.ssh/config
```

---

## 💾 Problemas de Archivos y Permisos

### Error: "Cannot read property 'length' of undefined"

**Síntomas:**
```
TypeError: Cannot read property 'length' of undefined
    at showInteractiveHostNavigation
```

**Soluciones:**
```bash
# 1. Verificar que el archivo JSON existe y es válido
ls -la process/ssh-processes.json

# 2. Si no existe, crearlo
mkdir -p process
echo "[]" > process/ssh-processes.json

# 3. Si existe pero está corrupto, validar JSON
node -e "JSON.parse(require('fs').readFileSync('process/ssh-processes.json'))"

# 4. Si está corrupto, restaurar desde backup o recrear
mv process/ssh-processes.json process/corrupted.json
echo "[]" > process/ssh-processes.json
```

### Error: "ENOENT: no such file or directory"

**Síntomas:**
```
Error: ENOENT: no such file or directory, open 'process/ssh-processes.json'
```

**Soluciones:**
```bash
# 1. Crear estructura de directorios
mkdir -p process
mkdir -p logs

# 2. Crear archivo de procesos inicial
echo "[]" > process/ssh-processes.json

# 3. Verificar permisos
chmod 755 process
chmod 644 process/ssh-processes.json

# 4. Si persiste, verificar el directorio de trabajo
pwd
ls -la
```

### Error: "EACCES: permission denied"

**Síntomas:**
```
Error: EACCES: permission denied, open 'process/ssh-processes.json'
```

**Soluciones:**
```bash
# 1. Verificar permisos actuales
ls -la process/

# 2. Corregir permisos
chmod 755 process
chmod 644 process/ssh-processes.json

# 3. Si ejecutas como sudo, cambiar propietario
sudo chown $USER:$USER process/ssh-processes.json

# 4. Verificar espacio en disco
df -h
```

---

## 🖥️ Problemas de Dependencias

### Error: "Module 'inquirer' not found"

**Síntomas:**
```
Error: Cannot find module 'inquirer'
```

**Soluciones:**
```bash
# 1. Instalar inquirer específicamente
npm install inquirer

# 2. Verificar package.json
cat package.json | grep inquirer

# 3. Reinstalar todas las dependencias
rm -rf node_modules
npm install

# 4. Verificar versión de Node.js
node --version
# Debe ser >= 14.0.0
```

### Error: "Module 'ssh2' not found"

**Síntomas:**
```
Error: Cannot find module 'ssh2'
```

**Soluciones:**
```bash
# 1. Instalar ssh2
npm install ssh2

# 2. Para problemas de compilación en sistemas antiguos
sudo apt update
sudo apt install build-essential python3

# 3. En macOS con problemas de compilación
xcode-select --install

# 4. En Windows
npm install --global windows-build-tools
```

### Error: Versiones incompatibles

**Síntomas:**
```
Warning: Deprecated features
Error: Module incompatibility
```

**Soluciones:**
```bash
# 1. Verificar versiones compatibles
npm list

# 2. Actualizar a versiones específicas
npm install ssh2@latest inquirer@latest

# 3. Si hay conflictos, usar versiones específicas
npm install ssh2@1.11.0 inquirer@8.2.4

# 4. Limpiar cache de npm
npm cache clean --force
```

---

## 🐛 Problemas de Funcionamiento

### Problema: Los procesos no se ejecutan en el orden correcto

**Síntomas:**
- Los comandos se ejecutan desordenados
- Algunos comandos no se ejecutan
- La secuencia se interrumpe

**Soluciones:**
```bash
# 1. Verificar que los comandos están guardados correctamente
node index.mjs list
# Revisar el orden en la salida

# 2. Recrear el proceso con comandos ordenados
node index.mjs
# Usar el wizard interactivo para agregar comandos en orden

# 3. Para comandos que requieren tiempo, agregar pausas
echo "Iniciando comando..."
sleep 2
comando_principal
sleep 1
echo "Comando completado"
```

### Problema: Los logs no se generan

**Síntomas:**
- No aparecen archivos en la carpeta `logs/`
- Los comandos se ejecutan pero sin registro

**Soluciones:**
```bash
# 1. Crear directorio de logs si no existe
mkdir -p logs

# 2. Verificar permisos de escritura
ls -la logs/
chmod 755 logs

# 3. Ejecutar un proceso de prueba
node index.mjs
# Crear un proceso simple y ejecutarlo

# 4. Verificar que se cree el archivo de log
ls -la logs/
```

### Problema: Errores de escape de caracteres

**Síntomas:**
- Comandos con comillas no funcionan
- Variables no se expanden correctamente
- Caracteres especiales causan errores

**Soluciones:**
```bash
# 1. Para comandos con comillas, usar escape
echo "Mensaje con \"comillas\" internas"

# 2. Para variables, usar sintaxis correcta
echo "Usuario actual: $(whoami)"

# 3. Para comandos complejos, usar scripts separados
echo "#!/bin/bash" > /tmp/mi_script.sh
echo "comando complejo aquí" >> /tmp/mi_script.sh
chmod +x /tmp/mi_script.sh
/tmp/mi_script.sh
```

---

## 🔄 Migración de Versiones Anteriores

### Migrar procesos del formato antiguo

**Si tienes procesos guardados en formato anterior:**

```bash
# 1. Hacer backup del archivo actual
cp process/ssh-processes.json process/ssh-processes-old.json

# 2. El nuevo sistema es compatible con procesos antiguos
# Los procesos sin hostName se asignarán automáticamente

# 3. Para mejorar la organización, recrear procesos importantes:
node index.mjs
# Usar el modo interactivo para recrear con hostName

# 4. Verificar la migración
node index.mjs list
```

### Actualizar desde CLI puro a modo interactivo

```bash
# 1. La herramienta mantiene compatibilidad total con CLI
node index.mjs list      # Sigue funcionando
node index.mjs start -h 1 -p 1  # Sigue funcionando

# 2. Para aprovechar nuevas funcionalidades
node index.mjs  # Usar modo interactivo

# 3. Los procesos existentes funcionan con ambos modos
```

---

## 🔍 Problemas de Detección de Contraseñas

### Detección falsa de prompts

**Síntomas:**
```
🔐 Detectado prompt (confianza: 85%) - Enviando contraseña automáticamente
```

**Soluciones:**
```bash
# 1. Revisar el output del comando en logs
cat logs/ssh-log-*.txt

# 2. Para comandos que no requieren sudo, evitar patrones:
echo "Password:" # En lugar de comandos que muestren esta palabra

# 3. Usar comandos más específicos
systemctl status nginx  # En lugar de sudo si no es necesario
```

### El CLI no detecta prompts de sudo

**Síntomas:**
```bash
# Comando esperando indefinidamente
🔄 Ejecutando: sudo systemctl restart nginx...
```

**Soluciones:**
```bash
# 1. Usar NOPASSWD en sudoers (más seguro para automatización)
echo "[usuario] ALL=(ALL) NOPASSWD: /bin/systemctl" | sudo tee -a /etc/sudoers

# 2. Verificar que el patrón de sudo es estándar
sudo -S systemctl restart nginx  # Fuerza lectura desde stdin

# 3. Agregar timeout manual
timeout 10 sudo systemctl restart nginx
```

---

## 🔧 Problemas Específicos de la Nueva Interfaz

### Problema: Los banners visuales no se muestran

**Síntomas:**
- No aparecen los marcos decorativos
- El texto se ve plano sin formato

**Soluciones:**
```bash
# 1. Verificar compatibilidad de caracteres Unicode
echo "╔═══╗"
echo "║ ✅ ║"
echo "╚═══╝"

# 2. Si no se muestran correctamente, verificar codificación
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# 3. En Windows, usar terminal compatible:
# - Windows Terminal (recomendado)
# - PowerShell Core
# - Git Bash
```

### Problema: Los emojis no se muestran

**Síntomas:**
- Los íconos aparecen como cuadrados o símbolos raros
- El menú se ve desordenado

**Soluciones:**
```bash
# 1. Verificar soporte de emojis en terminal
echo "🚀 📋 🏠 ⚙️ 🔐"

# 2. Instalar fuentes con soporte emoji:
# Linux: sudo apt install fonts-noto-color-emoji
# macOS: Las fuentes del sistema ya incluyen emojis
# Windows: Usar Windows Terminal con fuentes actualizadas

# 3. Si persiste, usar terminal alternativo o versión sin emojis
```

### Problema: La selección con inquirer no funciona

**Síntomas:**
- Las flechas no mueven la selección
- No se puede seleccionar opciones
- Enter no confirma selección

**Soluciones:**
```bash
# 1. Verificar que inquirer está instalado correctamente
npm list inquirer

# 2. Probar inquirer básico
node -e "
const inquirer = require('inquirer');
inquirer.prompt([{
  type: 'list',
  name: 'test',
  message: 'Test:',
  choices: ['A', 'B']
}]).then(a => console.log(a));
"

# 3. Si falla, reinstalar inquirer
npm uninstall inquirer
npm install inquirer@latest

# 4. Verificar compatibilidad de terminal
echo "Terminal: $TERM"
```

---

## 📞 Obtener Ayuda Adicional

### Información de debugging

```bash
# 1. Verificar información del sistema
node --version
npm --version
echo $SHELL
echo $TERM

# 2. Verificar estructura de archivos
find . -name "*.json" -o -name "*.mjs" | head -10

# 3. Verificar dependencias
npm list --depth=0

# 4. Generar log de debug con modo interactivo
DEBUG=ssh-cli* node index.mjs 2>&1 | tee debug.log
```

### Crear un reporte de error

```bash
# 1. Recopilar información del sistema
{
  echo "=== INFORMACIÓN DEL SISTEMA ==="
  uname -a
  echo "=== VERSIÓN NODE.JS ==="
  node --version
  echo "=== VERSIÓN NPM ==="
  npm --version
  echo "=== TERMINAL ==="
  echo "TERM: $TERM"
  echo "SHELL: $SHELL"
  echo "=== DEPENDENCIAS ==="
  npm list
  echo "=== ESTRUCTURA ARCHIVOS ==="
  ls -la
  echo "=== CONTENIDO PROCESSES ==="
  cat process/ssh-processes.json
  echo "=== TEST INQUIRER ==="
  node -e "console.log('inquirer:', require('inquirer') ? 'OK' : 'FAIL')" || echo "FAIL"
  echo "=== TEST EMOJIS ==="
  echo "🚀 📋 🏠 ⚙️ 🔐"
} > error-report.txt

# 2. Ejecutar con debug y capturar error
node index.mjs 2>&1 | tee -a error-report.txt
```

### Reinstalación completa

```bash
# Si nada funciona, reinstalación limpia:

# 1. Backup de procesos
cp process/ssh-processes.json ~/ssh-processes-backup.json

# 2. Limpiar instalación
rm -rf node_modules
rm package-lock.json

# 3. Reinstalar
npm install

# 4. Verificar dependencias críticas
npm list inquirer ssh2

# 5. Restaurar procesos
cp ~/ssh-processes-backup.json process/ssh-processes.json

# 6. Probar modo interactivo
node index.mjs
```

## 💡 Consejos Preventivos

1. **Hacer backups regulares** del archivo `process/ssh-processes.json`
2. **Probar procesos** en un servidor de pruebas antes de producción  
3. **Usar nombres descriptivos** para hosts y procesos en modo interactivo
4. **Revisar logs** regularmente en la carpeta `logs/`
5. **Mantener dependencias actualizadas** con `npm update`
6. **Usar terminales compatibles** con Unicode y emojis para mejor experiencia
7. **Verificar conectividad SSH manual** antes de crear procesos automatizados

## 🚨 Casos Especiales del Modo Interactivo

### Servidores con múltiples procesos por host

**Si un host tiene muchos procesos:**
```bash
# La navegación visual ayuda a organizar:
🏠 HOST ID: 1 | NOMBRE: Servidor Producción
📊 Total de procesos: 15
    1. Deploy Frontend
    2. Deploy Backend
    3. Deploy API
    # ... más procesos
    
# Usar nombres descriptivos para facilitar selección
```

### Migración masiva de procesos

**Para organizar procesos existentes por hosts:**
```bash
# 1. Listar procesos actuales
node index.mjs list

# 2. Recrear procesos importantes con organización por host
node index.mjs  # Modo interactivo
# Usar nombres de host consistentes

# 3. Eliminar procesos duplicados o desorganizados
node index.mjs  # Seleccionar "Eliminar proceso"
```

### Casos Especiales del Flujo de Configuración Inteligente

**Caso 1: Host con diferentes puertos**
```bash
# Si el mismo host usa diferentes puertos (ej: SSH en 2222)
🌐 Host remoto: servidor.ejemplo.com

✅ Host encontrado: Mi Servidor (servidor.ejemplo.com)
📊 Procesos existentes para este host: 2
🔌 Puerto SSH (actual: 22): 2222  # Cambiar a puerto diferente
```

**Caso 2: Host con diferentes usuarios**
```bash
# Para usar un usuario diferente en el mismo host
🌐 Host remoto: servidor.ejemplo.com

✅ Host encontrado: Mi Servidor (servidor.ejemplo.com)
📊 Procesos existentes para este host: 3
🔌 Puerto SSH (actual: 22): [22]
👤 Usuario SSH (actual: admin): root  # Cambiar usuario
```

**Caso 3: Hosts similares pero diferentes**
```bash
# Cuidado con hosts similares:
servidor.ejemplo.com     # Existente
servidora.ejemplo.com    # Nuevo (será tratado como nuevo)
servidor.ejemplo.com.mx  # Nuevo (será tratado como nuevo)
```

**Caso 4: Migración de formato antiguo**
```bash
# Si tienes procesos del formato anterior sin hostName:
# El sistema los manejará pero sin detección inteligente
# Recomendación: recrear procesos importantes con el nuevo flujo
```

### Solución de problemas de CLI vs Interactivo

**Si el modo CLI funciona pero el interactivo no:**
```bash
# 1. Verificar que ambos modos acceden al mismo archivo
node index.mjs list          # CLI mode
node index.mjs               # Interactive mode → Ver estadísticas

# 2. Los datos deben ser consistentes entre ambos modos
# 3. Si hay inconsistencias, recrear procesos en modo interactivo
```

Si ninguna solución funciona, crear un issue en el repositorio con el archivo `error-report.txt` generado anteriormente.

## 🚨 Problemas Comunes y Soluciones

### 1. Errores de Conexión SSH

#### Error: `connect ECONNREFUSED`
```
❌ Error de conexión: connect ECONNREFUSED [IP]:[PORT]
```

**Causas posibles:**
- Servidor SSH no está ejecutándose
- Puerto SSH bloqueado por firewall
- IP o puerto incorrecto

**Soluciones:**
```bash
# Verificar conectividad
ping [servidor]
telnet [servidor] 22

# Verificar servicio SSH en el servidor
sudo systemctl status ssh
sudo systemctl start ssh

# Verificar puerto SSH
sudo netstat -tlnp | grep :22
```

#### Error: `connect ETIMEDOUT`
```
❌ Error de conexión: connect ETIMEDOUT
```

**Causas posibles:**
- Firewall bloqueando conexión
- Red lenta o con problemas
- Servidor fuera de línea

**Soluciones:**
```bash
# Aumentar timeout (modificar código)
readyTimeout: 60000  // 60 segundos

# Verificar ruta de red
traceroute [servidor]
mtr [servidor]
```

### 2. Errores de Autenticación

#### Error: `All configured authentication methods failed`
```
❌ Error de conexión: All configured authentication methods failed
```

**Causas posibles:**
- Usuario o contraseña incorrectos
- Autenticación por llave pública requerida
- Usuario bloqueado o restringido

**Soluciones:**
```bash
# Verificar usuario y contraseña manualmente
ssh [usuario]@[servidor]

# Verificar configuración SSH del servidor
sudo cat /etc/ssh/sshd_config | grep -E "(PasswordAuthentication|PubkeyAuthentication)"

# Verificar logs del servidor
sudo tail -f /var/log/auth.log
```

#### Error: `Authentication timeout`
```
❌ Error: Authentication timeout
```

**Solución:**
- Verificar que el usuario existe
- Asegurarse de que la contraseña sea correcta
- Intentar conexión manual primero

### 3. Problemas con Detección de Contraseñas

#### El CLI no detecta prompts de sudo
```bash
# Comando ejecutándose pero esperando entrada
🔄 Ejecutando: sudo systemctl restart nginx...
```

**Diagnóstico:**
1. Verificar patrones de detección en logs
2. El prompt puede ser no estándar
3. Timeout insuficiente

**Soluciones:**
```bash
# Opción 1: Usar NOPASSWD en sudoers
echo "[usuario] ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx" | sudo tee -a /etc/sudoers

# Opción 2: Modificar comando
sudo -S systemctl restart nginx  # Fuerza lectura desde stdin

# Opción 3: Usar timeout más alto
timeout 10 sudo systemctl restart nginx
```

#### Detección falsa de prompts
```
🔐 Detectado prompt (confianza: 85%) - Enviando contraseña automáticamente
```

**Solución:**
- Revisar el output del comando en logs
- Ajustar niveles de confianza en el código
- Usar comandos más específicos

### 4. Problemas de Directorio

#### Error: `No such file or directory`
```
❌ Error ejecutando cd /ruta/inexistente: No such file or directory
```

**Soluciones:**
```bash
# Verificar ruta antes de cambiar
test -d /ruta/destino && cd /ruta/destino || echo "Directorio no existe"

# Crear directorio si no existe
mkdir -p /ruta/destino && cd /ruta/destino

# Usar rutas absolutas
cd /home/usuario/proyecto  # En lugar de cd ../proyecto
```

#### Contexto de directorio perdido
```bash
# Si los comandos no se ejecutan en el directorio esperado
pwd  # Agregar este comando para debug
```

### 5. Problemas de Rendimiento

#### Comandos muy lentos
```bash
# Comando que tarda mucho en completar
🔄 Ejecutando: apt update...
```

**Soluciones:**
```bash
# Agregar indicadores de progreso
apt update -q  # Modo silencioso
apt update 2>&1 | tee /tmp/apt-update.log  # Log intermedio

# Dividir comandos largos
apt update
apt list --upgradable
apt upgrade -y
```

#### Timeout en comandos interactivos
```bash
# Para comandos que requieren confirmación
apt upgrade -y  # Usar -y para auto-confirmar
mysql < script.sql  # Usar redirección en lugar de interactivo
```

### 6. Problemas con Logs

#### Logs muy grandes
```bash
# Logs que crecen demasiado
ls -lah logs/
```

**Soluciones:**
```bash
# Limpiar logs antiguos
find logs/ -name "ssh-log-*.txt" -mtime +7 -delete

# Comprimir logs
gzip logs/ssh-log-*.txt

# Limitar output en comandos
tail -100 /var/log/nginx/access.log  # En lugar de cat completo
```

#### Logs sin información útil
```
=== COMANDO: comando_silencioso ===
=== FIN COMANDO (código: 0) ===
```

**Soluciones:**
```bash
# Agregar verbosidad
comando_silencioso -v
comando_silencioso --verbose

# Agregar output manual
echo "Ejecutando comando_silencioso..."
comando_silencioso
echo "Comando completado con código: $?"
```

## 🔍 Herramientas de Diagnóstico

### Debug de Conexión SSH

```bash
# Crear proceso de debug
node index.mjs start

# Comandos de diagnóstico:
echo "=== INFORMACIÓN DE CONEXIÓN ==="
whoami
hostname
pwd
echo "=== VARIABLES DE ENTORNO ==="
env | grep -E "(USER|HOME|PATH)" | head -10
echo "=== PERMISOS SUDO ==="
sudo -l
```

### Verificación de Dependencias

```bash
# Verificar Node.js
node --version
npm --version

# Verificar dependencias del proyecto
npm list
npm audit

# Verificar instalación
node index.mjs help
```

### Test de Conectividad

```bash
# Crear proceso "Test Conectividad"
ping -c 3 8.8.8.8
nslookup google.com
curl -I https://google.com
ssh -o ConnectTimeout=5 [usuario]@[servidor] "echo 'Conexión OK'"
```

## 📋 Checklist de Solución de Problemas

### Antes de Reportar un Error

- [ ] ✅ Verificar conexión SSH manual: `ssh usuario@servidor`
- [ ] ✅ Comprobar credenciales en otra herramienta
- [ ] ✅ Revisar logs en `logs/ssh-log-*.txt`
- [ ] ✅ Probar comandos individualmente
- [ ] ✅ Verificar permisos sudo en el servidor
- [ ] ✅ Comprobar firewall y conectividad de red

### Información para Reportes

```bash
# Información del sistema
node --version
npm --version
uname -a

# Información del error
cat logs/ssh-log-[timestamp].txt

# Configuración SSH (sin contraseñas)
cat process/ssh-processes.json
```

## 🚨 Casos Especiales

### Servidores con Configuración Especial

#### SSH en puerto no estándar
```bash
# En lugar del puerto 22
Host: servidor.com
Puerto: 2222
```

#### Servidores con autenticación de dos factores
```
❌ Error: Two-factor authentication not supported
```

**Solución**: El CLI actualmente no soporta 2FA. Usar:
- Llaves SSH con passphrase
- Certificados
- Deshabilitar 2FA temporalmente para este usuario

#### Servidores con shells no estándar
```bash
# Si el servidor usa fish, zsh, etc.
echo "=== SHELL ACTUAL ==="
echo $SHELL
echo "=== CAMBIAR A BASH ==="
bash
```

### Comandos Problemáticos

#### Comandos interactivos
```bash
# Evitar:
mysql -p  # Pide contraseña interactivamente

# Usar:
mysql -p[contraseña] < script.sql
mysql --password=[contraseña] -e "SHOW DATABASES;"
```

#### Comandos con output muy largo
```bash
# Evitar:
find / -name "*.txt"  # Miles de líneas

# Usar:
find /var/www -name "*.txt" | head -50
find / -name "*.txt" 2>/dev/null | head -100
```

## 🔧 Guía Completa del Modo Debug

### ¿Cuándo usar el Modo Debug?

El modo debug se activa automáticamente cuando:
- Un comando retorna un código de salida diferente de 0
- Hay errores de permisos
- Fallan comandos críticos del sistema
- Servicios no se inician correctamente

### Funcionalidades del Modo Debug

#### 1. **Ejecución de Comandos en Tiempo Real**
```bash
# Ejemplos de comandos debug útiles:
ps aux | grep nginx          # Verificar procesos
systemctl status nginx      # Estado del servicio
tail -f /var/log/nginx/error.log  # Ver logs en tiempo real
ls -la /etc/nginx/           # Verificar archivos de configuración
nginx -t                     # Probar configuración
```

#### 2. **Visualización del Log Completo**
- Ve todo el historial de comandos ejecutados
- Output completo de cada comando
- Códigos de salida y errores

#### 3. **Opciones de Continuación Flexibles**
```
🔄 ¿Cómo deseas continuar?
  🔄 Reiniciar proceso desde el inicio     # Empezar todo de nuevo
  ▶️  Continuar desde el comando que falló  # Reintentar el comando fallido
  ⏭️  Saltar comando fallido y continuar   # Omitir y seguir
  🚪 Finalizar proceso completamente      # Terminar todo
```

### Estrategias de Debug por Tipo de Error

#### Errores de Permisos
```bash
# En modo debug, ejecutar:
ls -la                       # Ver permisos del directorio
whoami                       # Verificar usuario actual
groups                       # Ver grupos del usuario
sudo -l                      # Ver permisos sudo disponibles
```

#### Errores de Servicios
```bash
# Para servicios que fallan:
systemctl status servicio    # Estado detallado
journalctl -u servicio -n 50 # Logs recientes
systemctl list-dependencies servicio # Dependencias
```

#### Errores de Red/Conectividad
```bash
# Diagnóstico de red:
ping -c 3 google.com         # Conectividad básica
netstat -tlnp                # Puertos abiertos
ss -tlnp                     # Alternativa moderna
curl -I http://localhost     # Probar servicios web
```

#### Errores de Archivos/Paths
```bash
# Verificación de archivos:
pwd                          # Directorio actual
find . -name "archivo"       # Buscar archivos
file /ruta/archivo           # Tipo de archivo
head -20 /ruta/archivo       # Ver contenido
```

### Mejores Prácticas en Modo Debug

#### 1. **Diagnóstico Sistemático**
```bash
# Secuencia recomendada:
pwd                          # ¿Dónde estoy?
whoami                       # ¿Quién soy?
echo $PATH                   # ¿Variables correctas?
ls -la                       # ¿Qué hay aquí?
```

#### 2. **Comandos Seguros**
```bash
# Comandos que NO modifican el sistema:
ps aux                       # Ver procesos
df -h                        # Espacio en disco
free -h                      # Memoria disponible
uptime                       # Carga del sistema
```

#### 3. **Cuando Salir del Debug**
- ✅ **Salir del debug** si identificaste y puedes corregir el problema
- ✅ **Finalizar conexión** si el problema requiere intervención externa
- ✅ **Reiniciar proceso** si solucionaste la causa raíz

### Casos de Uso Avanzados

#### Depuración de Scripts de Deployment
```bash
# En modo debug para deployments:
git status                   # Estado del repositorio
git log -3 --oneline         # Últimos commits
npm list --depth=0           # Dependencias instaladas
pm2 list                     # Procesos PM2
```

#### Análisis de Performance
```bash
# Para problemas de rendimiento:
top -n 1                     # CPU usage
iostat 1 3                   # I/O stats
sar -u 1 3                   # System activity
```

#### Troubleshooting de Base de Datos
```bash
# Para problemas de DB:
systemctl status mysql       # Estado del servicio DB
mysql -e "SHOW PROCESSLIST;" # Procesos activos
df -h /var/lib/mysql         # Espacio de DB
```

## 🔧 Modificaciones del Código

### Aumentar Timeout

```javascript
// En createPasswordTimeoutHandler()
timeoutId = setTimeout(() => {
  if (!responded) {
    sendPassword("Timeout - ");
  }
}, 10000); // Cambiar de 3000 a 10000 (10 segundos)
```

### Agregar Patrones Personalizados

```javascript
// En analyzeStreamOutput()
const customPatterns = [
  { pattern: /mi.*patron.*especial/i, confidence: 90 },
  { pattern: /custom.*password.*prompt/i, confidence: 85 }
];
```

### Debug Mode

```javascript
// Agregar al inicio del archivo
const DEBUG = process.env.SSH_CLI_DEBUG === 'true';

// En las funciones importantes
if (DEBUG) {
  console.log('Debug:', data.toString());
}
```

## 📞 Obtener Ayuda

Si después de seguir esta guía aún tienes problemas:

1. **Revisa los logs** detalladamente
2. **Prueba conexión manual** SSH
3. **Documenta el error** con información completa
4. **Busca en issues** del proyecto
5. **Crea un nuevo issue** con toda la información

### Template para Reportar Problemas

```markdown
## Descripción del Problema
[Descripción clara del problema]

## Pasos para Reproducir
1. Ejecutar `node index.mjs start`
2. Configurar host: servidor.com
3. Agregar comando: sudo systemctl restart nginx
4. Error aparece en paso X

## Información del Sistema
- Node.js: v18.17.0
- OS: Ubuntu 22.04
- SSH CLI: v1.1.0

## Logs
```
[Contenido del log relevante]
```

## Configuración (sin contraseñas)
```json
[Configuración del proceso]
```
```