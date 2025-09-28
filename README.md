# SSH Remote Command Executor

[![npm version](https://badge.fury.io/js/@alborjefferson%2Fssh-remote-executor.svg)](https://www.npmjs.com/package/@alborjefferson/ssh-remote-executor)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-green.svg)](https://nodejs.org/)
[![Ubuntu](https://img.shields.io/badge/ubuntu-tested-orange.svg)](https://ubuntu.com/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Un potente CLI para gestionar conexiones SSH y ejecutar comandos remotos con detección automática de contraseñas sudo.

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              _____ _____ _   _     _____  _     _            ║
║             |   __|   __| |_| |   |  ___|| |   | |           ║
║             |___  |___  |  _  |   | |___ | |___| |           ║
║             |_____|_____|_| |_|   |_____||_____|_|           ║
║                                                              ║
║             🚀 SSH Remote Command Executor v1.0.0            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## 🚀 Instalación

### Desde npm (Recomendado)

```bash
# Instalación global
npm install -g @alborjefferson/ssh-remote-executor

# ¡Usar inmediatamente!
ssh-cli help
```

### Desde código fuente

```bash
# 1. Clonar el repositorio
git clone https://github.com/AlborJefferson28/ssh-cli.git
cd ssh-cli

# 2. Instalar dependencias
npm install

# 3. Configurar comandos cortos (recomendado)
./install.sh

# 4. ¡Usar el CLI!
ssh-cli help
```

## 💡 Uso Básico

```bash
# Mostrar ayuda
ssh-cli help

# Crear nuevo proceso SSH
ssh-cli start

# Listar procesos guardados
ssh-cli list

# Ejecutar proceso guardado
ssh-cli start -p 1

# Eliminar proceso
ssh-cli delete -p 2
```

## ✨ Características Principales

- 🔐 **Detección automática de sudo**: Envía contraseñas automáticamente
- 💾 **Procesos reutilizables**: Guarda configuraciones para uso futuro
- 📁 **Contexto persistente**: Mantiene directorio de trabajo entre comandos
- 📊 **Logging detallado**: Registro completo de todas las ejecuciones
- 🎨 **Interfaz profesional**: Diseño limpio con progress indicators

## 📚 Documentación Completa

Ver la [documentación completa](docs/README.md) para:
- [📦 Guía de instalación detallada](docs/installation.md)
- [⚡ Configuración de aliases](docs/aliases.md)
- [🚀 Inicio rápido](docs/quick-start.md)
- [📋 Referencia de comandos](docs/commands.md)
- [💡 Ejemplos prácticos](docs/examples.md)
- [🛠️ Solución de problemas](docs/troubleshooting.md)

## 🎯 Ejemplo Rápido

```bash
# Conectar a servidor y ejecutar comandos
ssh-cli start

# Configuración interactiva:
# Host: mi-servidor.com
# Usuario: deploy
# Contraseña: ********
# Comandos: 
#   1. cd /var/www/app
#   2. git pull origin main
#   3. sudo systemctl restart nginx

# ¡El CLI maneja todo automáticamente!
```

## 📋 Requisitos

- **Node.js** >= 16.0.0
- **Ubuntu Linux** (probado)
- **Acceso SSH** a servidores remotos

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Ver [CONTRIBUTING.md](CONTRIBUTING.md) para detalles.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT

---

⭐ ¡Si te gusta este proyecto, dale una estrella en GitHub!