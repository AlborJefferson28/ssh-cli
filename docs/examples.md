# 💡 Ejemplos de Uso

## 🚀 Casos de Uso Comunes

### 1. Deploy Automático de Aplicación Web

```bash
node index.mjs start
```

**Configuración:**
- Host: `servidor-prod.empresa.com`
- Usuario: `deploy`
- Nombre del proceso: `Deploy Aplicación Web`

**Comandos:**
```bash
cd /var/www/mi-aplicacion
git pull origin main
npm install --production
npm run build
sudo systemctl restart nginx
sudo systemctl restart mi-aplicacion
sudo systemctl status mi-aplicacion
```

### 2. Monitoreo de Sistema

```bash
node index.mjs start
```

**Configuración:**
- Host: `servidor-monitor.empresa.com`
- Usuario: `admin`
- Nombre del proceso: `Chequeo Sistema`

**Comandos:**
```bash
echo "=== INFORMACIÓN DEL SISTEMA ==="
uname -a
echo "=== USO DE DISCO ==="
df -h
echo "=== USO DE MEMORIA ==="
free -m
echo "=== PROCESOS TOP ==="
top -bn1 | head -15
echo "=== SERVICIOS CRÍTICOS ==="
sudo systemctl status nginx
sudo systemctl status mysql
sudo systemctl status redis
```

### 3. Backup de Base de Datos

```bash
node index.mjs start
```

**Configuración:**
- Host: `servidor-db.empresa.com`
- Usuario: `backup`
- Nombre del proceso: `Backup MySQL`

**Comandos:**
```bash
cd /backup
echo "Iniciando backup de MySQL..."
mysqldump -u root -p mi_base_datos > backup_$(date +%Y%m%d_%H%M%S).sql
ls -lah backup_*.sql | tail -5
echo "Limpiando backups antiguos..."
find /backup -name "backup_*.sql" -mtime +7 -delete
echo "Backup completado"
```

### 4. Actualización de Sistema

```bash
node index.mjs start
```

**Configuración:**
- Host: `servidor-update.empresa.com`
- Usuario: `admin`
- Nombre del proceso: `Actualización Sistema`

**Comandos:**
```bash
echo "Actualizando paquetes del sistema..."
sudo apt update
sudo apt list --upgradable
sudo apt upgrade -y
sudo apt autoremove -y
echo "Verificando servicios después de actualización..."
sudo systemctl status nginx
sudo systemctl status mysql
echo "Actualización completada"
```

### 5. Análisis de Logs

```bash
node index.mjs start
```

**Configuración:**
- Host: `servidor-logs.empresa.com`
- Usuario: `logadmin`
- Nombre del proceso: `Análisis Logs`

**Comandos:**
```bash
echo "=== ERRORES EN NGINX ==="
sudo tail -100 /var/log/nginx/error.log | grep ERROR
echo "=== ACCESOS RECIENTES ==="
sudo tail -50 /var/log/nginx/access.log
echo "=== ERRORES DE APLICACIÓN ==="
sudo tail -100 /var/log/mi-app/error.log
echo "=== ESPACIO EN LOGS ==="
sudo du -sh /var/log/*
```

## 🔧 Ejemplos por Tecnología

### Node.js/Express

```bash
# Proceso: "Deploy Node.js"
cd /var/www/node-app
git pull origin main
npm install --production
npm run build
pm2 restart mi-app
pm2 logs mi-app --lines 20
```

### Python/Django

```bash
# Proceso: "Deploy Django"
cd /var/www/django-app
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn
sudo systemctl restart nginx
```

### Docker/Docker Compose

```bash
# Proceso: "Deploy Docker"
cd /var/www/docker-app
git pull origin main
sudo docker-compose down
sudo docker-compose pull
sudo docker-compose up -d
sudo docker ps
sudo docker logs mi-container --tail 20
```

### PHP/Laravel

```bash
# Proceso: "Deploy Laravel"
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

## 🔍 Ejemplos de Diagnóstico

### Diagnóstico de Red

```bash
# Proceso: "Diagnóstico Red"
echo "=== CONECTIVIDAD ==="
ping -c 3 8.8.8.8
echo "=== DNS ==="
nslookup google.com
echo "=== PUERTOS ABIERTOS ==="
sudo netstat -tlnp
echo "=== CONEXIONES ACTIVAS ==="
sudo ss -tuln
```

### Diagnóstico de Performance

```bash
# Proceso: "Performance Check"
echo "=== CPU Y MEMORIA ==="
top -bn1 | head -20
echo "=== E/S DE DISCO ==="
iostat -x 1 3
echo "=== PROCESOS QUE MÁS CONSUMEN ==="
ps aux --sort=-%cpu | head -10
ps aux --sort=-%mem | head -10
echo "=== CARGA DEL SISTEMA ==="
uptime
```

### Diagnóstico de Seguridad

```bash
# Proceso: "Security Check"
echo "=== USUARIOS LOGUEADOS ==="
who
echo "=== INTENTOS DE LOGIN FALLIDOS ==="
sudo grep "Failed password" /var/log/auth.log | tail -10
echo "=== PROCESOS SOSPECHOSOS ==="
ps aux | grep -E "(nc|netcat|telnet)" | grep -v grep
echo "=== PUERTOS NO ESTÁNDAR ==="
sudo netstat -tlnp | grep -v -E ":(22|80|443|53|25) "
```

## 📊 Ejemplos de Automatización

### Rotación de Logs

```bash
# Proceso: "Rotación Logs"
echo "Rotando logs de aplicación..."
cd /var/log/mi-app
sudo gzip app.log
sudo mv app.log.gz app-$(date +%Y%m%d).log.gz
sudo touch app.log
sudo chown mi-app:mi-app app.log
sudo systemctl reload mi-app
echo "Limpiando logs antiguos..."
find /var/log/mi-app -name "*.gz" -mtime +30 -delete
```

### Verificación de Certificados SSL

```bash
# Proceso: "Check SSL"
echo "Verificando certificados SSL..."
echo | openssl s_client -servername mi-dominio.com -connect mi-dominio.com:443 2>/dev/null | openssl x509 -noout -dates
echo "Verificando configuración nginx..."
sudo nginx -t
echo "Estado del servicio nginx..."
sudo systemctl status nginx
```

### Limpieza de Sistema

```bash
# Proceso: "Limpieza Sistema"
echo "Limpiando archivos temporales..."
sudo rm -rf /tmp/*
echo "Limpiando cache de apt..."
sudo apt clean
sudo apt autoclean
echo "Limpiando logs del journal..."
sudo journalctl --vacuum-time=7d
echo "Espacio disponible:"
df -h
```

## 🎯 Consejos para Procesos Complejos

### 1. Manejo de Errores
```bash
# En lugar de:
comando_que_puede_fallar

# Usa:
comando_que_puede_fallar || echo "FALLÓ: comando_que_puede_fallar"
```

### 2. Verificaciones Intermedias
```bash
git pull origin main
if [ $? -eq 0 ]; then echo "✅ Git pull exitoso"; else echo "❌ Git pull falló"; fi
```

### 3. Comandos Condicionales
```bash
# Solo reiniciar si el config es válido
nginx -t && sudo systemctl restart nginx || echo "Config nginx inválido"
```

### 4. Información de Contexto
```bash
echo "=== INICIANDO DEPLOY $(date) ==="
echo "Usuario: $(whoami)"
echo "Directorio: $(pwd)"
echo "Branch actual: $(git branch --show-current)"
```

## 🚀 Ejecutar Ejemplos

Para usar cualquiera de estos ejemplos:

1. **Copia los comandos** del ejemplo que te interese
2. **Ejecuta** `node index.mjs start`
3. **Configura** host, usuario y contraseña
4. **Pega los comandos** uno por uno
5. **Guarda el proceso** con un nombre descriptivo
6. **Ejecuta inmediatamente** o guárdalo para después

Luego podrás reutilizarlo con:
```bash
node index.mjs list  # Ver todos los procesos
node index.mjs start -p 1  # Ejecutar proceso por ID
```