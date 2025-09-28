# ⚙️ Configuración Avanzada

## 📁 Estructura de Archivos

### Directorios del Sistema

```
ssh-cli/
├── process/           # Procesos SSH guardados
│   └── ssh-processes.json
├── logs/              # Logs de ejecución
│   ├── ssh-log-1695901234567.txt
│   ├── ssh-log-1695901345678.txt
│   └── ...
└── docs/              # Documentación
    ├── README.md
    ├── commands.md
    └── ...
```

### Archivo de Procesos (`process/ssh-processes.json`)

```json
[
  {
    "id": 1695901234567,
    "name": "Deploy Producción",
    "config": {
      "host": "servidor.empresa.com",
      "port": "22",
      "username": "deploy",
      "password": "***"
    },
    "commands": [
      "cd /var/www/app",
      "git pull origin main",
      "sudo systemctl restart nginx"
    ],
    "createdAt": "2025-09-28T10:30:45.123Z"
  }
]
```

## 🔐 Gestión de Contraseñas

### Detección Automática de Prompts

El CLI incluye más de 90 patrones para detectar solicitudes de contraseña:

#### Patrones Sudo
```javascript
{ pattern: /\[sudo\].*password.*for/i, confidence: 95 }
{ pattern: /password.*for.*sudo/i, confidence: 90 }
{ pattern: /sorry.*try.*again/i, confidence: 85 }
{ pattern: /\[sudo\]/i, confidence: 80 }
```

#### Patrones Generales
```javascript
{ pattern: /password.*:/i, confidence: 90 }
{ pattern: /contraseña.*:/i, confidence: 95 }
{ pattern: /enter.*password/i, confidence: 85 }
{ pattern: /password for/i, confidence: 90 }
```

#### Patrones por Comando
- **SSH**: `password:`, `authentication`
- **MySQL**: `enter.*password`
- **PostgreSQL**: `password.*for.*user`
- **Su**: `password:`, `contraseña:`

### Configuración de Timeouts

```javascript
// Timeout para detección automática: 3 segundos
timeoutId = setTimeout(() => {
  if (!responded) {
    sendPassword("Timeout - ");
  }
}, 3000);
```

### Niveles de Confianza

- **95%+**: Envío inmediato de contraseña
- **85-94%**: Envío con análisis adicional
- **75-84%**: Envío con verificación de contexto
- **<75%**: No se envía automáticamente

## 📂 Gestión de Logs

### Formato de Logs

```
=== COMANDO: git pull origin main ===
DIRECTORIO ACTUAL: /var/www/app
COMANDO EJECUTADO: cd /var/www/app && git pull origin main
Already up to date.
=== FIN COMANDO (código: 0) ===

[AUTO-RESPONSE] Contraseña enviada automáticamente (Detectado prompt - confianza: 95%)
```

### Configuración de Logs

- **Ubicación**: `logs/ssh-log-[timestamp].txt`
- **Formato**: Timestamp en milisegundos Unix
- **Contenido**: Comando, directorio, salida completa, códigos de salida
- **Rotación**: Manual (no automática)

### Limpieza de Logs

```bash
# Eliminar logs antiguos (más de 7 días)
find logs/ -name "ssh-log-*.txt" -mtime +7 -delete

# Comprimir logs antiguos
find logs/ -name "ssh-log-*.txt" -mtime +1 -exec gzip {} \;
```

## 🗂️ Gestión de Contexto de Directorios

### Persistencia de Directorios

```javascript
let currentDirectory = "~"; // Directorio inicial

// Para comando cd
if (cmd.trim().startsWith('cd ')) {
  const targetDir = cmd.trim().substring(3).trim();
  if (targetDir.startsWith('/')) {
    currentDirectory = targetDir;           // Ruta absoluta
  } else if (targetDir === '~' || targetDir === '') {
    currentDirectory = '~';                 // Home
  } else {
    // Ruta relativa
    currentDirectory = currentDirectory === '~' 
      ? `~/${targetDir}` 
      : `${currentDirectory}/${targetDir}`;
  }
}

// Para otros comandos
fullCommand = `cd ${currentDirectory} && ${cmd}`;
```

### Comportamiento de Directorios

- **Inicio**: Todos los procesos inician en `~` (home)
- **Comandos cd**: Actualizan el contexto para comandos posteriores
- **Rutas absolutas**: Ignoran el contexto actual
- **Rutas relativas**: Se construyen desde el directorio actual
- **Persistencia**: El contexto se mantiene durante toda la sesión

## 🔧 Configuraciones del Sistema

### Dependencias

```json
{
  "dependencies": {
    "ssh2": "^1.14.0",
    "inquirer": "^9.2.0"
  }
}
```

### Constantes del Sistema

```javascript
const PROCESS_DIR = path.join(process.cwd(), "process");
const LOGS_DIR = path.join(process.cwd(), "logs");
const SSH_DATA_FILE = path.join(PROCESS_DIR, "ssh-processes.json");
```

### Configuración SSH por Defecto

```javascript
{
  host: "servidor.com",
  port: 22,                    // Puerto por defecto
  username: "usuario",
  password: "contraseña",
  pty: true,                   // Pseudo terminal habilitado
  keepaliveInterval: 30000,    // Keep alive cada 30s
  readyTimeout: 20000          // Timeout de conexión: 20s
}
```

## 🎨 Personalización de la Interfaz

### Emojis y Iconos

```javascript
const ICONS = {
  success: '✅',
  error: '❌', 
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳',
  rocket: '🚀',
  folder: '📁',
  file: '📄',
  lock: '🔐',
  gear: '⚙️'
};
```

### Colores y Formato

- **Bordes**: Caracteres Unicode para tablas (╔═╗║╚╝)
- **Separadores**: Líneas de guiones y equals
- **Espaciado**: Consistente en todas las salidas
- **Alineación**: Centrado para títulos, izquierda para contenido

## 🔒 Seguridad

### Almacenamiento de Contraseñas

```json
{
  "config": {
    "password": "***"  // Las contraseñas NO se guardan en texto plano
  }
}
```

- ✅ Las contraseñas **NO** se guardan en los procesos
- ✅ Se solicitan nuevamente en cada ejecución
- ✅ Solo se mantienen en memoria durante la ejecución
- ✅ Los logs **NO** incluyen contraseñas

### Consideraciones de Seguridad

1. **Permisos de archivos**: Los logs pueden contener información sensible
2. **Red**: Las conexiones SSH son cifradas
3. **Memoria**: Las contraseñas se limpian al finalizar
4. **Logs**: Revisar periódicamente por información sensible

## 📊 Variables de Entorno

### Configuraciones Opcionales

```bash
# Directorio personalizado para procesos
export SSH_CLI_PROCESS_DIR="/custom/path/process"

# Directorio personalizado para logs  
export SSH_CLI_LOGS_DIR="/custom/path/logs"

# Nivel de debug
export SSH_CLI_DEBUG=true

# Timeout personalizado (en ms)
export SSH_CLI_TIMEOUT=5000
```

### Uso en el Código

```javascript
const PROCESS_DIR = process.env.SSH_CLI_PROCESS_DIR || path.join(process.cwd(), "process");
const LOGS_DIR = process.env.SSH_CLI_LOGS_DIR || path.join(process.cwd(), "logs");
const DEBUG = process.env.SSH_CLI_DEBUG === 'true';
const TIMEOUT = parseInt(process.env.SSH_CLI_TIMEOUT) || 3000;
```

## 🔧 Personalización Avanzada

### Modificar Patrones de Detección

Para agregar nuevos patrones de contraseña:

```javascript
const customPatterns = [
  { pattern: /custom.*password.*prompt/i, confidence: 90 },
  { pattern: /mi.*patron.*especial/i, confidence: 85 }
];
```

### Configurar Comandos Específicos

```javascript
const customCommandPatterns = {
  'mi-comando': [
    { pattern: /mi.*prompt/i, confidence: 95 }
  ]
};
```

### Templates de Procesos

Crear templates para procesos comunes:

```javascript
const templates = {
  'deploy-web': {
    commands: [
      'cd /var/www/app',
      'git pull origin main', 
      'npm install --production',
      'sudo systemctl restart nginx'
    ]
  }
};
```