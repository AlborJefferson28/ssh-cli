# 🛠️ Solución de Problemas

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
- SSH CLI: v1.0.0

## Logs
```
[Contenido del log relevante]
```

## Configuración (sin contraseñas)
```json
[Configuración del proceso]
```
```