#!/usr/bin/env node

import { Client } from "ssh2";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";
import readline from "readline";

const PROCESS_DIR = path.join(process.cwd(), "process");
const LOGS_DIR = path.join(process.cwd(), "logs");
const SSH_DATA_FILE = path.join(PROCESS_DIR, "ssh-processes.json");

// Crear directorios si no existen
function ensureDirectories() {
  if (!fs.existsSync(PROCESS_DIR)) {
    fs.mkdirSync(PROCESS_DIR, { recursive: true });
  }
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

// Cargar procesos SSH guardados
function loadSshProcesses() {
  try {
    ensureDirectories();
    if (fs.existsSync(SSH_DATA_FILE)) {
      const data = fs.readFileSync(SSH_DATA_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error cargando procesos SSH:", err);
  }
  return [];
}

// Guardar procesos SSH
function saveSshProcesses(processes) {
  try {
    ensureDirectories();
    fs.writeFileSync(SSH_DATA_FILE, JSON.stringify(processes, null, 2));
  } catch (err) {
    console.error("Error guardando procesos SSH:", err);
  }
}

// Eliminar proceso SSH por ID
function deleteSshProcess(processId) {
  const processes = loadSshProcesses();
  
  if (processes.length === 0) {
    console.log("📭 No hay procesos SSH guardados para eliminar.");
    return false;
  }

  const processIndex = processId - 1;
  
  if (processIndex < 0 || processIndex >= processes.length) {
    console.log("❌ ID de proceso inválido. Usa 'list' para ver los procesos disponibles.");
    return false;
  }

  const processToDelete = processes[processIndex];
  console.log(`\n🗑️  Eliminando proceso:`);
  console.log(`┌─ Proceso a eliminar ─────────────────────────────────────────────┐`);
  console.log(`│ 📝 Nombre: ${processToDelete.name || `Proceso ${processId}`}`);
  console.log(`│ 🌐 Host: ${processToDelete.config.host}:${processToDelete.config.port}`);
  console.log(`│ 👤 Usuario: ${processToDelete.config.username}`);
  console.log(`│ ⚙️  Comandos: ${processToDelete.commands.length} comando(s)`);
  console.log(`└──────────────────────────────────────────────────────────────────┘`);

  // Eliminar el proceso del array
  processes.splice(processIndex, 1);
  
  // Guardar la lista actualizada
  saveSshProcesses(processes);
  
  console.log(`\n✅ Proceso eliminado exitosamente.`);
  console.log(`📊 Procesos restantes: ${processes.length}`);
  
  return true;
}

// Mostrar lista de procesos SSH agrupados por host
function showSshProcessList() {
  const processes = loadSshProcesses();
  
  if (processes.length === 0) {
    console.log("\n📭 No hay procesos SSH guardados.");
    return processes;
  }

  // Agrupar procesos por host
  const groupedByHost = {};
  processes.forEach((proc, originalIndex) => {
    const hostName = proc.config.hostName || 'Sin nombre de host';
    if (!groupedByHost[hostName]) {
      groupedByHost[hostName] = [];
    }
    groupedByHost[hostName].push({
      ...proc,
      originalIndex: originalIndex
    });
  });

  console.log("\n📋 Procesos SSH Guardados (Agrupados por Host)");
  console.log("═".repeat(55));
  
  const hostEntries = Object.entries(groupedByHost);
  hostEntries.forEach(([hostName, hostProcesses], hostIndex) => {
    const hostId = hostIndex + 1;
    console.log(`🏠 HOST ID: ${hostId} | NOMBRE: ${hostName}`);
    console.log(`📊 Total de procesos: ${hostProcesses.length}`);
    
    hostProcesses.forEach((proc, processIndex) => {
      console.log(`\t${processIndex + 1}. ${proc.name || `Proceso ${proc.originalIndex + 1}`}`);
    });
    console.log(""); // Línea en blanco entre hosts
  });
  
  console.log(`💡 Uso: ssh-cli start -h <host_id> -p <posición> para ejecutar un proceso`);
  console.log(`📁 Procesos guardados en: ./process/`);
  console.log(`📁 Logs guardados en: ./logs/`);
  
  return { processes, groupedByHost, hostEntries };
}

// Mostrar estadísticas de procesos
function showProcessStatistics() {
  const processes = loadSshProcesses();
  
  if (processes.length === 0) {
    console.log("\n📭 No hay procesos SSH guardados.");
    return;
  }

  // Agrupar por host
  const groupedByHost = {};
  let totalCommands = 0;
  
  processes.forEach((proc) => {
    const hostName = proc.config.hostName || 'Sin nombre de host';
    if (!groupedByHost[hostName]) {
      groupedByHost[hostName] = {
        count: 0,
        commands: 0,
        hosts: new Set()
      };
    }
    groupedByHost[hostName].count++;
    groupedByHost[hostName].commands += proc.commands.length;
    groupedByHost[hostName].hosts.add(`${proc.config.host}:${proc.config.port}`);
    totalCommands += proc.commands.length;
  });

  console.log("\n📊 Estadísticas de Procesos SSH");
  console.log("═".repeat(60));
  console.log(`📝 Total de procesos: ${processes.length}`);
  console.log(`🏠 Hosts únicos: ${Object.keys(groupedByHost).length}`);
  console.log(`⚙️  Total de comandos: ${totalCommands}`);
  console.log(`📊 Promedio de comandos por proceso: ${(totalCommands / processes.length).toFixed(1)}`);
  
  console.log("\n📋 Desglose por host:");
  Object.entries(groupedByHost).forEach(([hostName, stats]) => {
    console.log(`  🏠 ${hostName}`);
    console.log(`     📝 Procesos: ${stats.count}`);
    console.log(`     ⚙️  Comandos: ${stats.commands}`);
    console.log(`     🌐 Servidores: ${Array.from(stats.hosts).join(', ')}`);
  });
}

// Función para obtener nombre completo del comando (sin acortar)
function getShortCommandName(cmd) {
  return cmd.trim(); // Retornar el comando completo sin acortar
}

// Función mejorada para detectar solicitud de contraseña
function detectPasswordPrompt(data) {
  const str = data.toString().toLowerCase();
  
  // Patrones más completos para detectar solicitud de contraseña
  const passwordPatterns = [
    /password.*:/i,
    /contraseña.*:/i,
    /\[sudo\].*password/i,
    /password for/i,
    /enter.*password/i,
    /sudo.*password/i,
    /authentication.*password/i,
    /password.*required/i,
    /please.*enter.*password/i,
    /\[sudo\]/i,
    /password\?/i,
    /enter.*passphrase/i,
    /passphrase.*for/i,
    /sorry.*try.*again/i
  ];
  
  return passwordPatterns.some(pattern => pattern.test(str));
}

// Función mejorada para detectar diferentes tipos de prompts
function analyzeStreamOutput(data, command) {
  const str = data.toString();
  const lowerStr = str.toLowerCase();
  const analysis = {
    isPasswordPrompt: false,
    isSudoPrompt: false,
    isGenericPrompt: false,
    originalData: str,
    confidence: 0
  };
  
  // Detectar prompts de sudo específicamente
  if (command.toLowerCase().includes('sudo')) {
    const sudoPatterns = [
      { pattern: /\[sudo\].*password.*for/i, confidence: 95 },
      { pattern: /password.*for.*sudo/i, confidence: 90 },
      { pattern: /sorry.*try.*again/i, confidence: 85 },  // Para intentos fallidos
      { pattern: /\[sudo\]/i, confidence: 80 }
    ];
    
    for (const { pattern, confidence } of sudoPatterns) {
      if (pattern.test(str)) {
        analysis.isSudoPrompt = true;
        analysis.confidence = Math.max(analysis.confidence, confidence);
        break;
      }
    }
  }
  
  // Detectar cualquier tipo de solicitud de contraseña con niveles de confianza
  const passwordPatterns = [
    { pattern: /password.*:/i, confidence: 90 },
    { pattern: /contraseña.*:/i, confidence: 95 },
    { pattern: /enter.*password/i, confidence: 85 },
    { pattern: /password for/i, confidence: 90 },
    { pattern: /authentication.*password/i, confidence: 80 },
    { pattern: /please.*enter.*password/i, confidence: 85 },
    { pattern: /password\?/i, confidence: 75 }
  ];
  
  for (const { pattern, confidence } of passwordPatterns) {
    if (pattern.test(str)) {
      analysis.isPasswordPrompt = true;
      analysis.confidence = Math.max(analysis.confidence, confidence);
      break;
    }
  }
  
  // Detectar otros tipos de prompts interactivos
  const promptPatterns = [
    /\(y\/n\)/i,
    /yes.*no/i,
    /continue\?/i,
    /press.*enter/i,
    /.*\?\s*$/
  ];
  analysis.isGenericPrompt = promptPatterns.some(pattern => pattern.test(str));
  
  return analysis;
}

// Función para detectar patrones específicos por comando
function getCommandSpecificPatterns(command) {
  const patterns = {
    sudo: [
      { pattern: /\[sudo\]/i, confidence: 90 },
      { pattern: /password.*for/i, confidence: 85 }
    ],
    ssh: [
      { pattern: /password:/i, confidence: 90 },
      { pattern: /authentication/i, confidence: 70 }
    ],
    su: [
      { pattern: /password:/i, confidence: 90 },
      { pattern: /contraseña:/i, confidence: 95 }
    ],
    mysql: [
      { pattern: /enter.*password/i, confidence: 90 }
    ],
    psql: [
      { pattern: /password.*for.*user/i, confidence: 90 }
    ]
  };
  
  for (const [cmd, cmdPatterns] of Object.entries(patterns)) {
    if (command.toLowerCase().includes(cmd)) {
      return cmdPatterns;
    }
  }
  
  // Patrones generales si no se encuentra un comando específico
  return [
    { pattern: /password/i, confidence: 70 },
    { pattern: /contraseña/i, confidence: 80 }
  ];
}

// Función para mostrar estado de progreso de forma consistente
function displayTaskProgress(host, totalTasks, commandList, taskStatuses, currentIndex = -1) {
  console.clear();
  console.log(`✅ Conectado a ${host}`);
  console.log(`📝 Ejecutando ${totalTasks} tarea(s)...\n`);
  
  // Mostrar progreso de todas las tareas de forma limpia
  commandList.forEach((c, idx) => {
    let status;
    if (idx < currentIndex) {
      status = taskStatuses[idx] || '✅';
    } else if (idx === currentIndex) {
      status = '⏳';
    } else {
      status = '⏳';
    }
    console.log(`  ${status} ${idx + 1}. ${c}`);
  });
  
  console.log(""); // Línea en blanco antes del loader
}

// Función para mostrar loader animado para procesos paralelos
function createLoader(message) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let frameIndex = 0;
  let active = true;
  
  const interval = setInterval(() => {
    if (!active) return;
    
    process.stdout.write(`\r${frames[frameIndex]} ${message}`);
    frameIndex = (frameIndex + 1) % frames.length;
  }, 100);
  
  return {
    stop: (finalMessage = '') => {
      active = false;
      clearInterval(interval);
      if (finalMessage) {
        process.stdout.write(`\r${finalMessage}\n`);
      } else {
        process.stdout.write(`\r${''.padEnd(message.length + 2)}\r`);
      }
    },
    update: (newMessage) => {
      message = newMessage;
    }
  };
}

// Función para mostrar contador dinámico en selección interactiva
function createCountdownSelector(message, timeSeconds, callback) {
  let remainingTime = timeSeconds;
  let cancelled = false;
  
  const updateDisplay = () => {
    if (cancelled) return;
    
    process.stdout.write(`\r📋 ${message} (${remainingTime})`);
    
    if (remainingTime <= 0) {
      process.stdout.write('\n');
      if (!cancelled) callback();
      return;
    }
    
    remainingTime--;
    setTimeout(updateDisplay, 1000);
  };
  
  updateDisplay();
  
  return {
    cancel: () => {
      cancelled = true;
      process.stdout.write('\n');
    }
  };
}

// Función para manejar selección interactiva con contador para comandos paralelos
async function handleParallelCommandChoice(cmd, remainingCommands) {
  console.log(`\n⚠️  Ejecución en primer plano detectada: ${cmd}`);
  
  // Si hay comandos siguientes, mostrar contador automático
  const hasRemainingCommands = remainingCommands && remainingCommands.length > 0;
  
  if (hasRemainingCommands) {
    console.log(`📋 Comandos restantes: ${remainingCommands.length}`);
    console.log(`⏰ Selección automática en 45 segundos...`);
    
    let autoSelectTime = 45;
    let userSelected = false;
    
    // Mostrar contador dinámico
    const countdownInterval = setInterval(() => {
      if (userSelected) {
        clearInterval(countdownInterval);
        return;
      }
      
      process.stdout.write(`\r⏰ Auto-selección en: ${autoSelectTime}s - Presiona cualquier tecla para elegir manualmente`);
      autoSelectTime--;
      
      if (autoSelectTime <= 0) {
        clearInterval(countdownInterval);
        if (!userSelected) {
          process.stdout.write('\n🔗 Tiempo agotado, ejecutando en modo paralelo automáticamente...\n');
          return;
        }
      }
    }, 1000);
    
    // Configurar listener para detectar input del usuario
    let keyPressed = false;
    const originalRawMode = process.stdin.isRaw;
    
    const keyListener = () => {
      if (!keyPressed) {
        keyPressed = true;
        userSelected = true;
        clearInterval(countdownInterval);
        process.stdout.write('\n');
        
        // Restaurar modo del terminal
        if (originalRawMode !== undefined) {
          process.stdin.setRawMode(originalRawMode);
        }
        process.stdin.removeListener('data', keyListener);
        
        // Mostrar opciones interactivas
        showInteractiveChoices().then(resolve);
      }
    };
    
    // Configurar terminal para detectar teclas
    if (process.stdin.setRawMode) {
      process.stdin.setRawMode(true);
    }
    process.stdin.resume();
    process.stdin.on('data', keyListener);
    
    // Función para mostrar opciones interactivas
    const showInteractiveChoices = async () => {
      const { longRunningAction } = await inquirer.prompt([
        {
          type: "list",
          name: "longRunningAction",
          message: "¿Cómo deseas manejar este comando?",
          choices: [
            {
              name: "🔗 Ejecutar y crear conexión paralela cuando esté listo (RECOMENDADO)",
              value: "parallel"
            },
            {
              name: "⏭️  Saltar este comando",
              value: "skip"
            },
            {
              name: "🔧 Ejecutar y entrar en modo debug",
              value: "debug"
            },
            {
              name: "⏸️  Ejecutar y esperar (puede congelarse)",
              value: "wait"
            }
          ],
          default: "parallel"
        }
      ]);
      
      return longRunningAction;
    };
    
    return new Promise((resolve) => {
      // Si el usuario no presiona nada, auto-seleccionar después del countdown
      setTimeout(() => {
        if (!userSelected) {
          userSelected = true;
          clearInterval(countdownInterval);
          
          // Limpiar listeners
          process.stdin.removeListener('data', keyListener);
          if (originalRawMode !== undefined) {
            process.stdin.setRawMode(originalRawMode);
          }
          
          resolve("parallel");
        }
      }, 45000);
    });
  } else {
    // Si no hay comandos restantes, mostrar opciones normalmente
    const { longRunningAction } = await inquirer.prompt([
      {
        type: "list",
        name: "longRunningAction",
        message: "¿Cómo deseas manejar este comando?",
        choices: [
          {
            name: "🔗 Ejecutar y crear conexión paralela cuando esté listo",
            value: "parallel"
          },
          {
            name: "⏭️  Saltar este comando",
            value: "skip"
          },
          {
            name: "🔧 Ejecutar y entrar en modo debug",
            value: "debug"
          },
          {
            name: "⏸️  Ejecutar y esperar (puede congelarse)",
            value: "wait"
          }
        ],
        default: "parallel"
      }
    ]);
    
    return longRunningAction;
  }
}

// Función para detectar comandos de larga duración que NO necesitan timeout automático
function isLongRunningCommand(command) {
  const longRunningPatterns = [
    /\bnpm\s+run\s+dev\b/i,
    /\bnpm\s+run\s+start\b/i,
    /\bnpm\s+start\b/i,
    /\byarn\s+dev\b/i,
    /\byarn\s+start\b/i,
    /\bpnpm\s+run\s+dev\b/i,
    /\bbun\s+run\b/i,
    /\bdeno\s+run\b/i,
    /\bng\s+serve\b/i,
    /\bnode\b.*\bserver\b/i,
    /\bnodemon\b/i,
    /\bwebpack.*serve\b/i,
    /\bvite\b/i,
    /\bnext\s+(dev|start)\b/i,
    /\bnuxt\s+dev\b/i,
    /\bgatsby\s+develop\b/i,
    /\bserve\s+-s\b/i,
    /\bhttp-server\b/i,
    /\blive-server\b/i,
    /\bphp\s+artisan\s+serve\b/i,
    /\brails\s+server\b/i,
    /\bpython\b.*\bmanage\.py\b.*\brunserver\b/i,
    /\bflask\s+run\b/i,
    /\buvicorn\b/i,
    /\bgunicorn\b/i,
    /\bstreamlit\s+run\b/i,
    /\bjupyter\s+(notebook|lab)\b/i,
    /\bcloudflared\s+tunnel\b/i,
    /\bngrok\b/i,
    /\bdocker(-compose|\s+compose)?\b.*\bup\b/i,
    /--watch\b/i,
    /\btail\s+-f\b/i,
    /\bpm2\s+start\b/i,
    /\bforever\s+start\b/i
  ];
  
  return longRunningPatterns.some(pattern => pattern.test(command));
}

// Función para validar éxito de comando por estado del proceso remoto
async function validateCommandByProcessState(conn, command, stream, options = {}) {
  const {
    timeoutSeconds = 30,
    checkInterval = 5000,
    enableProcessCheck = true,
    enablePortCheck = true
  } = options;
  
  return new Promise((resolve) => {
    let hasOutput = false;
    let hasCriticalError = false;
    let commandPid = null;
    
    // Patrones de errores críticos que indican fallo inmediato
    const criticalErrorPatterns = [
      /command not found/i,
      /permission denied/i,
      /no such file or directory/i,
      /connection refused/i,
      /address already in use/i,
      /port.*already.*use/i,
      /failed to start/i,
      /error.*starting/i,
      /cannot.*bind/i,
      /fatal error/i,
      /segmentation fault/i,
      /killed/i,
      /syntax error/i,
      /module not found/i,
      /cannot find module/i
    ];
    
    // 1. VALIDACIÓN PRINCIPAL: Por duración sin errores críticos
    const durationTimer = setTimeout(async () => {
      if (!hasCriticalError) {  
        // Ejecutar validaciones de estado del proceso
        const stateValidation = await validateProcessState(conn, command, commandPid);
        
        resolve({
          success: true,
          method: 'process_state_validation',
          duration: timeoutSeconds,
          stateValidation,
          reason: 'running_without_critical_errors',
          processInfo: stateValidation
        });
      }
    }, timeoutSeconds * 1000);
    
    // 2. DETECCIÓN DE ERRORES CRÍTICOS
    stream.on('data', (data) => {
      const text = data.toString();
      hasOutput = true;
      
      // Extraer PID si es posible del output
      const pidMatch = text.match(/pid[:\s]+(\d+)/i) || text.match(/process[:\s]+(\d+)/i);
      if (pidMatch && !commandPid) {
        commandPid = pidMatch[1];
      }
      
      // Verificar errores críticos
      const hasCritical = criticalErrorPatterns.some(pattern => pattern.test(text));
      if (hasCritical) {
        hasCriticalError = true;
        clearTimeout(durationTimer);
        
        resolve({
          success: false,
          method: 'critical_error_detected',
          error: text.trim(),
          reason: 'critical_error_in_output'
        });
        return;
      }
    });
    
    // 3. MANEJO DE CIERRE TEMPRANO DEL PROCESO
    stream.on('close', (code) => {
      clearTimeout(durationTimer);
      
      // Si el comando termina rápidamente
      if (code === 0) {
        resolve({
          success: true,
          method: 'normal_completion',
          exitCode: code,
          reason: 'completed_successfully'
        });
      } else {
        resolve({
          success: false,
          method: 'exit_with_error',
          exitCode: code,
          reason: 'process_exited_with_error'
        });
      }
    });
    
    // 4. DETECCIÓN DE ERRORES EN STDERR
    stream.stderr.on('data', (data) => {
      const text = data.toString();
      
      // Verificar errores críticos en stderr
      const hasCritical = criticalErrorPatterns.some(pattern => pattern.test(text));
      if (hasCritical) {
        hasCriticalError = true;
        clearTimeout(durationTimer);
        
        resolve({
          success: false,
          method: 'critical_error_stderr',
          error: text.trim(),
          reason: 'critical_error_in_stderr'
        });
      }
    });
  });
}

// Función para validar el estado del proceso en el sistema remoto
async function validateProcessState(conn, originalCommand, knownPid = null) {
  const checks = [];
  
  try {
    // 1. Verificar procesos por nombre del comando
    const processCheck = await checkProcessByCommand(conn, originalCommand);
    checks.push({ type: 'process_by_command', ...processCheck });
    
    // 2. Verificar proceso específico por PID si se conoce
    if (knownPid) {
      const pidCheck = await checkProcessByPid(conn, knownPid);
      checks.push({ type: 'process_by_pid', pid: knownPid, ...pidCheck });
    }
    
    // 3. Verificar puerto si es aplicable
    const port = extractPortFromCommand(originalCommand);
    if (port) {
      const portCheck = await checkPortStatus(conn, port);
      checks.push({ type: 'port_status', port, ...portCheck });
    }
    
    // 4. Verificar carga del sistema
    const systemCheck = await checkSystemLoad(conn);
    checks.push({ type: 'system_load', ...systemCheck });
    
    // 5. Análisis final del estado
    const overallSuccess = checks.some(check => 
      (check.type === 'process_by_command' && check.success) ||
      (check.type === 'process_by_pid' && check.success) ||
      (check.type === 'port_status' && check.success)
    );
    
    return {
      overall_success: overallSuccess,
      checks,
      summary: overallSuccess ? 
        'Proceso validado como ejecutándose correctamente' : 
        'No se pudo validar el estado del proceso'
    };
    
  } catch (error) {
    return {
      overall_success: false,
      checks: [{ type: 'validation_error', error: error.message }],
      summary: 'Error durante la validación del estado'
    };
  }
}

// Función para verificar proceso por nombre del comando
async function checkProcessByCommand(conn, command) {
  return new Promise((resolve) => {
    const processName = extractProcessName(command);
    const checkCmd = `ps aux | grep "${processName}" | grep -v grep | head -5`;
    
    conn.exec(checkCmd, (err, stream) => {
      if (err) {
        resolve({ success: false, reason: 'check_failed', error: err.message });
        return;
      }
      
      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });
      
      stream.on('close', (code) => {
        const processLines = output.trim().split('\n').filter(line => line.trim());
        const processCount = processLines.length;
        
        resolve({
          success: processCount > 0,
          reason: processCount > 0 ? 'process_found' : 'process_not_found',
          processCount,
          processInfo: processLines,
          command: checkCmd
        });
      });
    });
  });
}

// Función para verificar proceso por PID específico
async function checkProcessByPid(conn, pid) {
  return new Promise((resolve) => {
    const checkCmd = `ps -p ${pid} -o pid,ppid,cmd --no-headers`;
    
    conn.exec(checkCmd, (err, stream) => {
      if (err) {
        resolve({ success: false, reason: 'pid_check_failed', error: err.message });
        return;
      }
      
      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });
      
      stream.on('close', (code) => {
        const processExists = output.trim().length > 0 && code === 0;
        resolve({
          success: processExists,
          reason: processExists ? 'pid_exists' : 'pid_not_found',
          processInfo: output.trim(),
          exitCode: code
        });
      });
    });
  });
}

// Función para verificar estado del puerto
async function checkPortStatus(conn, port) {
  return new Promise((resolve) => {
    const checkCmd = `netstat -tlnp 2>/dev/null | grep :${port} || ss -tlnp 2>/dev/null | grep :${port}`;
    
    conn.exec(checkCmd, (err, stream) => {
      if (err) {
        resolve({ success: false, reason: 'port_check_failed', error: err.message });
        return;
      }
      
      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });
      
      stream.on('close', (code) => {
        const portActive = output.includes(`:${port}`) && output.includes('LISTEN');
        resolve({
          success: portActive,
          reason: portActive ? 'port_listening' : 'port_not_active',
          portInfo: output.trim(),
          command: checkCmd
        });
      });
    });
  });
}

// Función para verificar carga del sistema
async function checkSystemLoad(conn) {
  return new Promise((resolve) => {
    conn.exec('uptime && free -h | head -2', (err, stream) => {
      if (err) {
        resolve({ success: false, error: err.message });
        return;
      }
      
      let output = '';
      stream.on('data', (data) => {
        output += data.toString();
      });
      
      stream.on('close', () => {
        const lines = output.split('\n');
        const uptimeLine = lines.find(line => line.includes('load average'));
        const memLine = lines.find(line => line.includes('Mem:'));
        
        resolve({
          success: true,
          uptime: uptimeLine ? uptimeLine.trim() : 'N/A',
          memory: memLine ? memLine.trim() : 'N/A',
          raw: output.trim()
        });
      });
    });
  });
}

// Función para crear una nueva conexión SSH paralela
async function createParallelConnection(originalConfig) {
  return new Promise((resolve, reject) => {
    const { Client } = require('ssh2');
    const newConn = new Client();
    
    newConn
      .on('ready', () => {
        // Ocultar mensaje de conexión SSH paralela establecida
        resolve(newConn);
      })
      .on('error', (err) => {
        console.error(`❌ Error en conexión SSH paralela:`, err);
        reject(err);
      })
      .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([originalConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          finish([]);
        }
      })
      .connect({
        host: originalConfig.host,
        port: parseInt(originalConfig.port, 10) || 22,
        username: originalConfig.username,
        password: originalConfig.password,
        tryKeyboard: true,
      });
  });
}

// Función para extraer nombre del proceso del comando
function extractProcessName(command) {
  const cmd = command.toLowerCase().trim();
  
  // Extraer el nombre del ejecutable principal
  if (cmd.includes('npm ')) return 'node';
  if (cmd.includes('yarn ')) return 'node';
  if (cmd.includes('pnpm ')) return 'node';
  if (cmd.includes('bun ')) return 'bun';
  if (cmd.includes('deno ')) return 'deno';
  if (cmd.includes('ng ')) return 'node';
  if (cmd.includes('next ')) return 'node';
  if (cmd.includes('nuxt ')) return 'node';
  if (cmd.includes('vite')) return 'node';
  if (cmd.includes('cloudflared')) return 'cloudflared';
  if (cmd.includes('ngrok')) return 'ngrok';
  if (cmd.includes('python')) return 'python';
  if (cmd.includes('php')) return 'php';
  if (cmd.includes('java')) return 'java';
  if (cmd.includes('ruby')) return 'ruby';
  if (cmd.includes('rails')) return 'ruby';
  if (cmd.includes('flask')) return 'python';
  if (cmd.includes('uvicorn')) return 'python';
  if (cmd.includes('gunicorn')) return 'python';
  if (cmd.includes('streamlit')) return 'python';
  if (cmd.includes('jupyter')) return 'python';
  if (cmd.includes('docker')) return 'docker';
  if (cmd.includes('pm2')) return 'pm2';
  if (cmd.includes('forever')) return 'forever';
  
  // Extraer primera palabra del comando
  const words = cmd.split(' ');
  return words[0];
}

// Función para extraer puerto del comando
function extractPortFromCommand(command) {
  const portPatterns = [
    /--port[=\s]+(\d+)/i,
    /-p[=\s]+(\d+)/i,
    /port[=\s]+(\d+)/i,
    /:(\d+)/,
    /localhost:(\d+)/i,
    /127\.0\.0\.1:(\d+)/i,
    /0\.0\.0\.0:(\d+)/i
  ];
  
  for (const pattern of portPatterns) {
    const match = command.match(pattern);
    if (match && match[1]) {
      const port = parseInt(match[1]);
      if (port > 0 && port < 65536) {
        return port;
      }
    }
  }
  
  // Puertos por defecto según el comando
  const cmd = command.toLowerCase();
  if (cmd.includes('ng serve')) return 4200;
  if (cmd.includes('npm run dev') || cmd.includes('yarn dev') || cmd.includes('pnpm run dev')) return 3000;
  if (cmd.includes('next dev') || cmd.includes('next start')) return 3000;
  if (cmd.includes('nuxt dev')) return 3000;
  if (cmd.includes('vite')) return 5173;
  if (cmd.includes('gatsby develop')) return 8000;
  if (cmd.includes('flask')) return 5000;
  if (cmd.includes('django') || cmd.includes('runserver')) return 8000;
  if (cmd.includes('rails server')) return 3000;
  if (cmd.includes('php artisan serve')) return 8000;
  if (cmd.includes('http-server')) return 8080;
  if (cmd.includes('live-server')) return 8080;
  if (cmd.includes('serve -s')) return 3000;
  if (cmd.includes('streamlit')) return 8501;
  if (cmd.includes('jupyter')) return 8888;
  
  return null;
}

// Función para ejecutar comando y esperar a que esté "listo"
async function executeAndWaitForReady(conn, fullCommand, cmd, logStream, connectionConfig) {
  return new Promise((resolve) => {
    const loader = createLoader(`Ejecutando: ${cmd}`);
    
    conn.exec(fullCommand, { pty: true }, (err, stream) => {
      if (err) {
        loader.stop(`❌ Error ejecutando: ${cmd}`);
        resolve({ success: false, error: err, method: 'exec_error' });
        return;
      }
      
      // Crear manejador de contraseña
      const passwordHandler = createPasswordTimeoutHandler(
        stream, 
        connectionConfig.password, 
        cmd, 
        logStream
      );
      
      // Usar la nueva validación por estado del proceso
      validateCommandByProcessState(conn, cmd, stream, {
        timeoutSeconds: 30,
        enableProcessCheck: true,
        enablePortCheck: true
      }).then((result) => {
        loader.stop(result.success ? 
          `✅ ${result.reason} (${result.method})` : 
          `❌ ${result.reason} (${result.method})`
        );
        
        passwordHandler.cancel();
        
        // Escribir solo un mensaje conciso al log
        logStream.write(`\n[VALIDACIÓN] ${cmd}: ${result.success ? 'ÉXITO' : 'FALLO'} - ${result.reason}\n`);
        
        resolve(result);
      });
      
      // Manejar autenticación
      stream.on("data", (data) => {
        logStream.write(data);
        
        if (!passwordHandler.isResponded()) {
          const analysis = analyzeStreamOutput(data, cmd);
          if (analysis.isSudoPrompt || analysis.isPasswordPrompt) {
            if (analysis.confidence >= 75) {
              passwordHandler.triggerPasswordSend(`Detectado prompt - `);
            }
          }
        }
      });
      
      stream.stderr.on("data", (data) => {
        logStream.write(`[STDERR] ${data}`);
        
        if (!passwordHandler.isResponded()) {
          const analysis = analyzeStreamOutput(data, cmd);
          if (analysis.isSudoPrompt || analysis.isPasswordPrompt) {
            if (analysis.confidence >= 75) {
              passwordHandler.triggerPasswordSend(`Detectado prompt en stderr - `);
            }
          }
        }
      });
    });
  });
}

// Función para ejecutar comandos restantes en conexión paralela
async function executeRemainingCommands(parallelConn, remainingCommands, currentDirectory, connectionConfig, logStream, executionLog, taskStatuses, startIndex) {
  let completed = 0;
  let parallelDirectory = currentDirectory;
  
  // Mostrar información inicial sin logs detallados
  
  for (let i = 0; i < remainingCommands.length; i++) {
    const cmd = remainingCommands[i];
    const globalIndex = startIndex + i;
    
    // Crear loader para mostrar progreso sin logs detallados
    const loader = createLoader(`Ejecutando: ${cmd}`);
    
    // Preparar comando con contexto de directorio
    let fullCommand;
    if (cmd.trim().startsWith('cd ')) {
      const targetDir = cmd.trim().substring(3).trim();
      if (targetDir.startsWith('/')) {
        parallelDirectory = targetDir;
      } else if (targetDir === '~' || targetDir === '') {
        parallelDirectory = '~';
      } else {
        parallelDirectory = parallelDirectory === '~' ? `~/${targetDir}` : `${parallelDirectory}/${targetDir}`;
      }
      fullCommand = `cd ${parallelDirectory} && pwd`;
    } else {
      fullCommand = `cd ${parallelDirectory} && ${cmd}`;
    }
    
    // Verificar si este comando también es de larga duración
    if (isLongRunningCommand(cmd)) {
      loader.stop(); // Detener el loader actual
      
      // Calcular comandos restantes desde este punto
      const nestedRemainingCommands = remainingCommands.slice(i + 1);
      
      // Usar la misma función de selección que el flujo principal
      const longRunningAction = await handleParallelCommandChoice(cmd, nestedRemainingCommands);
      
      if (longRunningAction === "parallel") {
        // Limpiar pantalla para eliminar el ruido de la selección de opciones
        console.clear();
        console.log(`✅ Conexión paralela activa`);
        console.log(`📝 Ejecutando comandos restantes...\n`);
        
        // Mostrar progreso de los comandos restantes
        remainingCommands.forEach((c, idx) => {
          const status = idx < i ? '✅' : idx === i ? '⏳' : '⏳';
          console.log(`  ${status} ${idx + 1}. ${c}`);
        });
        
        console.log(""); // Línea en blanco antes del loader
        
        const nestedResult = await executeAndWaitForReady(
          parallelConn, 
          fullCommand, 
          cmd, 
          logStream, 
          connectionConfig
        );
        
        if (nestedResult.success) {
          taskStatuses[globalIndex] = '🔗';
          completed++;
          
          executionLog.push({
            command: cmd,
            status: '🔗',
            output: `Ejecutándose en conexión paralela. Método: ${nestedResult.method}`,
            exitCode: 0,
            parallel: true,
            nested: true,
            validationInfo: nestedResult.stateValidation
          });
          
          // Si hay más comandos, continuarlos en la conexión original
          const moreCommands = remainingCommands.slice(i + 1);
          if (moreCommands.length > 0) {
            const moreResult = await executeRemainingCommands(
              parallelConn,
              moreCommands,
              parallelDirectory,
              connectionConfig,
              logStream,
              executionLog,
              taskStatuses,
              startIndex + i + 1
            );
            completed += moreResult.completed;
          }
          
          // Salir del bucle ya que los comandos restantes se procesaron recursivamente
          break;
          
        } else {
          taskStatuses[globalIndex] = '❌';
          executionLog.push({
            command: cmd,
            status: '❌',
            output: `Error en comando anidado: ${nestedResult.reason} (${nestedResult.method})`,
            exitCode: 1,
            validationInfo: nestedResult.stateValidation
          });
        }
        
      } else if (longRunningAction === "skip") {
        // Saltar este comando
        taskStatuses[globalIndex] = '⏭️';
        
        executionLog.push({
          command: cmd,
          status: '⏭️',
          output: 'Comando saltado por el usuario',
          exitCode: 0,
          parallel: true
        });
        
      } else {
        // Para otras opciones (debug, wait), ejecutar normalmente
        const result = await executeNormalCommand(parallelConn, fullCommand, cmd, logStream, connectionConfig);
        
        if (result.success) {
          taskStatuses[globalIndex] = '✅';
          completed++;
        } else {
          taskStatuses[globalIndex] = '❌';
        }
        
        executionLog.push({
          command: cmd,
          status: result.success ? '✅' : '❌',
          output: result.output,
          exitCode: result.exitCode,
          parallel: true
        });
      }
      
    } else {
      // Comando normal - ejecutar en la conexión paralela actual
      const result = await executeNormalCommand(parallelConn, fullCommand, cmd, logStream, connectionConfig);
      
      if (result.success) {
        taskStatuses[globalIndex] = '✅';
        completed++;
        loader.stop(`✅ Completado: ${cmd}`);
      } else {
        taskStatuses[globalIndex] = '❌';
        loader.stop(`❌ Error en: ${cmd}`);
      }
      
      executionLog.push({
        command: cmd,
        status: result.success ? '✅' : '❌',
        output: result.output,
        exitCode: result.exitCode,
        parallel: true
      });
    }
  }
  
  return { completed };
}

// Función auxiliar para ejecutar un comando normal
async function executeNormalCommand(conn, fullCommand, cmd, logStream, connectionConfig) {
  return new Promise((resolve) => {
    conn.exec(fullCommand, { pty: true }, (err, stream) => {
      if (err) {
        resolve({ success: false, error: err, output: `ERROR: ${err}`, exitCode: 1 });
        return;
      }

      let output = "";
      
      const passwordHandler = createPasswordTimeoutHandler(
        stream, 
        connectionConfig.password, 
        cmd, 
        logStream
      );
      
      const specificPatterns = getCommandSpecificPatterns(cmd);

      stream
        .on("close", (code) => {
          passwordHandler.cancel();
          
          logStream.write(`\n=== [PARALELA] COMANDO: ${cmd} ===\n`);
          logStream.write(output);
          logStream.write(`\n=== FIN [PARALELA] (código: ${code}) ===\n\n`);
          
          resolve({
            success: code === 0,
            output: output,
            exitCode: code
          });
        })
        .on("data", (data) => {
          const analysis = analyzeStreamOutput(data, cmd);
          output += analysis.originalData;
          
          // Manejo de contraseñas
          if (!passwordHandler.isResponded()) {
            if (analysis.isSudoPrompt || analysis.isPasswordPrompt) {
              if (analysis.confidence >= 75) {
                passwordHandler.triggerPasswordSend(`[PARALELA] Detectado prompt - `);
                return;
              }
            }
            
            for (const { pattern, confidence } of specificPatterns) {
              if (pattern.test(data) && confidence >= 70) {
                passwordHandler.triggerPasswordSend(`[PARALELA] Patrón específico - `);
                return;
              }
            }
          }
        })
        .stderr.on("data", (data) => {
          const analysis = analyzeStreamOutput(data, cmd);
          output += `[STDERR] ${analysis.originalData}`;
          
          if (!passwordHandler.isResponded()) {
            if (analysis.isSudoPrompt || analysis.isPasswordPrompt) {
              if (analysis.confidence >= 75) {
                passwordHandler.triggerPasswordSend(`[PARALELA] Detectado prompt en stderr - `);
                return;
              }
            }
          }
        });
    });
  });
}

// Función para crear un manejador de timeout para contraseñas
function createPasswordTimeoutHandler(stream, password, commandName, logStream) {
  let timeoutId;
  let responded = false;
  
  const sendPassword = (reason = "") => {
    if (!responded) {
      // Solo escribir al log, sin mostrar en consola para mantener interfaz limpia
      stream.write(password + "\n");
      logStream.write(`[AUTO-RESPONSE] Contraseña enviada automáticamente${reason ? ` (${reason})` : ""}\n`);
      responded = true;
    }
  };
  
  // Verificar si es un comando de larga duración que no necesita timeout automático
  if (isLongRunningCommand(commandName)) {
    // No establecer timeout para comandos de desarrollo/servidores
    timeoutId = null;
  } else {
    // Si después de 3 segundos no hay respuesta y detectamos un posible prompt
    timeoutId = setTimeout(() => {
      if (!responded) {
        sendPassword("Timeout - ");
      }
    }, 3000);
  }
  
  return {
    triggerPasswordSend: (reason = "") => {
      if (timeoutId) clearTimeout(timeoutId);
      sendPassword(reason);
    },
    cancel: () => {
      if (timeoutId) clearTimeout(timeoutId);
      responded = true;
    },
    isResponded: () => responded
  };
}

// Función para modo debug interactivo mejorado
async function debugMode(conn, connectionConfig, executionLog, commandList, currentCommandIndex) {
  console.clear();
  
  // Mostrar solo el historial de comandos sin marcos grandes
  if (executionLog.length > 0) {
    console.log("\n📋 HISTORIAL DE COMANDOS:");
    
    executionLog.forEach((logEntry, index) => {
      console.log(`\n${logEntry.status} COMANDO ${index + 1}: ${logEntry.command}`);
      console.log("─".repeat(60));
      
      if (logEntry.output && logEntry.output.trim()) {
        const lines = logEntry.output.split('\n').slice(0, 10); // Mostrar máximo 10 líneas
        lines.forEach(line => {
          if (line.trim()) {
            // Truncar líneas muy largas
            const displayLine = line.length > 75 ? line.substring(0, 72) + '...' : line;
            console.log(`  ${displayLine}`);
          }
        });
        
        if (logEntry.output.split('\n').length > 10) {
          console.log(`  ... (${logEntry.output.split('\n').length - 10} líneas más)`);
        }
      } else {
        console.log("  (sin output)");
      }
      
      if (logEntry.exitCode !== undefined) {
        console.log(`  └─ Código de salida: ${logEntry.exitCode}`);
      }
    });
  } else {
    console.log("\n📋 HISTORIAL DE COMANDOS:");
    console.log("   (Sin comandos ejecutados aún)");
  }

  console.log("");
  
  // Configurar readline para capturar atajos de teclado
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '🔧 debug@' + (connectionConfig.hostName || connectionConfig.host) + ':~$ '
  });
  
  // Configurar manejo de teclas especiales
  process.stdin.setRawMode(true);
  process.stdin.resume();
  
  let isInRawMode = true;
  let currentInput = '';
  let commandHistory = [];
  let historyIndex = -1;
  
  return new Promise((resolve) => {
    // Función para limpiar la línea actual y redibujar
    function redrawPrompt() {
      // Limpiar línea actual
      process.stdout.write('\r\x1b[K');
      // Redibujar prompt y input actual
      const prompt = '🔧 debug@' + (connectionConfig.hostName || connectionConfig.host) + ':~$ ';
      process.stdout.write(prompt + currentInput);
    }
    
    // Manejar teclas especiales
    process.stdin.on('data', (key) => {
      if (!isInRawMode) return;
      
      const keyStr = key.toString();
      
      // Ctrl+Q - Salir del debug
      if (keyStr === '\u0011') { // Ctrl+Q
        cleanup();
        resolve("continue_process");
        return;
      }
      
      // Ctrl+X - Finalizar conexión
      if (keyStr === '\u0018') { // Ctrl+X
        cleanup();
        resolve("terminate_connection");
        return;
      }
      
      // Ctrl+L - Actualizar log
      if (keyStr === '\u000c') { // Ctrl+L
        console.clear();
        // Mostrar solo el historial de comandos
        if (executionLog.length > 0) {
          console.log("\n📋 HISTORIAL DE COMANDOS:");
          
          executionLog.forEach((logEntry, index) => {
            console.log(`\n${logEntry.status} COMANDO ${index + 1}: ${logEntry.command}`);
            console.log("─".repeat(60));
            
            if (logEntry.output && logEntry.output.trim()) {
              const lines = logEntry.output.split('\n').slice(0, 10);
              lines.forEach(line => {
                if (line.trim()) {
                  const displayLine = line.length > 75 ? line.substring(0, 72) + '...' : line;
                  console.log(`  ${displayLine}`);
                }
              });
              
              if (logEntry.output.split('\n').length > 10) {
                console.log(`  ... (${logEntry.output.split('\n').length - 10} líneas más)`);
              }
            } else {
              console.log("  (sin output)");
            }
            
            if (logEntry.exitCode !== undefined) {
              console.log(`  └─ Código de salida: ${logEntry.exitCode}`);
            }
          });
        } else {
          console.log("\n📋 HISTORIAL DE COMANDOS:");
          console.log("   (Sin comandos ejecutados aún)");
        }
        showDebugPrompt();
        return;
      }
      
      // Ctrl+H - Mostrar ayuda
      if (keyStr === '\u0008') { // Ctrl+H (Backspace también, pero verificamos longitud)
        if (currentInput.length === 0) {
          showDebugHelp();
          return;
        }
        // Si hay texto, actuar como backspace
        handleBackspace();
        return;
      }
      
      // Enter - Ejecutar comando
      if (keyStr === '\r' || keyStr === '\n') {
        if (currentInput.trim()) {
          // Agregar al historial
          commandHistory.unshift(currentInput.trim());
          if (commandHistory.length > 50) commandHistory.pop(); // Limitar historial
          historyIndex = -1;
          
          executeDebugCommand(currentInput.trim());
          currentInput = '';
        } else {
          redrawPrompt();
        }
        return;
      }
      
      // Backspace - Eliminar carácter
      if (keyStr === '\u007f') {
        handleBackspace();
        return;
      }
      
      // Flecha arriba - Historial anterior
      if (keyStr === '\u001b[A') {
        navigateHistory('up');
        return;
      }
      
      // Flecha abajo - Historial siguiente  
      if (keyStr === '\u001b[B') {
        navigateHistory('down');
        return;
      }
      
      // Ctrl+C - Mostrar menú de salida
      if (keyStr === '\u0003') { // Ctrl+C
        showExitMenu();
        return;
      }
      
      // Caracteres normales (imprimibles)
      if (keyStr >= ' ' && keyStr <= '~') {
        // Insertar carácter
        currentInput += keyStr;
        redrawPrompt();
      }
    });
    
    function handleBackspace() {
      if (currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
        redrawPrompt();
      }
    }
    
    function navigateHistory(direction) {
      if (commandHistory.length === 0) return;
      
      if (direction === 'up') {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          currentInput = commandHistory[historyIndex];
          redrawPrompt();
        }
      } else if (direction === 'down') {
        if (historyIndex > 0) {
          historyIndex--;
          currentInput = commandHistory[historyIndex];
          redrawPrompt();
        } else if (historyIndex === 0) {
          historyIndex = -1;
          currentInput = '';
          redrawPrompt();
        }
      }
    }
    
    function cleanup() {
      if (isInRawMode) {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        isInRawMode = false;
      }
      rl.close();
    }
    
    function showDebugPrompt() {
      console.log("\n🔧 Modo debug activo");
      console.log("� Autenticación automática habilitada para comandos sudo");
      console.log("�💡 Ctrl+Q=Salir | Ctrl+X=Finalizar | Ctrl+H=Ayuda | ↑↓=Historial");
      const prompt = '🔧 debug@' + (connectionConfig.hostName || connectionConfig.host) + ':~$ ';
      process.stdout.write('\n' + prompt);
      currentInput = '';
    }
    
    function showDebugHelp() {
      console.log("\n📋 Comandos útiles:");
      console.log("  pwd                    - Directorio actual");
      console.log("  ls -la                 - Listar archivos detallado");
      console.log("  ps aux                 - Procesos en ejecución");
      console.log("  systemctl status [srv] - Estado de servicios");
      console.log("  journalctl -n 20       - Logs del sistema");
      console.log("  df -h                  - Espacio en disco");
      console.log("  free -h                - Memoria disponible");
      console.log("  netstat -tlnp          - Puertos abiertos");
      console.log("  docker ps              - Contenedores Docker");
      console.log("  sudo [comando]         - Ejecutar con privilegios");
      console.log("\n🔐 Autenticación automática:");
      console.log("  • Las contraseñas para sudo se introducen automáticamente");
      console.log("  • Detección inteligente de prompts de contraseña");
      console.log("  • Soporte para múltiples tipos de autenticación");
      console.log("\n⌨️  Controles:");
      console.log("  ↑/↓                    - Historial de comandos");
      console.log("  Ctrl+Q                 - Salir del debug");
      console.log("  Ctrl+X                 - Finalizar conexión");
      console.log("  Ctrl+L                 - Mostrar logs");
      console.log("  Ctrl+H                 - Esta ayuda");
      console.log("");
      redrawPrompt();
    }
    
    async function executeDebugCommand(command) {
      console.log(`\n🔄 Ejecutando: ${command}`);
      
      await new Promise((cmdResolve) => {
        conn.exec(command, { pty: true }, (err, stream) => {
          if (err) {
            console.error(`❌ Error: ${err}`);
            cmdResolve();
            return;
          }
          
          // Crear manejador de contraseña para el modo debug
          const passwordHandler = createPasswordTimeoutHandler(
            stream, 
            connectionConfig.password, 
            command, 
            { write: () => {} } // Log stream dummy para debug mode
          );
          
          // Obtener patrones específicos para este comando
          const specificPatterns = getCommandSpecificPatterns(command);
          
          stream
            .on("close", (code) => {
              passwordHandler.cancel(); // Cancelar timeout
              
              // Solo mostrar código de salida si es diferente de 0
              if (code !== 0) {
                console.log(`\n[Proceso terminado con código: ${code}]`);
              }
              
              // Mostrar prompt de nuevo
              redrawPrompt();
              cmdResolve();
            })
            .on("data", (data) => {
              const text = data.toString();
              
              // Analizar si es un prompt de contraseña
              if (!passwordHandler.isResponded()) {
                const analysis = analyzeStreamOutput(data, command);
                
                // Manejar solicitudes de contraseña de forma silenciosa
                if (analysis.isSudoPrompt || analysis.isPasswordPrompt) {
                  if (analysis.confidence >= 75) {
                    passwordHandler.triggerPasswordSend(`Detectado prompt - `);
                    return; // No mostrar el prompt de contraseña en pantalla
                  }
                }
                
                // Verificar con patrones específicos del comando
                for (const { pattern, confidence } of specificPatterns) {
                  if (pattern.test(text) && confidence >= 70) {
                    passwordHandler.triggerPasswordSend(`Patrón específico detectado - `);
                    return; // No mostrar el prompt de contraseña en pantalla
                  }
                }
                
                // Detección adicional para casos edge
                if (text.includes(':') && 
                    text.trim().endsWith(':') &&
                    text.toLowerCase().includes('password')) {
                  passwordHandler.triggerPasswordSend("Formato típico de prompt detectado - ");
                  return; // No mostrar el prompt de contraseña en pantalla
                }
              }
              
              // Mostrar output en tiempo real como una terminal
              process.stdout.write(text);
            })
            .stderr.on("data", (data) => {
              const text = data.toString();
              
              // También revisar stderr para prompts de contraseña
              if (!passwordHandler.isResponded()) {
                const analysis = analyzeStreamOutput(data, command);
                
                if (analysis.isSudoPrompt || analysis.isPasswordPrompt) {
                  if (analysis.confidence >= 75) {
                    passwordHandler.triggerPasswordSend(`Detectado prompt en stderr - `);
                    return; // No mostrar el prompt de contraseña en pantalla
                  }
                }
                
                // Verificar patrones específicos en stderr de forma silenciosa
                for (const { pattern, confidence } of specificPatterns) {
                  if (pattern.test(text) && confidence >= 70) {
                    passwordHandler.triggerPasswordSend(`Patrón específico en stderr - `);
                    return; // No mostrar el prompt de contraseña en pantalla
                  }
                }
              }
              
              // Mostrar errores en tiempo real
              process.stdout.write(text);
            });
        });
      });
    }
    
    async function showExitMenu() {
      cleanup();
      
      console.log("\n� ¿Qué deseas hacer?");
      
      const exitChoice = await inquirer.prompt([
        {
          type: "list",
          name: "action",
          message: "Selecciona una opción:",
          choices: [
            {
              name: "🔄 Salir del modo debug (volver al proceso)",
              value: "exit_debug"
            },
            {
              name: "🚪 Finalizar conexión completamente", 
              value: "terminate"
            },
            {
              name: "⬅️  Volver al modo debug",
              value: "back_to_debug"
            }
          ]
        }
      ]);
      
      if (exitChoice.action === "exit_debug") {
        resolve("continue_process");
      } else if (exitChoice.action === "terminate") {
        resolve("terminate_connection");
      } else {
        // Volver al modo debug
        return debugMode(conn, connectionConfig, executionLog, commandList, currentCommandIndex);
      }
    }
    
    // Mostrar prompt inicial
    showDebugPrompt();
  });
}

// Función para obtener autocompletador de comandos debug
// Función auxiliar para mostrar el log completo de ejecución
function displayFullExecutionLog(executionLog, connectionConfig, commandList, currentCommandIndex) {
  console.log("╔═══════════════════════════════════════════════════════════════════════════════╗");
  console.log("║                        📋 LOG COMPLETO DE EJECUCIÓN                        ║");
  console.log("╠═══════════════════════════════════════════════════════════════════════════════╣");
  console.log(`║ 🏠 Host: ${(connectionConfig.hostName || 'Sin nombre').padEnd(64)} ║`);
  console.log(`║ 🌐 Servidor: ${(connectionConfig.host + ':' + connectionConfig.port).padEnd(58)} ║`);
  console.log(`║ 👤 Usuario: ${connectionConfig.username.padEnd(62)} ║`);
  console.log(`║ 📊 Progreso: ${(currentCommandIndex + '/' + commandList.length + ' comandos').padEnd(60)} ║`);
  console.log(`║ ⚠️  Error en: ${commandList[currentCommandIndex].substring(0, 60).padEnd(60)} ║`);
  console.log("╚═══════════════════════════════════════════════════════════════════════════════╝");
  
  if (executionLog.length > 0) {
    console.log("\n📋 HISTORIAL DE COMANDOS:");
    
    executionLog.forEach((logEntry, index) => {
      console.log(`\n${logEntry.status} COMANDO ${index + 1}: ${logEntry.command}`);
      console.log("─".repeat(60));
      
      if (logEntry.output && logEntry.output.trim()) {
        const lines = logEntry.output.split('\n').slice(0, 10); // Mostrar máximo 10 líneas
        lines.forEach(line => {
          if (line.trim()) {
            // Truncar líneas muy largas
            const displayLine = line.length > 75 ? line.substring(0, 72) + '...' : line;
            console.log(`  ${displayLine}`);
          }
        });
        
        if (logEntry.output.split('\n').length > 10) {
          console.log(`  ... (${logEntry.output.split('\n').length - 10} líneas más)`);
        }
      } else {
        console.log("  (sin output)");
      }
      
      if (logEntry.exitCode !== undefined) {
        console.log(`  └─ Código de salida: ${logEntry.exitCode}`);
      }
    });
  } else {
    console.log("\n📋 HISTORIAL DE COMANDOS:");
    console.log("   (Sin comandos ejecutados aún)");
  }

}

// Función para manejar opciones post-debug
async function postDebugOptions(commandList, currentCommandIndex, processName) {
  console.clear();
  console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║             🔄 OPCIONES POST-DEBUG                      
    ║                                                    
    ╚═════════════════════════════════════════════════════════════╝
    `);
  
  console.log(`📝 Proceso: ${processName || 'Sin nombre'}`);
  console.log(`📊 Progreso: ${currentCommandIndex}/${commandList.length} comandos`);
  console.log(`⚠️  Error en comando: ${commandList[currentCommandIndex]}`);
  console.log(`📋 Comandos restantes: ${commandList.length - currentCommandIndex}`);
  
  console.log("\n📋 Comandos restantes por ejecutar:");
  for (let i = currentCommandIndex; i < commandList.length; i++) {
    console.log(`  ${i + 1}. ${commandList[i]}`);
  }
  
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "🔄 ¿Cómo deseas continuar?",
      choices: [
        {
          name: "🔄 Reiniciar proceso desde el inicio",
          value: "restart_from_beginning"
        },
        {
          name: "▶️  Continuar desde el comando que falló",
          value: "continue_from_error"
        },
        {
          name: "⏭️  Saltar comando fallido y continuar",
          value: "skip_and_continue"
        },
        {
          name: "🚪 Finalizar proceso completamente",
          value: "terminate_process"
        }
      ]
    }
  ]);
  
  return action;
}

// Función principal del CLI
async function runSshProcess(processConfig = null) {
  let connectionConfig;
  let commandList;
  let processName = null;

  if (processConfig) {
    // Limpiar pantalla al ejecutar proceso guardado
    console.clear();
    
    // Usar configuración existente pero pedir contraseña de nuevo
    console.log(`🔄 Ejecutando proceso guardado: ${processConfig.name || "Sin nombre"}`);
    
    const { password } = await inquirer.prompt([
      {
        type: "password",
        name: "password",
        message: `Contraseña para ${processConfig.config.username}@${processConfig.config.host}:`,
        mask: "*",
      },
    ]);
    
    connectionConfig = { ...processConfig.config, password };
    commandList = processConfig.commands;
    processName = processConfig.name;
  } else {
    // Limpiar pantalla al crear nuevo proceso
    console.clear();
    
    console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║                🚀 CREAR NUEVO PROCESO SSH               
    ║                                                    
    ╚═════════════════════════════════════════════════════════════╝
    `);
    
    // Primero solicitar el host remoto
    const { host } = await inquirer.prompt([
      { 
        type: "input", 
        name: "host", 
        message: "� Host remoto:",
        validate: (input) => {
          if (!input.trim()) return "El host es obligatorio";
          // Validación básica de formato de host/IP
          const hostRegex = /^[a-zA-Z0-9.-]+$/;
          if (!hostRegex.test(input.trim())) {
            return "Formato de host inválido. Usa solo letras, números, puntos y guiones.";
          }
          return true;
        }
      }
    ]);

    // Verificar si el host ya existe en procesos guardados
    const existingProcesses = loadSshProcesses();
    const existingHost = existingProcesses.find(proc => proc.config.host === host.trim());
    
    let hostName;
    if (existingHost) {
      // Host ya existe, usar el nombre existente
      hostName = existingHost.config.hostName;
      console.log(`\n✅ Host encontrado: ${hostName} (${host.trim()})`);
      console.log(`📊 Procesos existentes para este host: ${existingProcesses.filter(p => p.config.host === host.trim()).length}`);
    } else {
      // Host nuevo, solicitar nombre
      console.log(`\n🆕 Host nuevo detectado: ${host.trim()}`);
      const hostNameInput = await inquirer.prompt([
        { 
          type: "input", 
          name: "hostName", 
          message: "�️  Nombre del Host:", 
          validate: (input) => {
            if (!input.trim()) return "El nombre del host es obligatorio";
            if (input.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
            return true;
          },
          transformer: (input) => input.trim()
        }
      ]);
      hostName = hostNameInput.hostName.trim();
    }

    connectionConfig = await inquirer.prompt([
      { 
        type: "input", 
        name: "port", 
        message: existingHost ? 
          `🔌 Puerto SSH (actual: ${existingHost.config.port}):` : 
          "🔌 Puerto SSH:",
        default: existingHost ? existingHost.config.port : "22",
        validate: (input) => {
          const port = parseInt(input);
          if (isNaN(port) || port < 1 || port > 65535) {
            return "Puerto inválido. Debe ser un número entre 1 y 65535.";
          }
          return true;
        }
      },
      { 
        type: "input", 
        name: "username", 
        message: existingHost ? 
          `👤 Usuario SSH (actual: ${existingHost.config.username}):` : 
          "👤 Usuario SSH:",
        default: existingHost ? existingHost.config.username : undefined,
        validate: (input) => input.trim() ? true : "El usuario es obligatorio"
      },
      {
        type: "password",
        name: "password",
        message: "🔐 Contraseña:",
        mask: "*",
        validate: (input) => input.trim() ? true : "La contraseña es obligatoria"
      },
    ]);

    // Agregar el host y hostName a la configuración
    connectionConfig.host = host.trim();
    connectionConfig.hostName = hostName;

    commandList = [];
    let addMore = true;

    // Limpiar pantalla para la sección de comandos
    console.clear();
    console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║               📋 CONFIGURAR COMANDOS SSH                
    ║                                                    
    ╚═════════════════════════════════════════════════════════════╝
    `);
    
    console.log(`🏠 Host: ${hostName}`);
    console.log(`🌐 Servidor: ${connectionConfig.host}:${connectionConfig.port}`);
    console.log(`👤 Usuario: ${connectionConfig.username}`);
    if (existingHost) {
      const existingCount = existingProcesses.filter(p => p.config.host === connectionConfig.host).length;
      console.log(`📊 Procesos existentes: ${existingCount}`);
    }
    console.log("\n📋 Agrega comandos a ejecutar:");
    console.log("─".repeat(60));

    while (addMore) {
      const { cmd } = await inquirer.prompt([
        { 
          type: "input", 
          name: "cmd", 
          message: `⚙️  Comando ${commandList.length + 1}:`,
          validate: (input) => {
            if (!input.trim()) return "El comando no puede estar vacío";
            return true;
          }
        },
      ]);

      commandList.push(cmd.trim());

      const { again } = await inquirer.prompt([
        {
          type: "confirm",
          name: "again",
          message: "➕ ¿Quieres agregar otro comando?",
          default: false,
        },
      ]);

      addMore = again;
      
      // Si aún hay más comandos por agregar, actualizar la pantalla
      if (again) {
        console.clear();
        console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║               📋 CONFIGURAR COMANDOS SSH                
    ║                                                    
    ╚═════════════════════════════════════════════════════════════╝
    `);
        
        console.log(`🏠 Host: ${hostName}`);
        console.log(`🌐 Servidor: ${connectionConfig.host}:${connectionConfig.port}`);
        console.log(`👤 Usuario: ${connectionConfig.username}`);
        if (existingHost) {
          const existingCount = existingProcesses.filter(p => p.config.host === connectionConfig.host).length;
          console.log(`📊 Procesos existentes: ${existingCount}`);
        }
        console.log("\n📋 Comandos agregados hasta ahora:");
        commandList.forEach((c, i) => {
          console.log(`  ✅ ${i + 1}. ${c}`);
        });
        console.log("─".repeat(60));
      }
    }

    // Limpiar pantalla para la sección de guardado
    console.clear();
    console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║               💾 GUARDAR PROCESO SSH                    
    ║                                                    
    ╚═════════════════════════════════════════════════════════════╝
    `);
    
    console.log(`🏠 Host: ${hostName}`);
    console.log(`🌐 Servidor: ${connectionConfig.host}:${connectionConfig.port}`);
    console.log(`👤 Usuario: ${connectionConfig.username}`);
    console.log(`📋 Comandos configurados: ${commandList.length}`);
    if (existingHost) {
      const existingCount = existingProcesses.filter(p => p.config.host === connectionConfig.host).length;
      console.log(`📊 Procesos existentes en este host: ${existingCount}`);
    }
    
    commandList.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c}`);
    });
    console.log("");

    // Preguntar si desea guardar el proceso
    const { saveProcess } = await inquirer.prompt([
      {
        type: "confirm",
        name: "saveProcess",
        message: "¿Deseas guardar este proceso SSH para uso futuro?",
        default: false,
      },
    ]);

    if (saveProcess) {
      const { name } = await inquirer.prompt([
        {
          type: "input",
          name: "name",
          message: "Nombre para este proceso SSH:",
          validate: (input) => input.trim() ? true : "El nombre no puede estar vacío",
        },
      ]);

      processName = name.trim();
      
      // Guardar el proceso
      const processes = loadSshProcesses();
      const newProcess = {
        id: Date.now(),
        name: processName,
        config: { 
          ...connectionConfig, 
          password: "***", // No guardar la contraseña real
          hostName: connectionConfig.hostName // Asegurar que se guarde el nombre del host
        }, 
        commands: [...commandList],
        createdAt: new Date().toISOString(),
      };
      
      processes.push(newProcess);
      saveSshProcesses(processes);
      
      // Calcular estadísticas del host después de agregar el nuevo proceso
      const hostProcesses = processes.filter(p => p.config.host === connectionConfig.host);
      
      // Mostrar confirmación de guardado
      console.clear();
      console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║               ✅ PROCESO GUARDADO EXITOSAMENTE              
    ║                                                    
    ╚═════════════════════════════════════════════════════════════╝
    `);
      
      console.log(`📝 Nombre del proceso: ${processName}`);
      console.log(`🏠 Host: ${connectionConfig.hostName}`);
      console.log(`🌐 Servidor: ${connectionConfig.host}:${connectionConfig.port}`);
      console.log(`👤 Usuario: ${connectionConfig.username}`);
      console.log(`📋 Comandos guardados: ${commandList.length}`);
      console.log(`📊 Total de procesos en este host: ${hostProcesses.length}`);
      console.log(`📊 Total de procesos guardados: ${processes.length}`);
    }
  }

  // Limpiar pantalla para mostrar resumen antes de ejecutar
  console.clear();
  
  console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║               🚀 RESUMEN DE EJECUCIÓN                   
    ║                                                    
    ╚═════════════════════════════════════════════════════════════╝
    `);

  console.log("\n📋 Tareas a ejecutar:");
  commandList.forEach((c, i) => {
    console.log(`  ⏳ ${i + 1}. ${c}`); // Mostrar comando completo
  });

  console.log(`\n🔧 Configuración de conexión:`);
  console.log(`  🌐 Host: ${connectionConfig.host}:${connectionConfig.port}`);
  console.log(`  👤 Usuario: ${connectionConfig.username}`);
  console.log(`  🏷️  Nombre: ${connectionConfig.hostName || 'Sin nombre'}`);
  
  if (processName) {
    console.log(`  📝 Proceso: ${processName}`);
  }

  const { executeNow } = await inquirer.prompt([
    { 
      type: "confirm", 
      name: "executeNow", 
      message: "🚀 ¿Ejecutar ahora?", 
      default: true 
    },
  ]);

  if (!executeNow) {
    console.log("❌ Proceso cancelado.");
    return;
  }

  const conn = new Client();
  const timestamp = Date.now();
  const logFile = path.join(LOGS_DIR, `ssh-log-${timestamp}.txt`);
  const logStream = fs.createWriteStream(logFile);
  
  const startTime = Date.now();
  let completedTasks = 0;
  let taskStatuses = new Array(commandList.length).fill('⏳');
  let executionLog = []; // Para almacenar el log detallado de ejecución
  let startCommandIndex = 0; // Índice desde donde comenzar la ejecución

  // Función interna para ejecutar comandos
  const executeCommands = async (fromIndex = 0) => {
    return new Promise((resolve) => {
      conn
        .on("ready", async () => {
          // Mostrar información inicial sin ruido
          displayTaskProgress(connectionConfig.host, commandList.length, commandList, taskStatuses);
          
          // Agregar comando cd al inicio para ir a la raíz
          const allCommands = ["cd ~", ...commandList];
          
          try {
            // Ejecutar comandos uno por uno manteniendo el contexto del directorio
            let currentDirectory = "~"; // Directorio inicial
            
            for (let i = fromIndex; i < commandList.length; i++) {
              const cmd = commandList[i];
              const commandName = cmd; // Usar comando completo
              
              // Mostrar estado actual de forma limpia
              displayTaskProgress(connectionConfig.host, commandList.length, commandList, taskStatuses, i);
              
              // Preparar el comando con contexto de directorio
              let fullCommand;
              
              // Si es un comando cd, actualizamos el directorio actual
              if (cmd.trim().startsWith('cd ')) {
                const targetDir = cmd.trim().substring(3).trim();
                // Si el directorio es relativo, construir la ruta completa
                if (targetDir.startsWith('/')) {
                  currentDirectory = targetDir;
                } else if (targetDir === '~' || targetDir === '') {
                  currentDirectory = '~';
                } else {
                  // Directorio relativo - construir desde el directorio actual
                  currentDirectory = currentDirectory === '~' ? `~/${targetDir}` : `${currentDirectory}/${targetDir}`;
                }
                fullCommand = `cd ${currentDirectory} && pwd`; // Verificar que el cambio fue exitoso
              } else {
                // Para cualquier otro comando, ejecutar en el directorio actual
                fullCommand = `cd ${currentDirectory} && ${cmd}`;
              }
              
              // Verificar si es un comando de larga duración antes de ejecutar
              if (isLongRunningCommand(cmd)) {
                // Calcular comandos restantes
                const remainingCommands = commandList.slice(i + 1);
                
                // Usar la nueva función con contador dinámico
                const longRunningAction = await handleParallelCommandChoice(cmd, remainingCommands);

                if (longRunningAction === "parallel") {
                  // NUEVO ENFOQUE: Ejecutar y esperar a estar listo, luego crear conexión paralela
                  // Limpiar pantalla para eliminar el ruido de la selección de opciones
                  console.clear();
                  console.log(`✅ Conectado a ${connectionConfig.host}`);
                  console.log(`� Ejecutando ${commandList.length} tarea(s)...\n`);
                  
                  // Mostrar progreso usando función centralizada
                  displayTaskProgress(connectionConfig.host, commandList.length, commandList, taskStatuses, i);
                  
                  const longRunningResult = await executeAndWaitForReady(
                    conn, 
                    fullCommand, 
                    cmd, 
                    logStream, 
                    connectionConfig
                  );
                  
                  if (longRunningResult.success) {
                    taskStatuses[i] = '🔗'; // Indicador para "ejecutándose en paralelo"
                    completedTasks++;
                    
                    executionLog.push({
                      command: cmd,
                      status: '🔗',
                      output: `Ejecutándose en paralelo. Método: ${longRunningResult.method}`,
                      exitCode: 0,
                      parallel: true,
                      validationInfo: longRunningResult.stateValidation
                    });
                    
                    // Si hay más comandos por ejecutar, crear conexión paralela
                    const remainingCommands = commandList.slice(i + 1);
                    if (remainingCommands.length > 0) {
                      try {
                        // Crear nueva conexión SSH paralela
                        const parallelConn = await createParallelConnection(connectionConfig);
                        
                        // Ejecutar comandos restantes en la nueva conexión
                        const parallelResult = await executeRemainingCommands(
                          parallelConn,
                          remainingCommands,
                          currentDirectory,
                          connectionConfig,
                          logStream,
                          executionLog,
                          taskStatuses,
                          i + 1 // Índice de inicio
                        );
                        
                        // Actualizar contadores
                        completedTasks += parallelResult.completed;
                        
                        // Cerrar conexión paralela
                        parallelConn.end();
                        
                      } catch (parallelError) {
                        console.error(`❌ Error en conexión paralela: ${parallelError}`);
                        console.log(`⚠️  Continuando con el enfoque normal...`);
                        
                        // Si falla la conexión paralela, continuar normalmente
                        continue;
                      }
                    }
                    
                    // Salir del bucle principal ya que los comandos restantes se ejecutaron en paralelo
                    break;
                    
                  } else if (longRunningResult.method === 'exit_with_error') {
                    taskStatuses[i] = '❌';
                    console.error(`❌ El comando terminó con error (código: ${longRunningResult.exitCode})`);
                    
                    executionLog.push({
                      command: cmd,
                      status: '❌',
                      output: longRunningResult.error || 'Comando terminó con error',
                      exitCode: longRunningResult.exitCode
                    });
                    
                    // Ofrecer opciones de debug
                    const { debugChoice } = await inquirer.prompt([
                      {
                        type: "list",
                        name: "debugChoice",
                        message: "El comando terminó con error. ¿Cómo proceder?",
                        choices: [
                          { name: "🔧 Entrar en modo debug", value: "debug" },
                          { name: "⏭️  Saltar y continuar", value: "skip" },
                          { name: "🚪 Finalizar proceso", value: "terminate" }
                        ]
                      }
                    ]);
                    
                    if (debugChoice === "debug") {
                      const debugResult = await debugMode(conn, connectionConfig, executionLog, commandList, i);
                      if (debugResult === "terminate_connection") {
                        resolve({ terminated: true });
                        return;
                      }
                    } else if (debugChoice === "terminate") {
                      resolve({ terminated: true });
                      return;
                    }
                    // Si skip, continúa con el siguiente comando
                    
                  } else {
                    taskStatuses[i] = '❌';
                    console.error(`❌ Error ejecutando comando: ${longRunningResult.reason} (${longRunningResult.method})`);
                    
                    executionLog.push({
                      command: cmd,
                      status: '❌',
                      output: longRunningResult.error || `Error: ${longRunningResult.reason}`,
                      exitCode: 1,
                      validationInfo: longRunningResult.stateValidation
                    });
                    
                    // Ofrecer opciones de debug
                    const { debugChoice } = await inquirer.prompt([
                      {
                        type: "list",
                        name: "debugChoice",
                        message: "El comando no se validó correctamente. ¿Cómo proceder?",
                        choices: [
                          { name: "🔧 Entrar en modo debug", value: "debug" },
                          { name: "⏭️  Saltar y continuar", value: "skip" },
                          { name: "🚪 Finalizar proceso", value: "terminate" }
                        ]
                      }
                    ]);
                    
                    if (debugChoice === "debug") {
                      const debugResult = await debugMode(conn, connectionConfig, executionLog, commandList, i);
                      if (debugResult === "terminate_connection") {
                        resolve({ terminated: true });
                        return;
                      }
                    } else if (debugChoice === "terminate") {
                      resolve({ terminated: true });
                      return;
                    }
                    // Si skip, continúa con el siguiente comando
                  }
                  
                  continue; // Continuar con el siguiente comando (si no se creó conexión paralela)
                  
                } else if (longRunningAction === "skip") {
                  taskStatuses[i] = '⏭️';
                  // Comando saltado - sin mostrar mensaje adicional para mantener interfaz limpia
                  
                  executionLog.push({
                    command: cmd,
                    status: '⏭️',
                    output: 'Comando saltado por el usuario',
                    exitCode: 0
                  });
                  continue;
                  
                } else if (longRunningAction === "debug") {
                  // Entrar directamente en modo debug sin mostrar output del comando
                  
                  conn.exec(fullCommand, { pty: true }, (err, stream) => {
                    if (err) {
                      console.error(`❌ Error: ${err}`);
                      return;
                    }
                    
                    // No mostrar output en tiempo real para mantener interfaz limpia
                    stream.on("data", () => {
                      // Silenciar output del comando durante debug
                    });
                  });
                  
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  const debugResult = await debugMode(conn, connectionConfig, executionLog, commandList, i);
                  
                  if (debugResult === "terminate_connection") {
                    conn.end();
                    logStream.end();
                    resolve({ terminated: true });
                    return;
                  } else {
                    taskStatuses[i] = '🔧';
                    completedTasks++;
                    
                    executionLog.push({
                      command: cmd,
                      status: '🔧',
                      output: 'Comando ejecutado en modo debug',
                      exitCode: 0
                    });
                    continue;
                  }
                }
                // Si eligió "wait", continúa con la ejecución normal
              }
              
              const commandResult = await new Promise((cmdResolve) => {
                // Crear loader para mostrar progreso
                const loader = createLoader(`Ejecutando: ${cmd}`);
                
                conn.exec(fullCommand, { pty: true }, (err, stream) => {
                  if (err) {
                    loader.stop(); // Detener loader antes de mostrar error
                    logStream.write(`ERROR en ${cmd}: ${err}\n`);
                    taskStatuses[i] = '❌';
                    
                    // Agregar al log de ejecución
                    executionLog.push({
                      command: cmd,
                      status: '❌',
                      output: `ERROR: ${err}`,
                      exitCode: 1
                    });
                    
                    cmdResolve({ success: false, error: err, commandIndex: i });
                    return;
                  }

                  let output = "";
                  let sudoPrompted = false;
                  
                  // Crear manejador de timeout para este comando
                  const passwordHandler = createPasswordTimeoutHandler(
                    stream, 
                    connectionConfig.password, 
                    commandName, // Usar comando completo
                    logStream
                  );
                  
                  // Obtener patrones específicos para este comando
                  const specificPatterns = getCommandSpecificPatterns(cmd);

                  stream
                    .on("close", (code) => {
                      loader.stop(); // Detener loader cuando termine el comando
                      passwordHandler.cancel(); // Cancelar timeout
                      
                      logStream.write(`\n=== COMANDO: ${cmd} ===\n`);
                      logStream.write(`DIRECTORIO ACTUAL: ${currentDirectory}\n`);
                      logStream.write(`COMANDO EJECUTADO: ${fullCommand}\n`);
                      logStream.write(output);
                      logStream.write(`\n=== FIN COMANDO (código: ${code}) ===\n\n`);
                      
                      // Agregar al log de ejecución
                      const logEntry = {
                        command: cmd,
                        status: code === 0 ? '✅' : '❌',
                        output: output,
                        exitCode: code
                      };
                      
                      executionLog.push(logEntry);
                      
                      if (code === 0) {
                        taskStatuses[i] = '✅';
                        completedTasks++;
                        cmdResolve({ success: true, commandIndex: i });
                      } else {
                        taskStatuses[i] = '❌';
                        cmdResolve({ success: false, exitCode: code, commandIndex: i, output });
                      }
                    })
                    .on("data", (data) => {
                      const analysis = analyzeStreamOutput(data, cmd);
                      output += analysis.originalData;
                      
                      // Manejar solicitudes de contraseña con análisis avanzado
                      if (!passwordHandler.isResponded()) {
                        // Verificar con análisis general
                        if (analysis.isSudoPrompt || analysis.isPasswordPrompt) {
                          if (analysis.confidence >= 75) {
                            passwordHandler.triggerPasswordSend(`Detectado prompt (confianza: ${analysis.confidence}%) - `);
                          }
                        }
                        
                        // Verificar con patrones específicos del comando
                        for (const { pattern, confidence } of specificPatterns) {
                          if (pattern.test(analysis.originalData) && confidence >= 70) {
                            passwordHandler.triggerPasswordSend(`Patrón específico detectado (${confidence}%) - `);
                            break;
                          }
                        }
                        
                        // Detección adicional para casos edge
                        if (analysis.originalData.includes(':') && 
                            analysis.originalData.trim().endsWith(':') &&
                            analysis.originalData.toLowerCase().includes('password')) {
                          passwordHandler.triggerPasswordSend("Formato típico de prompt detectado - ");
                        }
                      }
                    })
                    .stderr.on("data", (data) => {
                      const analysis = analyzeStreamOutput(data, cmd);
                      output += `[STDERR] ${analysis.originalData}`;
                      
                      // También revisar stderr para prompts de contraseña
                      if (!passwordHandler.isResponded()) {
                        if (analysis.isSudoPrompt || analysis.isPasswordPrompt) {
                          if (analysis.confidence >= 75) {
                            passwordHandler.triggerPasswordSend(`Detectado prompt en stderr (confianza: ${analysis.confidence}%) - `);
                          }
                        }
                        
                        // Verificar patrones específicos en stderr
                        for (const { pattern, confidence } of specificPatterns) {
                          if (pattern.test(analysis.originalData) && confidence >= 70) {
                            passwordHandler.triggerPasswordSend(`Patrón específico en stderr (${confidence}%) - `);
                            break;
                          }
                        }
                      }
                    });
                });
              });
              
              // Si el comando falló, ofrecer modo debug de forma limpia
              if (!commandResult.success) {
                // Limpiar pantalla y mostrar error de forma limpia
                console.clear();
                console.log(`❌ Error detectado en comando: ${cmd}`);
                console.log(`🔧 Código de salida: ${commandResult.exitCode || 'desconocido'}`);
                console.log("");
                
                const { debugChoice } = await inquirer.prompt([
                  {
                    type: "list",
                    name: "debugChoice",
                    message: "🔧 ¿Cómo deseas proceder?",
                    choices: [
                      {
                        name: "🔧 Entrar en modo debug",
                        value: "debug"
                      },
                      {
                        name: "⏭️  Saltar este comando y continuar",
                        value: "skip"
                      },
                      {
                        name: "🚪 Finalizar proceso",
                        value: "terminate"
                      }
                    ]
                  }
                ]);
                
                if (debugChoice === "debug") {
                  const debugResult = await debugMode(conn, connectionConfig, executionLog, commandList, i);
                  
                  if (debugResult === "terminate_connection") {
                    console.log("\n🚪 Finalizando conexión...");
                    conn.end();
                    logStream.end();
                    resolve({ terminated: true });
                    return;
                  } else if (debugResult === "continue_process") {
                    // Salir del modo debug y mostrar opciones
                    const postDebugAction = await postDebugOptions(commandList, i, processName);
                    
                    if (postDebugAction === "restart_from_beginning") {
                      console.log("\n🔄 Reiniciando proceso desde el inicio...");
                      conn.end();
                      setTimeout(() => executeCommands(0), 1000);
                      return;
                    } else if (postDebugAction === "continue_from_error") {
                      console.log("\n▶️  Continuando desde el comando que falló...");
                      continue; // Continuar el bucle desde el comando actual
                    } else if (postDebugAction === "skip_and_continue") {
                      console.log("\n⏭️  Saltando comando fallido y continuando...");
                      taskStatuses[i] = '⏭️';
                      continue; // Saltar al siguiente comando
                    } else if (postDebugAction === "terminate_process") {
                      console.log("\n🚪 Finalizando proceso...");
                      conn.end();
                      logStream.end();
                      resolve({ terminated: true });
                      return;
                    }
                  }
                } else if (debugChoice === "skip") {
                  console.log(`\n⏭️  Saltando comando: ${cmd}`);
                  taskStatuses[i] = '⏭️';
                  continue;
                } else if (debugChoice === "terminate") {
                  console.log("\n🚪 Finalizando proceso...");
                  conn.end();
                  logStream.end();
                  resolve({ terminated: true });
                  return;
                }
              }
            }
            
            // Si llegamos aquí, todos los comandos se ejecutaron
            resolve({ success: true });
            
          } catch (error) {
            console.error("❌ Error durante la ejecución:", error);
            logStream.write(`ERROR GENERAL: ${error}\n`);
            conn.end();
            logStream.end();
            resolve({ error: error });
          }
        })
        .on("error", (err) => {
          console.error("❌ Error de conexión:", err);
          logStream.write(`ERROR DE CONEXIÓN: ${err}\n`);
          logStream.end();
          resolve({ connectionError: err });
        })
        // Handler para autenticación keyboard-interactive (algunos servidores usan este método)
        .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
          try {
            // Si el servidor solicita una respuesta (p. ej. contraseña), responder con la contraseña
            if (prompts && prompts.length > 0) {
              // Usar la contraseña proporcionada en connectionConfig
              finish([connectionConfig.password]);
            } else {
              finish([]);
            }
          } catch (e) {
            // En caso de error, responder vacío para no bloquear
            finish([]);
          }
        })
        .connect({
          host: connectionConfig.host,
          port: parseInt(connectionConfig.port, 10) || 22,
          username: connectionConfig.username,
          password: connectionConfig.password,
          // Intentar keyboard-interactive si el servidor lo requiere
          tryKeyboard: true,
        });
    });
  };

  // Ejecutar los comandos
  const result = await executeCommands(startCommandIndex);

  // Mostrar resultado final
  console.clear();
  const endTime = Date.now();
  const totalTime = Math.round((endTime - startTime) / 1000);
  
  if (result.terminated) {
    console.log(`🚪 Proceso terminado por el usuario.`);
    console.log(`📄 Log guardado en: ${logFile}`);
    
    // Añadir opción para ver logs de la sesión
    console.log(`\n${'─'.repeat(50)}`);
    const { viewLogs } = await inquirer.prompt([
      {
        type: "confirm",
        name: "viewLogs",
        message: "📋 ¿Deseas ver los logs completos de la sesión?",
        default: false,
      }
    ]);
    
    if (viewLogs) {
      await showSessionLogs(logFile);
    }
  } else if (result.error || result.connectionError) {
    console.log(`❌ Proceso terminado por error:`);
    console.log(`   ${result.error || result.connectionError}`);
    console.log(`📄 Log guardado en: ${logFile}`);
    
    // Añadir opción para ver logs de la sesión
    console.log(`\n${'─'.repeat(50)}`);
    const { viewLogs } = await inquirer.prompt([
      {
        type: "confirm",
        name: "viewLogs",
        message: "📋 ¿Deseas ver los logs completos de la sesión?",
        default: false,
      }
    ]);
    
    if (viewLogs) {
      await showSessionLogs(logFile);
    }
  } else {
    console.log(`📊 Resumen de ejecución:`);
    console.log(`─`.repeat(50));
    console.log(`📝 Total de tareas: ${commandList.length}`);
    console.log(`✅ Ejecutadas exitosamente: ${completedTasks}`);
    console.log(`❌ Fallidas: ${commandList.length - completedTasks}`);
    console.log(`⏱️  Tiempo total: ${totalTime} segundos`);
    console.log(`📄 Log guardado en: ${logFile}`);
    
    if (completedTasks === commandList.length) {
      console.log(`\n🎉 ¡Todas las tareas se completaron exitosamente!`);
    } else {
      console.log(`\n⚠️  Algunas tareas fallaron. Revisa el log para más detalles.`);
    }
    
    console.log(`\n📋 Detalle de tareas:`);
    commandList.forEach((c, i) => {
      const status = taskStatuses[i];
      let statusDescription = "";
      
      // Agregar descripción para los nuevos estados
      if (status === '🔗') {
        statusDescription = " (ejecutándose en conexión paralela)";
      } else if (status === '🔄') {
        statusDescription = " (ejecutándose en background)";
      } else if (status === '⏭️') {
        statusDescription = " (saltado)";
      } else if (status === '🔧') {
        statusDescription = " (ejecutado en modo debug)";
      }
      
      console.log(`  ${status} ${i + 1}. ${c}${statusDescription}`);
    });
  }
  
  // Añadir opción para ver logs de la sesión
  console.log(`\n${'─'.repeat(50)}`);
  const { viewLogs } = await inquirer.prompt([
    {
      type: "confirm",
      name: "viewLogs",
      message: "📋 ¿Deseas ver los logs completos de la sesión?",
      default: false,
    }
  ]);
  
  if (viewLogs) {
    await showSessionLogs(logFile);
  }
}

// Función para mostrar los logs de la sesión en formato consola
async function showSessionLogs(logFile) {
  console.clear();
  
  console.log(`
╔═══════════════════════════════════════════════════════════════════════════════╗
║                            📋 LOGS DE LA SESIÓN                            ║
╚═══════════════════════════════════════════════════════════════════════════════╝
`);
  
  console.log(`📄 Archivo de log: ${logFile}\n`);
  
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(logFile)) {
      console.log(`❌ El archivo de log no existe: ${logFile}`);
      console.log(`💡 Es posible que el proceso no se haya ejecutado completamente o que el archivo se haya movido.`);
      return;
    }
    
    // Leer el contenido del archivo
    const logContent = fs.readFileSync(logFile, 'utf8');
    
    if (!logContent.trim()) {
      console.log(`📭 El archivo de log está vacío.`);
      return;
    }
    
    // Mostrar el contenido del log línea por línea
    const lines = logContent.split('\n');
    
    console.log(`📊 Total de líneas: ${lines.length}`);
    console.log(`─`.repeat(80));
    console.log('');
    
    // Mostrar las líneas del log
    lines.forEach((line, index) => {
      // Si la línea contiene marcadores especiales, añadir formato
      if (line.includes('=== COMANDO:')) {
        console.log(`\n🔵 ${line}`);
      } else if (line.includes('=== FIN COMANDO')) {
        console.log(`🔴 ${line}\n`);
      } else if (line.includes('=== BACKGROUND COMMAND:')) {
        console.log(`\n🔄 ${line}`);
      } else if (line.includes('[AUTO-RESPONSE]')) {
        console.log(`🔐 ${line}`);
      } else if (line.includes('ERROR')) {
        console.log(`❌ ${line}`);
      } else if (line.includes('DIRECTORIO ACTUAL:')) {
        console.log(`📁 ${line}`);
      } else if (line.includes('COMANDO EJECUTADO:')) {
        console.log(`⚙️  ${line}`);
      } else if (line.includes('REMOTE LOG PATH:')) {
        console.log(`📋 ${line}`);
      } else if (line.trim()) {
        // Línea normal con contenido
        console.log(`   ${line}`);
      } else {
        // Línea vacía
        console.log('');
      }
    });
    
    console.log('\n' + `─`.repeat(80));
    console.log(`📊 Fin del log - Total de líneas mostradas: ${lines.length}`);
    
  } catch (error) {
    console.error(`❌ Error al leer el archivo de log: ${error.message}`);
    console.log(`💡 Verifica que tienes permisos para leer el archivo: ${logFile}`);
  }
  
  console.log(`\n💡 Presiona Enter para volver al menú...`);
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: "",
    }
  ]);
}

// Mostrar ayuda del CLI
function showHelp() {
  console.log(`
    ╔══════════════════════════════════════════════════════════════════════╗
    ║                       📚 SSH CLI - AYUDA                     
    ╠══════════════════════════════════════════════════════════════════════╣
    ║                                                          
    ║  📋 COMANDOS DISPONIBLES:                                
    ║                                                          
    ║  🚀 (sin argumentos)                   Modo interactivo        
    ║  🆘 help                               Mostrar esta ayuda         
    ║  📋 list                               Listar procesos por host   
    ║  🚀 start                              Crear nuevo proceso SSH    
    ║  ▶️  start -p <id>                     Ejecutar por ID (obsoleto)
    ║  ▶️  start -h <host_id> -p <posición>  Ejecutar por host ID/posición
    ║  🗑️  delete -p <id>                    Eliminar proceso guardado 
    ║                                                          
    ╠══════════════════════════════════════════════════════════════════════╣
    ║  💡 EJEMPLOS DE USO:                                     
    ║                                                           
    ║  ssh-cli                              (modo interactivo)
    ║  ssh-cli start                                            
    ║  ssh-cli list                                             
    ║  ssh-cli start -h 1 -p 2              (host ID 1, posición 2)
    ║  ssh-cli start -p 1                   (método obsoleto)            
    ║  ssh-cli delete -p 2                                      
    ║                                                           
    ╠═══════════════════════════════════════════════════════════════════════╣
    ║  🔧 CARACTERÍSTICAS NUEVAS:                              
    ║                                                          
    ║  • 🖱️  Modo interactivo con menús navegables             
    ║  • ✅ Validación avanzada de inputs                      
    ║  • 🧠 Historial de comandos navegable                    
    ║  • 📊 Estadísticas detalladas de procesos                
    ║  • 🎨 Interfaz mejorada con emojis                       
    ║  • 🔍 Selección visual de hosts y procesos               
    ║  • 🔗 NUEVO: Conexiones SSH paralelas inteligentes       
    ║  • 🎯 NUEVO: Detección automática de servidores listos   
    ║                                                          
    ╠═══════════════════════════════════════════════════════════════════════╣
    ║  🔧 CARACTERÍSTICAS TÉCNICAS:                            
    ║                                                          
    ║  • Gestión completa de conexiones SSH                    
    ║  • Agrupación de procesos por nombre de host             
    ║  • Selección por ID de host y posición                   
    ║  • Detección automática de prompts sudo                  
    ║  • Registro detallado de todas las ejecuciones           
    ║  • Persistencia del contexto de directorio               
    ║  • 🆕 Conexiones SSH paralelas para comandos largos      
    ║  • 🆕 Validación por estado de proceso remoto            
    ║  • 🆕 Detección inteligente sin dependencia de patrones  
    ║  • 🆕 Ejecución anidada de múltiples servidores          
    ║                                                          
    ╚═══════════════════════════════════════════════════════════════════════╝
  `);
}

// Menú interactivo principal
async function showInteractiveMenu() {
  while (true) {
    // Limpiar pantalla para modo interactivo
    console.clear();
    
    console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║              _____ _____ _   _     _____  _     _  
    ║             |   __|   __| |_| |   |  ___|| |   | | 
    ║             |___  |___  |  _  |   | |___ | |___| | 
    ║             |_____|_____|_| |_|   |_____||_____|_| 
    ║                                                    
    ║             🚀 SSH Remote Command Executor v1.1.1  
    ║                                                    
    ╠══════════════════════════════════════════════════════════════
    ║                                                        
    ║  📋 Gestiona conexiones SSH y ejecuta comandos remotos 
    ║  💾 Guarda procesos para reutilización futura          
    ║  🔐 Soporte automático para comandos sudo              
    ║  📊 Registro detallado de ejecuciones                  
    ║                                                        
    ╚═════════════════════════════════════════════════════════════╝
    `);

    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "🚀 ¿Qué deseas hacer?",
        choices: [
          {
            name: "📋 Navegar procesos SSH por host",
            value: "list"
          },
          {
            name: "🚀 Crear nuevo proceso SSH",
            value: "create"
          },
          {
            name: "▶️  Ejecutar proceso (selección rápida)",
            value: "execute"
          },
          {
            name: "🗑️  Eliminar proceso",
            value: "delete"
          },
          {
            name: "📊 Ver estadísticas",
            value: "stats"
          },
          {
            name: "🆘 Ver ayuda",
            value: "help"
          },
          {
            name: "🚪 Salir",
            value: "exit"
          }
        ],
        pageSize: 10
      }
    ]);

    switch (action) {
      case "list":
        await showInteractiveHostNavigation();
        break;
      
      case "create":
        await runSshProcess();
        await waitForKeyPress();
        break;
      
      case "execute":
        await executeInteractiveProcess();
        await waitForKeyPress();
        break;
      
      case "delete":
        await deleteInteractiveProcess();
        await waitForKeyPress();
        break;
      
      case "stats":
        console.clear();
        showProcessStatistics();
        await waitForKeyPress();
        break;
      
      case "help":
        console.clear();
        showHelp();
        await waitForKeyPress();
        break;
      
      case "exit":
        console.log("\n👋 ¡Hasta luego!");
        return;
    }
  }
}

// Función para pausar y esperar input del usuario
async function waitForKeyPress() {
  console.log("\n" + "─".repeat(50));
  await inquirer.prompt([
    {
      type: "input",
      name: "continue",
      message: "Presiona Enter para continuar...",
    }
  ]);
}

// Navegación interactiva de hosts y procesos
async function showInteractiveHostNavigation() {
  const processes = loadSshProcesses();
  
  if (processes.length === 0) {
    console.clear();
    console.log("\n📭 No hay procesos SSH guardados.");
    console.log("💡 Crea uno nuevo primero usando 'Crear nuevo proceso SSH'.");
    return;
  }

  // Agrupar procesos por host
  const groupedByHost = {};
  processes.forEach((proc, originalIndex) => {
    const hostName = proc.config.hostName || 'Sin nombre de host';
    if (!groupedByHost[hostName]) {
      groupedByHost[hostName] = [];
    }
    groupedByHost[hostName].push({
      ...proc,
      originalIndex: originalIndex
    });
  });

  const hostEntries = Object.entries(groupedByHost);
  
  while (true) {
    // Limpiar pantalla antes de mostrar listado de hosts
    console.clear();
    
    // Mostrar listado simplificado de hosts
    console.log("\n📋 Procesos SSH Guardados (Agrupados por Host)");
    console.log("═".repeat(55));
    
    hostEntries.forEach(([hostName, hostProcesses], hostIndex) => {
      const hostId = hostIndex + 1;
      console.log(`🏠 HOST ID: ${hostId} | NOMBRE: ${hostName}`);
      console.log(`📊 Total de procesos: ${hostProcesses.length}`);
      
      hostProcesses.forEach((proc, processIndex) => {
        console.log(`\t${processIndex + 1}. ${proc.name || `Proceso ${proc.originalIndex + 1}`}`);
      });
      console.log(""); // Línea en blanco entre hosts
    });

    // Crear opciones para el selector de hosts
    const hostChoices = hostEntries.map(([hostName, hostProcesses], index) => ({
      name: `🏠 ${hostName} (${hostProcesses.length} proceso${hostProcesses.length !== 1 ? 's' : ''})`,
      value: index
    }));

    // Agregar opción para salir
    hostChoices.push({
      name: "🚪 Volver al menú principal",
      value: -1
    });

    const { selectedHostIndex } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedHostIndex",
        message: "¿Qué host deseas navegar?",
        choices: hostChoices,
        pageSize: 10
      }
    ]);

    if (selectedHostIndex === -1) {
      // Salir al menú principal
      break;
    }

    // Navegar procesos del host seleccionado
    const [hostName, hostProcesses] = hostEntries[selectedHostIndex];
    await navigateHostProcesses(hostName, hostProcesses);
  }
}

// Navegar procesos de un host específico
async function navigateHostProcesses(hostName, hostProcesses) {
  while (true) {
    // Limpiar pantalla antes de mostrar procesos del host
    console.clear();
    
    console.log(`\n🏠 Host: ${hostName}`);
    console.log(`📊 Procesos disponibles: ${hostProcesses.length}`);
    console.log("─".repeat(50));

    // Crear opciones para el selector de procesos
    const processChoices = hostProcesses.map((proc, index) => ({
      name: `📝 ${proc.name || `Proceso ${proc.originalIndex + 1}`} (${proc.commands.length} comando${proc.commands.length !== 1 ? 's' : ''})`,
      value: index,
      short: proc.name || `Proceso ${proc.originalIndex + 1}`
    }));

    // Agregar opción para volver a la lista de hosts
    processChoices.push({
      name: "⬅️  Volver a la lista de hosts",
      value: -1
    });

    const { selectedProcessIndex } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedProcessIndex",
        message: `📋 Selecciona un proceso de "${hostName}":`,
        choices: processChoices,
        pageSize: 10
      }
    ]);

    if (selectedProcessIndex === -1) {
      // Volver a la lista de hosts
      break;
    }

    // Mostrar detalles del proceso seleccionado
    const selectedProcess = hostProcesses[selectedProcessIndex];
    await showProcessDetails(selectedProcess, hostName);
  }
}

// Mostrar detalles de un proceso específico
async function showProcessDetails(process, hostName) {
  // Limpiar pantalla antes de mostrar detalles del proceso
  console.clear();
  
  const dateStr = new Date(process.createdAt).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  }) + ' ' + new Date(process.createdAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  console.log(`\n📊 Detalles del Proceso`);
  console.log("═".repeat(50));
  console.log(`┌─ Información del proceso ────────────────────────────────────────┐`);
  console.log(`│ 📝 Nombre: ${process.name || 'Sin nombre'}`);
  console.log(`│ 🏠 Host: ${hostName}`);
  console.log(`│ 🌐 Servidor: ${process.config.host}:${process.config.port}`);
  console.log(`│ 👤 Usuario: ${process.config.username}`);
  console.log(`│ 📅 Creado: ${dateStr}`);
  console.log(`│ ⚙️  Comandos: ${process.commands.length} comando(s)`);
  console.log(`└───────────────────────────────────────────────────────────────────┘`);
  
  console.log(`\n📋 Lista de comandos:`);
  process.commands.forEach((cmd, i) => {
    console.log(`  ${(i + 1).toString().padStart(2)}. ${cmd}`);
  });

  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "¿Qué deseas hacer?",
      choices: [
        {
          name: "🚀 Ejecutar este proceso",
          value: "execute"
        },
        {
          name: "⬅️  Volver a la lista de procesos",
          value: "back"
        }
      ]
    }
  ]);

  if (action === "execute") {
    await runSshProcess(process);
    await waitForKeyPress();
  }
  // Si action === "back", simplemente retorna y vuelve a la lista de procesos
}

// Ejecutar proceso de forma interactiva
async function executeInteractiveProcess() {
  const processes = loadSshProcesses();
  
  // Limpiar pantalla para el modo de ejecución interactiva
  console.clear();
  
  if (processes.length === 0) {
    console.log("\n📭 No hay procesos SSH guardados.");
    console.log("💡 Crea uno nuevo primero usando 'Crear nuevo proceso SSH'.");
    return;
  }

  // Agrupar procesos por host
  const groupedByHost = {};
  processes.forEach((proc, originalIndex) => {
    const hostName = proc.config.hostName || 'Sin nombre de host';
    if (!groupedByHost[hostName]) {
      groupedByHost[hostName] = [];
    }
    groupedByHost[hostName].push({
      ...proc,
      originalIndex: originalIndex
    });
  });

  const hostEntries = Object.entries(groupedByHost);
  
  // Crear opciones para el selector de hosts
  const hostChoices = hostEntries.map(([hostName, hostProcesses], index) => ({
    name: `🏠 ${hostName} (${hostProcesses.length} proceso${hostProcesses.length !== 1 ? 's' : ''})`,
    value: index
  }));

  const { selectedHostIndex } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedHostIndex",
      message: "🏠 Selecciona un host:",
      choices: hostChoices,
      pageSize: 10
    }
  ]);

  const [hostName, hostProcesses] = hostEntries[selectedHostIndex];
  
  // Crear opciones para el selector de procesos
  const processChoices = hostProcesses.map((proc, index) => ({
    name: `📝 ${proc.name || `Proceso ${proc.originalIndex + 1}`} (${proc.commands.length} comando${proc.commands.length !== 1 ? 's' : ''})`,
    value: index,
    short: proc.name || `Proceso ${proc.originalIndex + 1}`
  }));

  const { selectedProcessIndex } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProcessIndex",
      message: `📋 Selecciona un proceso de "${hostName}":`,
      choices: processChoices,
      pageSize: 10
    }
  ]);

  const selectedProcess = hostProcesses[selectedProcessIndex];
  
  // Mostrar información del proceso antes de ejecutar
  console.clear(); // Limpiar antes de mostrar información del proceso
  console.log(`\n📊 Información del proceso:`);
  console.log(`┌─ Proceso seleccionado ────────────────────────────────────────────┐`);
  console.log(`│ 📝 Nombre: ${selectedProcess.name || 'Sin nombre'}`);
  console.log(`│ 🏠 Host: ${hostName}`);
  console.log(`│ 🌐 Servidor: ${selectedProcess.config.host}:${selectedProcess.config.port}`);
  console.log(`│ 👤 Usuario: ${selectedProcess.config.username}`);
  console.log(`│ ⚙️  Comandos: ${selectedProcess.commands.length} comando(s)`);
  console.log(`└───────────────────────────────────────────────────────────────────┘`);
  
  console.log(`\n📋 Comandos a ejecutar:`);
  selectedProcess.commands.forEach((cmd, i) => {
    console.log(`  ${i + 1}. ${cmd}`);
  });

  const { confirmExecution } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmExecution",
      message: "¿Deseas ejecutar este proceso?",
      default: true
    }
  ]);

  if (confirmExecution) {
    await runSshProcess(selectedProcess);
  } else {
    console.log("❌ Ejecución cancelada.");
  }
}

// Eliminar proceso de forma interactiva
async function deleteInteractiveProcess() {
  const processes = loadSshProcesses();
  
  // Limpiar pantalla para el modo de eliminación
  console.clear();
  
  if (processes.length === 0) {
    console.log("\n📭 No hay procesos SSH guardados para eliminar.");
    return;
  }

  // Crear opciones para el selector de procesos a eliminar
  const processChoices = processes.map((proc, index) => ({
    name: `📝 ${proc.name || `Proceso ${index + 1}`} - 🏠 ${proc.config.hostName || 'Sin nombre'} (${proc.config.host})`,
    value: index,
    short: proc.name || `Proceso ${index + 1}`
  }));

  // Agregar opción para cancelar
  processChoices.push({
    name: "❌ Cancelar",
    value: -1
  });

  const { selectedProcessIndex } = await inquirer.prompt([
    {
      type: "list",
      name: "selectedProcessIndex",
      message: "🗑️  Selecciona el proceso a eliminar:",
      choices: processChoices,
      pageSize: 10
    }
  ]);

  if (selectedProcessIndex === -1) {
    console.log("❌ Operación cancelada.");
    return;
  }

  const processToDelete = processes[selectedProcessIndex];
  
  // Mostrar información del proceso antes de eliminar
  console.clear(); // Limpiar antes de mostrar información del proceso a eliminar
  console.log(`\n⚠️  Estás a punto de eliminar:`);
  console.log(`┌─ Proceso a eliminar ──────────────────────────────────────────────┐`);
  console.log(`│ 📝 Nombre: ${processToDelete.name || `Proceso ${selectedProcessIndex + 1}`}`);
  console.log(`│ 🏠 Host: ${processToDelete.config.hostName || 'Sin nombre'}`);
  console.log(`│ 🌐 Servidor: ${processToDelete.config.host}:${processToDelete.config.port}`);
  console.log(`│ 👤 Usuario: ${processToDelete.config.username}`);
  console.log(`│ ⚙️  Comandos: ${processToDelete.commands.length} comando(s)`);
  console.log(`└───────────────────────────────────────────────────────────────────┘`);

  const { confirmDeletion } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDeletion",
      message: "⚠️  ¿Estás seguro de que deseas eliminar este proceso? Esta acción no se puede deshacer.",
      default: false
    }
  ]);

  if (confirmDeletion) {
    // Eliminar el proceso del array
    processes.splice(selectedProcessIndex, 1);
    
    // Guardar la lista actualizada
    saveSshProcesses(processes);
    
    // Mostrar confirmación de eliminación
    console.clear();
    console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║               ✅ PROCESO ELIMINADO EXITOSAMENTE             
    ║                                                    
    ╚═════════════════════════════════════════════════════════════╝
    `);
    
    console.log(`🗑️  Proceso eliminado: ${processToDelete.name || `Proceso ${selectedProcessIndex + 1}`}`);
    console.log(`🏠 Host: ${processToDelete.config.hostName || 'Sin nombre'}`);
    console.log(`📊 Procesos restantes: ${processes.length}`);
  } else {
    console.clear();
    console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║               ❌ ELIMINACIÓN CANCELADA                      
    ║                                                    
    ╚═════════════════════════════════════════════════════════════╝
    `);
    console.log("El proceso no fue eliminado.");
  }
}

// Función principal
async function main() {
  // Limpiar pantalla al inicio solo para el modo CLI
  if (process.argv.length > 2) {
    console.clear();
  }
  
  // Banner profesional del CLI
  console.log(`
    ╔═════════════════════════════════════════════════════════════╗
    ║                                                    
    ║              _____ _____ _   _     _____  _     _  
    ║             |   __|   __| |_| |   |  ___|| |   | | 
    ║             |___  |___  |  _  |   | |___ | |___| | 
    ║             |_____|_____|_| |_|   |_____||_____|_| 
    ║                                                    
    ║             🚀 SSH Remote Command Executor v1.1.1  
    ║                                                    
    ╠══════════════════════════════════════════════════════════════
    ║                                                        
    ║  📋 Gestiona conexiones SSH y ejecuta comandos remotos 
    ║  💾 Guarda procesos para reutilización futura          
    ║  🔐 Soporte automático para comandos sudo              
    ║  📊 Registro detallado de ejecuciones                  
    ║                                                        
    ║  💡 Ejecuta 'ssh-cli help' para ver comandos           
    ║                                                        
    ╚═════════════════════════════════════════════════════════════╝
  `);
  
  const args = process.argv.slice(2);
  const command = args[0];

  // Si no hay argumentos, mostrar menú interactivo
  if (args.length === 0) {
    await showInteractiveMenu();
    return;
  }

  // Procesamiento de comandos por argumentos (mantener compatibilidad)
  if (command === "help") {
    showHelp();
    return;
  }

  if (command === "list") {
    showSshProcessList();
    return;
  }

  if (command === "start") {
    const hostFlag = args.indexOf("-h");
    const processIdFlag = args.indexOf("-p");
    
    if (hostFlag !== -1 && processIdFlag !== -1 && args[hostFlag + 1] && args[processIdFlag + 1]) {
      // Ejecutar proceso específico por ID de host y posición
      const hostId = parseInt(args[hostFlag + 1]);
      const position = parseInt(args[processIdFlag + 1]) - 1;
      const processes = loadSshProcesses();
      
      if (isNaN(hostId) || hostId <= 0) {
        console.log("❌ ID de host inválido. Debe ser un número mayor a 0.");
        console.log("💡 Usa 'ssh-cli list' para ver los IDs de host disponibles.");
        return;
      }
      
      // Agrupar procesos por host
      const groupedByHost = {};
      processes.forEach((proc, originalIndex) => {
        const procHostName = proc.config.hostName || 'Sin nombre de host';
        if (!groupedByHost[procHostName]) {
          groupedByHost[procHostName] = [];
        }
        groupedByHost[procHostName].push({
          ...proc,
          originalIndex: originalIndex
        });
      });
      
      const hostEntries = Object.entries(groupedByHost);
      const hostIndex = hostId - 1;
      
      if (hostIndex < 0 || hostIndex >= hostEntries.length) {
        console.log(`❌ No se encontró el host con ID "${hostId}".`);
        console.log(`💡 Hay ${hostEntries.length} host(s) disponible(s).`);
        console.log("💡 Usa 'ssh-cli list' para ver los IDs de host disponibles.");
        return;
      }
      
      const [hostName, hostProcesses] = hostEntries[hostIndex];
      
      if (position < 0 || position >= hostProcesses.length) {
        console.log(`❌ Posición inválida para el host ID "${hostId}" (${hostName}).`);
        console.log(`💡 El host "${hostName}" tiene ${hostProcesses.length} proceso(s).`);
        console.log("💡 Usa 'ssh-cli list' para ver las posiciones disponibles.");
        return;
      }
      
      const selectedProcess = hostProcesses[position];
      console.log(`🎯 Ejecutando proceso en posición ${position + 1} del host ID ${hostId} (${hostName})`);
      await runSshProcess(selectedProcess);
      
    } else if (processIdFlag !== -1 && args[processIdFlag + 1]) {
      // Mantener compatibilidad con el método anterior (por ID global)
      const processIndex = parseInt(args[processIdFlag + 1]) - 1;
      const processes = loadSshProcesses();
      
      if (processIndex >= 0 && processIndex < processes.length) {
        const selectedProcess = processes[processIndex];
        console.log("⚠️  Usando método de selección por ID global (obsoleto).");
        console.log("💡 Considera usar: ssh-cli start -h <host_id> -p <posición>");
        await runSshProcess(selectedProcess);
      } else {
        console.log("❌ Número de proceso inválido. Usa 'list' para ver los procesos disponibles.");
      }
    } else {
      // Iniciar nuevo proceso
      await runSshProcess();
    }
    return;
  }

  if (command === "delete") {
    const processIdFlag = args.indexOf("-p");
    
    if (processIdFlag !== -1 && args[processIdFlag + 1]) {
      // Eliminar proceso específico
      const processId = parseInt(args[processIdFlag + 1]);
      
      if (isNaN(processId) || processId <= 0) {
        console.log("❌ ID de proceso inválido. Debe ser un número mayor a 0.");
        return;
      }
      
      deleteSshProcess(processId);
    } else {
      console.log("❌ Debes especificar el ID del proceso a eliminar.");
      console.log("💡 Uso: ssh-cli delete -p <ID>");
      console.log("   Ejemplo: ssh-cli delete -p 2");
      console.log("   Usa 'ssh-cli list' para ver los procesos disponibles.");
    }
    return;
  }

  // Si el comando no es reconocido, mostrar menú interactivo
  console.clear();
  console.log(`⚠️  Comando '${command}' no reconocido.`);
  console.log(`💡 Iniciando modo interactivo...\n`);
  await showInteractiveMenu();
}

main().catch((err) => {
  console.error("❌ Error:", err);
});
