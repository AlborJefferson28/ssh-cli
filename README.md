# SSH Remote Command Executor

[![npm version](https://badge.fury.io/js/@alborjefferson%2Fssh-remote-executor.svg)](https://www.npmjs.com/package/@alborjefferson/ssh-remote-executor)
[![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-green.svg)](https://nodejs.org/)
[![Ubuntu](https://img.shields.io/badge/ubuntu-tested-orange.svg)](https://ubuntu.com/)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Un potente CLI para gestionar conexiones SSH y ejecutar comandos remotos con detección automática de contraseñas sudo y **modo debug avanzado** para solución de problemas en tiempo real.

```
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              _____ _____ _   _     _____  _     _            ║
║             |   __|   __| |_| |   |  ___|| |   | |           ║
║             |___  |___  |  _  |   | |___ | |___| |           ║
║             |_____|_____|_| |_|   |_____||_____|_|           ║
║                                                              ║
║             🚀 SSH Remote Command Executor v1.1.0            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

## 🌟 Características Principales

- 🔧 **Modo Debug Interactivo**: Depura problemas en tiempo real sin cerrar la conexión SSH
- 🤖 **Detección Inteligente de Hosts**: Configuración automática para hosts conocidos
- 🔐 **Detección Automática de Sudo**: Manejo inteligente de contraseñas para comandos sudo
- 💾 **Gestión de Procesos**: Guarda y reutiliza configuraciones SSH
- 📊 **Logs Detallados**: Registro completo de todas las ejecuciones
- 🎨 **Interfaz Intuitiva**: Menús interactivos con navegación visual
- ⚡ **Ejecución Rápida**: Acceso directo por ID de host y posición


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

# Crear nuevo proceso SSH (modo interactivo)
ssh-cli start

# Listar procesos guardados por host
ssh-cli list

# Ejecutar proceso específico
ssh-cli start -h 1 -p 2  # Host ID 1, posición 2

# Eliminar proceso
ssh-cli delete -p 2
```

## 🔧 Modo Debug Avanzado

Cuando un comando falla durante la ejecución, el CLI ofrece **modo debug interactivo** con conexión directa:

```
⚠️  Error detectado en el comando: sudo systemctl restart nginx
🔧 ¿Cómo deseas proceder?
  > 🔧 Entrar en modo debug
    ⏭️  Saltar este comando y continuar
    🚪 Finalizar proceso
```

### Experiencia de Conexión Directa

El modo debug te coloca **directamente en el log completo** con una línea de comandos activa que incluye:

#### ⌨️ Navegación Sencilla
- **↑ / ↓**: Navega por el historial de comandos (hasta 50 comandos)
- **Ctrl+Q / Ctrl+X**: Salir del modo debug
- **Ctrl+L**: Mostrar logs completos
- **Ctrl+H**: Ayuda contextual

#### 🖥️ Interfaz Profesional
- **Terminal limpio**: Sin duplicación visual
- **Formato estructurado**: Salida organizada con marcos ASCII
- **Historial de comandos**: Navegación rápida por comandos anteriores

```
📋 HISTORIAL DE COMANDOS:
════════════════════════════════════════════════════════════════════════════════
✅ COMANDO 1: cd /var/www/app
────────────────────────────────────────────────────────
  /var/www/app
  └─ Código de salida: 0

✅ COMANDO 2: git pull origin main
────────────────────────────────────────────────────────
  Already up to date.
  └─ Código de salida: 0

❌ COMANDO 3: sudo systemctl restart nginx
────────────────────────────────────────────────────────
  Job for nginx.service failed because...
  └─ Código de salida: 1

💡 Atajos: Ctrl+Q=Salir | Ctrl+X=Finalizar | Ctrl+L=Log | Ctrl+H=Ayuda

🔧 debug@Servidor Web:~$ 
```

### Atajos de Teclado Optimizados

- **Ctrl+Q**: 🔄 Salir del debug (volver al proceso)
- **Ctrl+X**: 🚪 Finalizar conexión completamente  
- **Ctrl+L**: � Actualizar y mostrar log completo
- **Ctrl+H**: 🆘 Mostrar ayuda con comandos útiles
- **Ctrl+C**: 📋 Mostrar menú de opciones avanzadas

### Flujo de Diagnóstico Rápido

```bash
# Ejemplo de sesión debug real:
🔧 debug@Servidor Web:~$ nginx -t
nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)

🔧 debug@Servidor Web:~$ sudo lsof -i :80
apache2   1234 www-data    4u  IPv6  TCP *:http (LISTEN)

🔧 debug@Servidor Web:~$ sudo systemctl stop apache2
🔧 debug@Servidor Web:~$ sudo systemctl restart nginx
🔧 debug@Servidor Web:~$ # Ctrl+Q para volver al proceso
```

## ✨ Características Principales

- 🔧 **Modo Debug Interactivo**: Solución de problemas en tiempo real
- 🤖 **Detección Inteligente de Hosts**: Pre-llena configuraciones existentes
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

## � Testing

Este proyecto incluye una suite completa de tests unitarios e integración para garantizar la calidad y confiabilidad del código.

### Ejecutar Tests

```bash
# Instalar dependencias de testing
cd test && npm install

# Ejecutar todos los tests
npm test

# Solo tests unitarios
npm run test:unit

# Solo tests de integración  
npm run test:integration

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Script de conveniencia
./test/run-tests.sh
```

### Cobertura de Tests

La suite de tests cubre:
- ✅ **Sistema de archivos**: Carga/guardado de procesos
- ✅ **Gestión de procesos**: CRUD completo con validaciones
- ✅ **Detección de contraseñas**: Patrones sudo y prompts
- ✅ **Validaciones**: Todas las validaciones de entrada
- ✅ **Procesamiento de comandos**: Contexto y ejecución
- ✅ **Navegación interactiva**: Menús y selección
- ✅ **Conexiones SSH**: Integración completa
- ✅ **End-to-end**: Flujos completos del usuario

Ver [documentación de tests](test/README.md) para detalles completos.

## �🤝 Contribuir

¡Las contribuciones son bienvenidas! Ver [CONTRIBUTING.md](CONTRIBUTING.md) para detalles.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT

---

⭐ ¡Si te gusta este proyecto, dale una estrella en GitHub!