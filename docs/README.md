# SSH CLI - Remote Command Executor

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-%3E%3D16.0.0-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

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

## 🚀 Características

- **Gestión de procesos SSH**: Crea, guarda, lista y elimina configuraciones SSH
- **Detección automática de contraseñas**: Manejo inteligente de prompts sudo con +90 patrones
- **Persistencia de contexto**: Mantiene el directorio de trabajo entre comandos
- **Logging detallado**: Registro completo de todas las ejecuciones
- **Interfaz intuitiva**: Diseño profesional con emojis y formato limpio
- **Optimizado para Linux**: Especialmente probado en Ubuntu

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
- **Administración de sistemas**: Gestión remota de múltiples servidores
- **Desarrollo**: Ejecución de comandos en entornos de desarrollo remotos
- **Monitoreo**: Verificación de estado y métricas de servidores

## 📦 Estructura del Proyecto

```
ssh-cli/
├── index.mjs           # Archivo principal del CLI
├── package.json        # Dependencias y configuración
├── docs/              # Documentación
│   ├── README.md
│   ├── commands.md
│   ├── examples.md
│   └── ...
├── process/           # Procesos SSH guardados
│   └── ssh-processes.json
└── logs/              # Logs de ejecución
    └── ssh-log-*.txt
```

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