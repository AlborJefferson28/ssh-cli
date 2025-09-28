# 🔧 API Reference

## Funciones Principales

### `main()`
Función principal del CLI que maneja el enrutamiento de comandos.

**Flujo de ejecución:**
1. Muestra banner del CLI
2. Procesa argumentos de línea de comandos
3. Ejecuta el comando correspondiente
4. Maneja errores globales

**Comandos soportados:**
- `help` → `showHelp()`
- `list` → `showSshProcessList()`
- `start` → `runSshProcess()`
- `delete` → `deleteSshProcess()`

---

### `runSshProcess(processConfig)`
Función principal para ejecutar procesos SSH.

**Parámetros:**
- `processConfig` (Object|null): Configuración de proceso guardado

**Flujo:**
1. **Configuración**: Solicita datos o usa proceso guardado
2. **Validación**: Verifica credenciales y comandos
3. **Conexión**: Establece conexión SSH
4. **Ejecución**: Ejecuta comandos secuencialmente
5. **Logging**: Registra toda la actividad
6. **Resultado**: Muestra resumen final

**Retorno:**
```javascript
Promise<void>
```

---

### `loadSshProcesses()`
Carga procesos SSH desde el archivo de configuración.

**Retorno:**
```javascript
Array<{
  id: number,
  name: string,
  config: {
    host: string,
    port: string,
    username: string,
    password: string
  },
  commands: string[],
  createdAt: string
}>
```

**Manejo de errores:**
- Crea directorio si no existe
- Retorna array vacío si hay errores
- Maneja archivos JSON malformados

---

### `saveSshProcesses(processes)`
Guarda procesos SSH en el archivo de configuración.

**Parámetros:**
- `processes` (Array): Array de objetos de proceso

**Comportamiento:**
- Crea directorios necesarios automáticamente
- Formatea JSON con indentación de 2 espacios
- Maneja errores de escritura silenciosamente

---

### `deleteSshProcess(processId)`
Elimina un proceso SSH por ID.

**Parámetros:**
- `processId` (number): ID del proceso a eliminar (1-based)

**Validaciones:**
- Verifica que existan procesos
- Valida que el ID esté en rango válido
- Muestra información del proceso antes de eliminar

**Retorno:**
```javascript
boolean // true si se eliminó, false si hubo error
```

---

### `showSshProcessList()`
Muestra lista formateada de procesos SSH guardados.

**Formato de salida:**
```
┌─ ID: 1 ──────────────────────────────────────┐
│ 📝 Nombre: Deploy Producción                  │
│ 🌐 Host: servidor.com:22                      │
│ 👤 Usuario: deploy                            │
│ 📅 Creado: 28/09/25 14:30                    │
│ ⚙️  Comandos: 3 comando(s)                    │
│                                               │
│ 📋 Lista de comandos:                         │
│    1. cd /var/www/app                         │
│    2. git pull origin main                    │
│    3. sudo systemctl restart nginx           │
└───────────────────────────────────────────────┘
```

**Retorno:**
```javascript
Array<Process> // Array de procesos cargados
```

---

### `analyzeStreamOutput(data, command)`
Analiza la salida de comandos SSH para detectar prompts de contraseña.

**Parámetros:**
- `data` (Buffer): Datos recibidos del stream SSH
- `command` (string): Comando que se está ejecutando

**Retorno:**
```javascript
{
  isPasswordPrompt: boolean,
  isSudoPrompt: boolean,
  isGenericPrompt: boolean,
  originalData: string,
  confidence: number  // 0-100
}
```

**Patrones detectados:**
- Prompts de sudo: `[sudo] password for`, `password for sudo`
- Prompts generales: `password:`, `contraseña:`, `enter password`
- Prompts interactivos: `(y/n)`, `continue?`, `press enter`

---

### `getCommandSpecificPatterns(command)`
Obtiene patrones de detección específicos para un comando.

**Parámetros:**
- `command` (string): Comando a analizar

**Retorno:**
```javascript
Array<{
  pattern: RegExp,
  confidence: number
}>
```

**Comandos soportados:**
- `sudo`: Patrones para solicitudes de sudo
- `ssh`: Patrones para autenticación SSH
- `mysql`: Patrones para MySQL
- `psql`: Patrones para PostgreSQL
- `su`: Patrones para cambio de usuario

---

### `createPasswordTimeoutHandler(stream, password, commandName, logStream)`
Crea un manejador de timeout para envío automático de contraseñas.

**Parámetros:**
- `stream` (Stream): Stream SSH activo
- `password` (string): Contraseña a enviar
- `commandName` (string): Nombre del comando para logging
- `logStream` (WriteStream): Stream de logging

**Retorno:**
```javascript
{
  triggerPasswordSend: (reason?: string) => void,
  cancel: () => void,
  isResponded: () => boolean
}
```

**Comportamiento:**
- Timeout por defecto: 3 segundos
- Previene envíos duplicados
- Registra todas las acciones en logs

---

## Estructuras de Datos

### Proceso SSH
```javascript
{
  id: number,                    // Timestamp de creación
  name: string,                  // Nombre descriptivo
  config: {
    host: string,                // Hostname o IP
    port: string,                // Puerto SSH (default: "22")
    username: string,            // Usuario SSH
    password: string             // "***" (no se guarda la real)
  },
  commands: string[],            // Array de comandos
  createdAt: string             // ISO date string
}
```

### Análisis de Stream
```javascript
{
  isPasswordPrompt: boolean,     // Es prompt de contraseña
  isSudoPrompt: boolean,         // Es prompt específico de sudo
  isGenericPrompt: boolean,      // Es prompt interactivo genérico
  originalData: string,          // Datos originales del stream
  confidence: number             // Nivel de confianza (0-100)
}
```

### Configuración de Conexión
```javascript
{
  host: string,                  // Servidor de destino
  port: number,                  // Puerto SSH
  username: string,              // Usuario SSH
  password: string,              // Contraseña
  pty: boolean,                  // Pseudo terminal (true)
  keepaliveInterval: number,     // Keep alive en ms
  readyTimeout: number           // Timeout de conexión
}
```

## Constantes del Sistema

```javascript
const PROCESS_DIR = path.join(process.cwd(), "process");
const LOGS_DIR = path.join(process.cwd(), "logs");  
const SSH_DATA_FILE = path.join(PROCESS_DIR, "ssh-processes.json");
```

## Patrones de Detección

### Patrones Sudo (Confianza Alta)
```javascript
[
  { pattern: /\[sudo\].*password.*for/i, confidence: 95 },
  { pattern: /password.*for.*sudo/i, confidence: 90 },
  { pattern: /sorry.*try.*again/i, confidence: 85 },
  { pattern: /\[sudo\]/i, confidence: 80 }
]
```

### Patrones Generales
```javascript
[
  { pattern: /password.*:/i, confidence: 90 },
  { pattern: /contraseña.*:/i, confidence: 95 },
  { pattern: /enter.*password/i, confidence: 85 },
  { pattern: /password for/i, confidence: 90 },
  { pattern: /authentication.*password/i, confidence: 80 },
  { pattern: /please.*enter.*password/i, confidence: 85 },
  { pattern: /password\?/i, confidence: 75 }
]
```

## Flujo de Ejecución de Comandos

### 1. Preparación
```javascript
// Contexto de directorio
let currentDirectory = "~";

// Si es comando cd
if (cmd.trim().startsWith('cd ')) {
  // Actualizar contexto
  currentDirectory = newDirectory;
  fullCommand = `cd ${currentDirectory} && pwd`;
} else {
  // Ejecutar en contexto actual
  fullCommand = `cd ${currentDirectory} && ${cmd}`;
}
```

### 2. Ejecución
```javascript
conn.exec(fullCommand, { pty: true }, (err, stream) => {
  // Crear handler de contraseñas
  const passwordHandler = createPasswordTimeoutHandler(...);
  
  stream.on('data', (data) => {
    // Analizar output
    const analysis = analyzeStreamOutput(data, cmd);
    
    // Decidir si enviar contraseña
    if (analysis.confidence >= 75) {
      passwordHandler.triggerPasswordSend();
    }
  });
  
  stream.on('close', (code) => {
    // Logging y cleanup
    passwordHandler.cancel();
    logOutput(cmd, output, code);
  });
});
```

### 3. Logging
```javascript
logStream.write(`\n=== COMANDO: ${cmd} ===\n`);
logStream.write(`DIRECTORIO ACTUAL: ${currentDirectory}\n`);
logStream.write(`COMANDO EJECUTADO: ${fullCommand}\n`);
logStream.write(output);
logStream.write(`\n=== FIN COMANDO (código: ${code}) ===\n\n`);
```

## Manejo de Errores

### Errores de Conexión
```javascript
conn.on('error', (err) => {
  console.error("❌ Error de conexión:", err);
  logStream.write(`ERROR DE CONEXIÓN: ${err}\n`);
  logStream.end();
  resolve();
});
```

### Errores de Comando
```javascript
conn.exec(fullCommand, (err, stream) => {
  if (err) {
    console.error(`❌ Error ejecutando ${commandName}:`, err);
    logStream.write(`ERROR en ${cmd}: ${err}\n`);
    taskStatuses[i] = '❌';
    return;
  }
  // ... continuar ejecución
});
```

### Validaciones de Entrada
```javascript
// Validar ID de proceso
if (isNaN(processId) || processId <= 0) {
  console.log("❌ ID de proceso inválido. Debe ser un número mayor a 0.");
  return;
}

// Validar que proceso existe
if (processIndex < 0 || processIndex >= processes.length) {
  console.log("❌ ID de proceso inválido. Usa 'list' para ver los procesos disponibles.");
  return false;
}
```

## Formato de Logs

### Estructura de Log
```
=== COMANDO: [comando] ===
DIRECTORIO ACTUAL: [directorio]
COMANDO EJECUTADO: [comando_completo]
[output_del_comando]
[AUTO-RESPONSE] [mensaje_de_auto_respuesta]
=== FIN COMANDO (código: [exit_code]) ===
```

### Ejemplo de Log Completo
```
=== COMANDO: sudo systemctl restart nginx ===
DIRECTORIO ACTUAL: /var/www/app
COMANDO EJECUTADO: cd /var/www/app && sudo systemctl restart nginx
[sudo] password for deploy: 
[AUTO-RESPONSE] Contraseña enviada automáticamente (Detectado prompt - confianza: 95%)
=== FIN COMANDO (código: 0) ===
```