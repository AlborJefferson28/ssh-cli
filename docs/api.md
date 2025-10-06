# 🔧 API Reference

## Funciones Principales

### `main()`
Función principal del CLI que maneja el enrutamiento de comandos y modo interactivo.

**Flujo de ejecución:**
1. Limpia pantalla para comandos CLI (con argumentos)
2. Muestra banner del CLI
3. Detecta modo de operación (interactivo vs CLI)
4. Procesa argumentos de línea de comandos o inicia modo interactivo
5. Ejecuta el comando correspondiente
6. Maneja errores globales

**Comandos soportados:**
- `(sin argumentos)` → `showInteractiveMenu()` **[NUEVO]**
- `help` → `showHelp()`
- `list` → `showSshProcessList()` **[ACTUALIZADO]**
- `start` → `runSshProcess()` **[ACTUALIZADO]**
- `start -h <host_id> -p <posición>` → Nuevo método de selección **[NUEVO]**
- `delete` → `deleteSshProcess()`

---

### `showInteractiveMenu()` **[NUEVO]**
Función principal del modo interactivo con navegación completa.

**Funcionalidades:**
- Menú principal con pantalla limpia
- Navegación visual con inquirer.js
- Opciones organizadas por función
- Limpieza automática de pantalla en transiciones

**Opciones del menú:**
```javascript
[
  { name: "📋 Navegar procesos SSH por host", value: "list" },
  { name: "🚀 Crear nuevo proceso SSH", value: "create" },
  { name: "▶️  Ejecutar proceso (selección rápida)", value: "execute" },
  { name: "🗑️  Eliminar proceso", value: "delete" },
  { name: "📊 Ver estadísticas", value: "stats" },
  { name: "🆘 Ver ayuda", value: "help" },
  { name: "🚪 Salir", value: "exit" }
]
```

**Retorno:**
```javascript
Promise<void>
```

---

### `showInteractiveHostNavigation()` **[NUEVO]**
Navegación jerárquica de hosts y procesos con interfaz visual.

**Flujo de navegación:**
1. **Nivel 1**: Lista de hosts agrupados con conteo de procesos
2. **Nivel 2**: Procesos específicos del host seleccionado
3. **Nivel 3**: Detalles completos del proceso seleccionado

**Características:**
- Pantallas limpias en cada transición
- Navegación bidireccional (adelante/atrás)
- Información contextual en cada nivel
- Opciones de salida en cualquier momento

**Retorno:**
```javascript
Promise<void>
```

---

### `navigateHostProcesses(hostName, hostProcesses)` **[NUEVO]**
Navega procesos específicos de un host seleccionado.

**Parámetros:**
- `hostName` (string): Nombre del host seleccionado
- `hostProcesses` (Array): Procesos filtrados del host

**Comportamiento:**
- Limpia pantalla antes de mostrar
- Muestra información del host actual
- Lista procesos con conteo de comandos
- Permite volver a lista de hosts

---

### `showProcessDetails(process, hostName)` **[NUEVO]**
Muestra detalles completos de un proceso específico.

**Parámetros:**
- `process` (Object): Objeto del proceso SSH
- `hostName` (string): Nombre del host contenedor

**Información mostrada:**
```javascript
{
  nombre: string,
  host: string,
  servidor: "host:puerto",
  usuario: string,
  fechaCreacion: "dd/mm/aa hh:mm",
  comandos: number,
  listaComandos: string[]
}
```

**Opciones:**
- Ejecutar proceso inmediatamente
- Volver a lista de procesos

---

### `executeInteractiveProcess()` **[NUEVO]**
Ejecución rápida de procesos con selección visual.

**Flujo:**
1. Selección de host desde lista visual
2. Selección de proceso del host elegido
3. Vista previa de información del proceso
4. Confirmación de ejecución

**Características:**
- Pantallas dedicadas para cada paso
- Información contextual completa
- Confirmación antes de ejecutar

---

### `deleteInteractiveProcess()` **[NUEVO]**
Eliminación segura de procesos con confirmación visual.

**Flujo:**
1. Lista visual de todos los procesos
2. Selección del proceso a eliminar
3. Vista previa de información del proceso
4. Confirmación de eliminación
5. Confirmación visual de éxito/cancelación

**Validaciones:**
- Opción de cancelar en cualquier momento
- Información completa antes de eliminar
- Confirmación obligatoria

---

### `runSshProcess(processConfig)` **[ACTUALIZADO]**
Función principal para ejecutar procesos SSH con mejoras visuales.

**Parámetros:**
- `processConfig` (Object|null): Configuración de proceso guardado

**Nuevas características:**
- **📋 Flujo de configuración inteligente**: Detección automática de hosts existentes
- **🌐 Host como primer input**: Optimiza la experiencia de configuración
- **🔍 Detección automática**: Verifica inmediatamente si el host existe
- **📊 Valores contextuales**: Pre-completa datos para hosts conocidos
- **🏷️ Nombres inteligentes**: Solo solicita nombre de host si es nuevo
- **🧹 Pantallas dedicadas**: Banner específico para cada etapa
- **🎯 Wizard visual**: Configuración paso a paso con pantallas limpias
- **📈 Progreso visual**: Indicadores durante la configuración
- **✅ Confirmaciones mejoradas**: Pantallas de éxito/guardado
- **💡 Sugerencias inteligentes**: Autocompletado de comandos comunes

**Flujo mejorado con detección inteligente:**
1. **Pantalla de Creación**: Banner específico + solicitud de host remoto (primer input)
2. **Detección de Host**: Verificación automática si el host ya existe
3. **Configuración Contextual**: 
   - Host nuevo: Solicita nombre + configuración completa
   - Host existente: Pre-completa puerto/usuario + solo solicita contraseña
4. **Pantalla de Comandos**: Wizard con información contextual del host
5. **Pantalla de Guardado**: Resumen con estadísticas del host
6. **Pantalla de Ejecución**: Resumen final y confirmación
7. **Ejecución**: Progreso en tiempo real con pantalla limpia

**Retorno:**
```javascript
Promise<void>
```

---

### `showSshProcessList()` **[ACTUALIZADO]**
Muestra lista de procesos SSH **agrupados por host** con nuevo formato.

**Nuevo formato de salida:**
```
📋 Procesos SSH Guardados (Agrupados por Host)
═══════════════════════════════════════════════════════
🏠 HOST ID: 1 | NOMBRE: Servidor Producción
📊 Total de procesos: 2
    1. Deploy Frontend
    2. Deploy Backend

🏠 HOST ID: 2 | NOMBRE: Servidor Testing
📊 Total de procesos: 1
    1. Test Automation

💡 Uso: ssh-cli start -h <host_id> -p <posición> para ejecutar un proceso
```

**Cambios principales:**
- **Agrupación por host**: Organización automática por `hostName`
- **Host ID**: Identificadores numéricos para selección
- **Conteo de procesos**: Total por host
- **Formato simplificado**: Información esencial y clara
- **Instrucciones de uso**: Método recomendado de selección

**Retorno:**
```javascript
{
  processes: Array<Process>,
  groupedByHost: Object<string, Array<Process>>,
  hostEntries: Array<[string, Array<Process>]>
}
```

---

### `showProcessStatistics()` **[NUEVO EN MODO INTERACTIVO]**
Estadísticas detalladas de procesos con agrupación por host.

**Información mostrada:**
- Total de procesos
- Hosts únicos
- Total de comandos
- Promedio de comandos por proceso
- Desglose detallado por host

**Formato de salida:**
```
📊 Estadísticas de Procesos SSH
══════════════════════════════════════════════════════
📝 Total de procesos: 5
🏠 Hosts únicos: 3
⚙️  Total de comandos: 23
📊 Promedio de comandos por proceso: 4.6

📋 Desglose por host:
  🏠 Servidor Producción
     📝 Procesos: 2
     ⚙️  Comandos: 12
     🌐 Servidores: prod.empresa.com:22
```

---

### `waitForKeyPress()` **[ACTUALIZADO]**
Función mejorada para pausar ejecución con separador visual.

**Nuevo formato:**
```javascript
console.log("\n" + "─".repeat(50));
await inquirer.prompt([{
  type: "input",
  name: "continue", 
  message: "Presiona Enter para continuar..."
}]);
```

---

## Nuevas Funciones de Utilidad

### `ensureDirectories()` **[MEJORADO]**
Crea directorios necesarios con manejo de errores.

### Console Management **[NUEVO]**
- **`console.clear()`**: Limpieza automática de pantalla
- **Banners contextuales**: Headers específicos para cada operación
- **Separadores visuales**: Mejora de la legibilidad

---

## Estructuras de Datos Actualizadas

### Proceso SSH **[ACTUALIZADO]**
```javascript
{
  id: number,                    // Timestamp de creación
  name: string,                  // Nombre descriptivo del proceso
  config: {
    host: string,                // Hostname o IP
    port: string,                // Puerto SSH (default: "22")
    username: string,            // Usuario SSH
    password: string,            // "***" (no se guarda la real)
    hostName: string             // NUEVO: Nombre del host para agrupación
  },
  commands: string[],            // Array de comandos
  createdAt: string             // ISO date string
}
```

### Agrupación por Host **[NUEVO]**
```javascript
{
  [hostName: string]: Array<{
    ...Process,
    originalIndex: number        // Índice original en el array completo
  }>
}
```

### Flujo de Detección de Host **[NUEVO]**
```javascript
// 1. Input del host
const { host } = await inquirer.prompt([
  { 
    type: "input", 
    name: "host", 
    message: "🌐 Host remoto:",
    validate: (input) => hostValidation(input)
  }
]);

// 2. Búsqueda de host existente
const existingProcesses = loadSshProcesses();
const existingHost = existingProcesses.find(
  proc => proc.config.host === host.trim()
);

// 3. Flujo condicional
if (existingHost) {
  // Host existe: usar datos existentes
  hostName = existingHost.config.hostName;
  defaultPort = existingHost.config.port;
  defaultUsername = existingHost.config.username;
} else {
  // Host nuevo: solicitar configuración completa
  const hostNameInput = await inquirer.prompt([...]);
  hostName = hostNameInput.hostName.trim();
}
```

### Opciones de Menú Interactivo **[NUEVO]**
```javascript
{
  name: string,                  // Texto mostrado al usuario
  value: string,                 // Valor interno para switch
  short?: string                 // Texto corto para confirmación
}
```

---

## Constantes del Sistema **[ACTUALIZADAS]**

```javascript
const PROCESS_DIR = path.join(process.cwd(), "process");
const LOGS_DIR = path.join(process.cwd(), "logs");  
const SSH_DATA_FILE = path.join(PROCESS_DIR, "ssh-processes.json");

// Nuevas validaciones
const MIN_HOST_NAME_LENGTH = 3;
const DEFAULT_SSH_PORT = "22";
const PASSWORD_MASK = "*";
```

---

## Flujo de Selección por Host ID **[NUEVO]**

### Comando CLI: `start -h <host_id> -p <posición>`

```javascript
// 1. Validar parámetros
const hostId = parseInt(args[hostFlag + 1]);
const position = parseInt(args[processIdFlag + 1]) - 1;

// 2. Cargar y agrupar procesos
const processes = loadSshProcesses();
const groupedByHost = groupProcessesByHost(processes);
const hostEntries = Object.entries(groupedByHost);

// 3. Validar host ID
const hostIndex = hostId - 1;
if (hostIndex < 0 || hostIndex >= hostEntries.length) {
  // Error: Host no encontrado
}

// 4. Validar posición
const [hostName, hostProcesses] = hostEntries[hostIndex];
if (position < 0 || position >= hostProcesses.length) {
  // Error: Posición inválida
}

// 5. Ejecutar proceso seleccionado
const selectedProcess = hostProcesses[position];
await runSshProcess(selectedProcess);
```

---

## Validaciones Mejoradas **[ACTUALIZADAS]**

### Validación de Host Name **[NUEVO]**
```javascript
validate: (input) => {
  if (!input.trim()) return "El nombre del host es obligatorio";
  if (input.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
  return true;
}
```

### Validación de Host Remoto **[MEJORADO]**
```javascript
validate: (input) => {
  if (!input.trim()) return "El host es obligatorio";
  const hostRegex = /^[a-zA-Z0-9.-]+$/;
  if (!hostRegex.test(input.trim())) {
    return "Formato de host inválido. Usa solo letras, números, puntos y guiones.";
  }
  return true;
}
```

### Validación de Puerto **[MEJORADO]**
```javascript
validate: (input) => {
  const port = parseInt(input);
  if (isNaN(port) || port < 1 || port > 65535) {
    return "Puerto inválido. Debe ser un número entre 1 y 65535.";
  }
  return true;
}
```

---

## Sugerencias Inteligentes **[NUEVO]**

### Transformer para Comandos
```javascript
transformer: (input) => {
  const suggestions = [
    'ls -la', 'cd ~', 'pwd', 'ps aux', 'df -h', 'free -h', 
    'systemctl status', 'git status', 'git pull', 'npm install',
    'sudo systemctl restart', 'tail -f /var/log/', 'htop',
    'docker ps', 'docker logs', 'sudo apt update'
  ];
  
  const matched = suggestions.find(s => s.startsWith(input.toLowerCase()));
  if (matched && input.length > 2) {
    return `${input} (sugerencia: ${matched})`;
  }
  return input;
}
```

---

## Manejo de Errores Mejorado **[ACTUALIZADO]**

### Errores de Selección por Host ID **[NUEVO]**
```javascript
// Host ID inválido
if (isNaN(hostId) || hostId <= 0) {
  console.log("❌ ID de host inválido. Debe ser un número mayor a 0.");
  console.log("💡 Usa 'ssh-cli list' para ver los IDs de host disponibles.");
  return;
}

// Host no encontrado
if (hostIndex < 0 || hostIndex >= hostEntries.length) {
  console.log(`❌ No se encontró el host con ID "${hostId}".`);
  console.log(`💡 Hay ${hostEntries.length} host(s) disponible(s).`);
  console.log("💡 Usa 'ssh-cli list' para ver los IDs de host disponibles.");
  return;
}

// Posición inválida
if (position < 0 || position >= hostProcesses.length) {
  console.log(`❌ Posición inválida para el host ID "${hostId}" (${hostName}).`);
  console.log(`💡 El host "${hostName}" tiene ${hostProcesses.length} proceso(s).`);
  console.log("💡 Usa 'ssh-cli list' para ver las posiciones disponibles.");
  return;
}
```

### Comando No Reconocido **[MEJORADO]**
```javascript
// Limpieza de pantalla + mensaje + modo interactivo automático
console.clear();
console.log(`⚠️  Comando '${command}' no reconocido.`);
console.log(`💡 Iniciando modo interactivo...\n`);
await showInteractiveMenu();
```

---

## Formato de Logs **[ACTUALIZADO]**

### Estructura de Log con Contexto de Host
```
=== COMANDO: [comando] ===
HOST: [nombre_del_host]
DIRECTORIO ACTUAL: [directorio]
COMANDO EJECUTADO: [comando_completo]
[output_del_comando]
[AUTO-RESPONSE] [mensaje_de_auto_respuesta]
=== FIN COMANDO (código: [exit_code]) ===
```

### Ejemplo de Log Completo con Host
```
=== COMANDO: sudo systemctl restart nginx ===
HOST: Servidor Producción
DIRECTORIO ACTUAL: /var/www/app
COMANDO EJECUTADO: cd /var/www/app && sudo systemctl restart nginx
[sudo] password for deploy: 
[AUTO-RESPONSE] Contraseña enviada automáticamente (Detectado prompt - confianza: 95%)
=== FIN COMANDO (código: 0) ===
```

---

## Dependencias **[ACTUALIZADAS]**

```json
{
  "dependencies": {
    "ssh2": "^1.x.x",
    "inquirer": "^9.x.x"
  }
}
```

**Nuevas dependencias:**
- **inquirer**: Para interfaz interactiva completa con navegación visual