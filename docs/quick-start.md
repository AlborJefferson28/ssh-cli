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

## 🎯 Tu Primera Conexión SSH

### Paso 1: Ejecutar el CLI
```bash
node index.mjs start
```

### Paso 2: Configurar la conexión
El CLI te pedirá la siguiente información:

```
? Host remoto: tu-servidor.com
? Puerto SSH: 22
? Usuario SSH: tu-usuario
? Contraseña: ********
```

### Paso 3: Agregar comandos
```
? Comando a ejecutar: ls -la
? ¿Quieres agregar otro comando? Yes
? Comando a ejecutar: whoami
? ¿Quieres agregar otro comando? No
```

### Paso 4: Guardar proceso (opcional)
```
? ¿Deseas guardar este proceso SSH para uso futuro? Yes
? Nombre para este proceso SSH: Mi Primer Proceso
```

### Paso 5: Ejecutar
```
? ¿Ejecutar ahora? Yes
```

## 📋 Ejemplo Completo

### Escenario: Deploy de una aplicación web

1. **Crear el proceso**
```bash
node index.mjs start
```

2. **Configuración:**
```
Host remoto: servidor-produccion.empresa.com
Puerto SSH: 22
Usuario SSH: deploy
Contraseña: ********
```

3. **Comandos de deploy:**
```
Comando 1: cd /var/www/mi-app
Comando 2: git pull origin main
Comando 3: npm install --production
Comando 4: sudo systemctl restart nginx
Comando 5: sudo systemctl restart mi-app
```

4. **Guardar como "Deploy Producción"**

5. **Ejecutar inmediatamente**

### Reutilizar el proceso guardado

```bash
# Listar procesos guardados
node index.mjs list

# Ejecutar el proceso ID 1
node index.mjs start -p 1
```

## 🔧 Comandos Básicos de Prueba

### Verificar conectividad
```bash
node index.mjs start
# Comando: ping -c 3 google.com
```

### Información del sistema
```bash
node index.mjs start
# Comandos:
# 1. uname -a
# 2. df -h
# 3. free -m
# 4. whoami
```

### Gestión de archivos
```bash
node index.mjs start
# Comandos:
# 1. pwd
# 2. ls -la
# 3. cd /tmp
# 4. ls -la
```

## 📊 Verificar Resultados

### Logs de ejecución
Los logs se guardan automáticamente en:
```
logs/ssh-log-[timestamp].txt
```

### Contenido del log
```
=== COMANDO: ls -la ===
DIRECTORIO ACTUAL: ~
COMANDO EJECUTADO: cd ~ && ls -la
total 32
drwxr-xr-x 5 usuario usuario 4096 Sep 28 10:30 .
drwxr-xr-x 3 root    root    4096 Sep 20 09:15 ..
-rw-r--r-- 1 usuario usuario  220 Sep 20 09:15 .bash_logout
...
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
**Solución**: Verifica usuario y contraseña.

### Comando sudo no responde
El CLI detecta automáticamente prompts de sudo y envía la contraseña, pero si falla:
- Verifica que la contraseña sea correcta
- Algunos comandos pueden necesitar `NOPASSWD` en sudoers

### Directorio no encontrado
```bash
# En lugar de solo:
cd /ruta/inexistente

# Usa:
cd /ruta/inexistente || echo "Directorio no existe"
```

## ⚡ Consejos de Rendimiento

1. **Comandos cortos**: Divide comandos largos en pasos más pequeños
2. **Verifica rutas**: Usa rutas absolutas cuando sea posible
3. **Timeout**: Los comandos muy largos pueden necesitar ajustes
4. **Red**: Conexiones lentas pueden afectar la detección de prompts

## 🎯 Próximos Pasos

- Explora [comandos avanzados](commands.md)
- Revisa [ejemplos completos](examples.md)
- Configura [opciones avanzadas](configuration.md)
- Lee sobre [solución de problemas](troubleshooting.md)