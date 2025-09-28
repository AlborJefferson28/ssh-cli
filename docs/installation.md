# 📦 Instalación

## Requisitos del Sistema

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0 (incluido con Node.js)
- **Sistema Operativo**: Ubuntu Linux (probado)
- **Acceso SSH** a servidores remotos

## 🚀 Instalación Rápida

### Opción 1: Clonar Repositorio

```bash
# Clonar el proyecto
git clone [URL_DEL_REPOSITORIO]
cd ssh-cli

# Instalar dependencias
npm install

# Verificar instalación
node index.mjs help
```

### Opción 2: Descarga Manual

1. **Descargar archivos**
   - `index.mjs`
   - `package.json`

2. **Instalar dependencias**
```bash
npm install
```

3. **Verificar instalación**
```bash
node index.mjs help
```

4. **Configurar aliases (opcional)**
```bash
# Ejecutar script de configuración automática
./install.sh

# O configurar manualmente (ver guía de aliases)
```

4. **Configurar aliases (opcional)**
```bash
# Ejecutar script de configuración automática
./install.sh

# O configurar manualmente (ver guía de aliases)
```

## 📋 Dependencias

### Dependencias de Producción

```json
{
  "dependencies": {
    "ssh2": "^1.14.0",
    "inquirer": "^9.2.0"
  }
}
```

- **ssh2**: Cliente SSH para Node.js
- **inquirer**: Interfaz de línea de comandos interactiva

### Instalación de Dependencias

```bash
# Instalar todas las dependencias
npm install

# Instalar solo dependencias específicas
npm install ssh2 inquirer

# Verificar dependencias instaladas
npm list
```

## 🔧 Configuración Inicial

### Estructura de Directorios

El CLI creará automáticamente los directorios necesarios:

```
ssh-cli/
├── index.mjs              # Archivo principal
├── package.json           # Configuración npm
├── process/              # Procesos guardados (auto-creado)
│   └── ssh-processes.json
├── logs/                 # Logs de ejecución (auto-creado)
│   └── ssh-log-*.txt
└── docs/                 # Documentación
    └── ...
```

### Permisos de Archivos

```bash
# Asegurar permisos correctos
chmod +x index.mjs
chmod 755 .
```

### Variables de Entorno (Opcional)

```bash
# Configurar directorios personalizados
export SSH_CLI_PROCESS_DIR="/custom/path/process"
export SSH_CLI_LOGS_DIR="/custom/path/logs"

# Habilitar modo debug
export SSH_CLI_DEBUG=true
```

## ✅ Verificación de Instalación

### Test Básico

```bash
# Mostrar ayuda
node index.mjs help

# Listar procesos (debería mostrar lista vacía)
node index.mjs list
```

### Test de Conectividad

```bash
# Crear proceso de prueba
node index.mjs start

# Configurar con un servidor de prueba
# Comandos simples: whoami, pwd, ls
```

## 🔧 Configuración de Node.js

### Verificar Versión de Node.js

```bash
node --version
# Debe mostrar >= v16.0.0
```

### Actualizar Node.js (si es necesario)

#### Ubuntu/Debian (usando nvm)
```bash
# Instalar nvm (si no está instalado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reiniciar terminal o ejecutar:
source ~/.bashrc

# Instalar Node.js LTS
nvm install --lts
nvm use --lts
```

#### Ubuntu/Debian (usando package manager)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL/Fedora
curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
sudo yum install -y nodejs
```

## 🐧 Instalación en Linux

### Ubuntu/Debian

```bash
# Actualizar sistema
sudo apt update

# Instalar Node.js y npm
sudo apt install nodejs npm

# Verificar instalación
node --version
npm --version

# Clonar y configurar SSH CLI
git clone [REPO_URL]
cd ssh-cli
npm install
```

### CentOS/RHEL

```bash
# Instalar Node.js y npm
sudo yum install nodejs npm

# O usando dnf (Fedora)
sudo dnf install nodejs npm

# Configurar SSH CLI
git clone [REPO_URL]
cd ssh-cli
npm install
```

## 🔒 Configuración de SSH

### Generar Llaves SSH (Opcional)

```bash
# Generar nueva llave SSH
ssh-keygen -t rsa -b 4096 -C "tu-email@ejemplo.com"

# Copiar llave pública al servidor
ssh-copy-id usuario@servidor.com

# Probar conexión
ssh usuario@servidor.com
```

### Configurar SSH Config

```bash
# Editar archivo de configuración SSH
nano ~/.ssh/config

# Agregar configuración
Host mi-servidor
    HostName servidor.empresa.com
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

## 🚨 Solución de Problemas de Instalación

### Error: `command not found: node`

```bash
# Verificar PATH
echo $PATH

# Reinstalar Node.js siguiendo pasos de instalación
```

### Error: `EACCES: permission denied`

```bash
# Configurar npm para usar directorio global diferente
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'

# Agregar a PATH (en ~/.bashrc o ~/.zshrc)
export PATH=~/.npm-global/bin:$PATH
```

### Error: `Cannot find module 'ssh2'`

```bash
# Reinstalar dependencias
rm -rf node_modules
npm install

# O instalar específicamente
npm install ssh2 inquirer
```

## 🔄 Actualización

### Actualizar Dependencias

```bash
# Verificar actualizaciones disponibles
npm outdated

# Actualizar todas las dependencias
npm update

# Actualizar dependencia específica
npm install ssh2@latest
```

### Actualizar SSH CLI

```bash
# Si tienes el repositorio
git pull origin main
npm install

# Si descargaste manualmente
# Descargar nuevos archivos y reemplazar
# Ejecutar npm install
```

## 📝 Post-Instalación

### Configuración de Comandos Cortos

Después de la instalación, puedes configurar el CLI para usar comandos más cortos:

#### Opción 1: Script Automático (Recomendada)
```bash
# Ejecutar desde el directorio ssh-cli
./install.sh
```

Este script configurará:
- ✅ Permisos de ejecución (`./index.mjs`)
- ✅ Comando global (`ssh-cli`)  
- ✅ Opción de alias personalizado

#### Opción 2: Configuración Manual

```bash
# Dar permisos de ejecución
chmod +x index.mjs

# Crear comando global (requiere sudo)
sudo ln -sf $(pwd)/index.mjs /usr/local/bin/ssh-cli

# Crear alias personal (opcional)
echo "alias sshcli='$(pwd)/index.mjs'" >> ~/.bashrc
source ~/.bashrc
```

Ver la [guía completa de aliases](aliases.md) para más opciones.

### Crear Alias (Opcional)

```bash
# Agregar a ~/.bashrc o ~/.zshrc
alias ssh-cli="node /ruta/a/ssh-cli/index.mjs"

# Recargar terminal
source ~/.bashrc

# Usar con alias
ssh-cli help
ssh-cli list
```

### Configurar como Comando Global (Opcional)

```bash
# Hacer enlace simbólico
sudo ln -s /ruta/a/ssh-cli/index.mjs /usr/local/bin/ssh-cli
sudo chmod +x /usr/local/bin/ssh-cli

# Usar globalmente
ssh-cli help
```

## ✅ Checklist de Instalación Exitosa

- [ ] Node.js >= 16.0.0 instalado
- [ ] npm funcionando correctamente
- [ ] Dependencias ssh2 e inquirer instaladas
- [ ] `node index.mjs help` muestra la ayuda
- [ ] `node index.mjs list` muestra "No hay procesos SSH guardados"
- [ ] Directorios `process/` y `logs/` se crean automáticamente
- [ ] Conectividad SSH a al menos un servidor remoto
- [ ] Test de proceso SSH completado exitosamente

¡La instalación está completa y el SSH CLI está listo para usar! 🚀