# SSH CLI - Remote Command Executor

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Un potente CLI para gestionar conexiones SSH y ejecutar comandos remotos con **modo interactivo completo** y detección automática de contraseñas sudo.

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

## 🚀 Características

- **🌐 Flujo de Configuración Inteligente**: Detección automática de hosts existentes con valores por defecto contextuales
- **🖱️ Modo Interactivo Completo**: Navegación intuitiva con menús visuales usando inquirer.js
- **🏠 Agrupación por Hosts**: Organización automática de procesos por nombre de host
- **🧹 Interfaz Limpia**: Pantallas limpias que solo muestran información relevante
- **🔍 Navegación Jerárquica**: Hosts → Procesos → Detalles → Ejecución
- **📊 Estadísticas Visuales**: Información detallada con formato profesional
- **🔐 Detección Automática de Contraseñas**: Manejo inteligente de prompts sudo con +90 patrones
- **📁 Persistencia de Contexto**: Mantiene el directorio de trabajo entre comandos
- **📄 Logging Detallado**: Registro completo de todas las ejecuciones
- **✅ Validación Avanzada**: Validación de inputs con mensajes descriptivos
- **💡 Sugerencias Inteligentes**: Autocompletado y sugerencias de comandos comunes
- **🎨 Interfaz Mejorada**: Diseño profesional con emojis y banners contextuales

## 📋 Tabla de Contenidos

- [Instalación](installation.md)
- [Configuración de Alias](aliases.md)
- [Guía de Inicio Rápido](quick-start.md)
- [Comandos](commands.md)
- [Configuración](configuration.md)
- [Ejemplos](examples.md)
- [API Reference](api.md)
- [Solución de Problemas](troubleshooting.md)

## 🎯 Casos de Uso

- **DevOps**: Automatización de despliegues y mantenimiento de servidores
- **Administración de sistemas**: Gestión remota de múltiples servidores con navegación intuitiva
- **Desarrollo**: Ejecución de comandos en entornos de desarrollo remotos
- **Monitoreo**: Verificación de estado y métricas de servidores
- **Gestión de Equipos**: Interface amigable para usuarios no técnicos

## 🆕 Nuevas Características v1.0.0

### Modo Interactivo Completo
- **Menú Principal**: Navegación visual con opciones claras
- **Navegación por Hosts**: Organización automática por nombre de host
- **Selección Visual**: Interfaces intuitivas para seleccionar hosts y procesos
- **Pantallas Limpias**: Solo muestra información relevante para la acción actual

### Mejoras en la Experiencia de Usuario
- **Banners Contextuales**: Headers específicos para cada tipo de operación
- **Confirmaciones Visuales**: Pantallas dedicadas para éxito/error/cancelación
- **Progreso Visual**: Indicadores de progreso durante la configuración
- **Sugerencias en Tiempo Real**: Ayuda contextual mientras se escriben comandos

### Flujo de Configuración Inteligente
- **🌐 Host como Primer Input**: El host remoto es lo primero que se solicita
- **🔍 Detección Automática**: Verifica inmediatamente si el host ya está registrado
- **🏷️ Nombres Inteligentes**: Solo pide el nombre del host si es nuevo
- **📋 Valores Contextuales**: Pre-completa puerto y usuario para hosts existentes
- **📊 Información en Tiempo Real**: Muestra procesos existentes del host durante configuración
- **🔄 Reutilización Eficiente**: Permite agregar nuevos procesos a hosts existentes sin re-configurar

### Sistema de Hosts Mejorado
- **Agrupación Automática**: Los procesos se agrupan por nombre de host
- **Navegación Jerárquica**: Hosts → Procesos → Detalles
- **Selección por Host ID**: Nuevo método de selección más claro
- **Estadísticas por Host**: Información detallada de cada host

## 📦 Estructura del Proyecto

```
ssh-cli/
├── index.mjs           # Archivo principal del CLI con modo interactivo
├── package.json        # Dependencias (ssh2, inquirer)
├── docs/              # Documentación actualizada
│   ├── README.md
│   ├── commands.md
│   ├── examples.md
│   └── ...
├── process/           # Procesos SSH guardados por host
│   └── ssh-processes.json
└── logs/              # Logs de ejecución
    └── ssh-log-*.txt
```

## 🖱️ Modos de Uso

### Modo Interactivo (Recomendado)
```bash
node index.mjs
```
Accede a la interfaz completa con navegación visual y menús intuitivos.

### Modo CLI Tradicional
```bash
node index.mjs help
node index.mjs list
node index.mjs start -h 1 -p 2
```
Uso directo desde línea de comandos para automatización.

## ⚡ Inicio Rápido

1. **Instalar dependencias**
```bash
npm install
```

2. **Ejecutar en modo interactivo**
```bash
node index.mjs
```

3. **Seguir los menús visuales** para:
   - Crear nuevo proceso SSH
   - Navegar procesos por host
   - Ejecutar procesos guardados
   - Ver estadísticas

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](../LICENSE) para detalles.

## 📞 Soporte

Si tienes problemas o preguntas:

- 📚 Consulta la [documentación completa](.)
- 🐛 Reporta bugs en [Issues](../../issues)
- 💡 Solicita features nuevas en [Issues](../../issues)