#!/usr/bin/env node

import { Client } from "ssh2";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

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

// Función para crear un manejador de timeout para contraseñas
function createPasswordTimeoutHandler(stream, password, commandName, logStream) {
  let timeoutId;
  let responded = false;
  
  const sendPassword = (reason = "") => {
    if (!responded) {
      console.log(`🔐 ${reason}Enviando contraseña automáticamente para: ${commandName}`);
      stream.write(password + "\n");
      logStream.write(`[AUTO-RESPONSE] Contraseña enviada automáticamente${reason ? ` (${reason})` : ""}\n`);
      responded = true;
    }
  };
  
  // Si después de 3 segundos no hay respuesta y detectamos un posible prompt
  timeoutId = setTimeout(() => {
    if (!responded) {
      sendPassword("Timeout - ");
    }
  }, 3000);
  
  return {
    triggerPasswordSend: (reason = "") => {
      clearTimeout(timeoutId);
      sendPassword(reason);
    },
    cancel: () => {
      clearTimeout(timeoutId);
      responded = true;
    },
    isResponded: () => responded
  };
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
    console.log("💡 Sugerencias comunes: ls, cd, pwd, ps aux, df -h, free -h, systemctl status");
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
          },
          transformer: (input) => {
            // Mostrar sugerencias mientras escribe
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
        console.log("\n💡 Sugerencias comunes: ls, cd, pwd, ps aux, df -h, free -h, systemctl status");
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

  return new Promise((resolve) => {
    conn
      .on("ready", async () => {
        console.log(`\n✅ Conectado a ${connectionConfig.host}`);
        console.log(`📝 Ejecutando ${commandList.length} tarea(s)...\n`);
        
        // Agregar comando cd al inicio para ir a la raíz
        const allCommands = ["cd ~", ...commandList];
        
        try {
          // Ejecutar comandos uno por uno manteniendo el contexto del directorio
          let currentDirectory = "~"; // Directorio inicial
          
          for (let i = 0; i < commandList.length; i++) {
            const cmd = commandList[i];
            const commandName = cmd; // Usar comando completo
            
            // Mostrar estado actual
            console.clear();
            console.log(`✅ Conectado a ${connectionConfig.host}`);
            console.log(`📝 Ejecutando ${commandList.length} tarea(s)...\n`);
            
            // Mostrar progreso de todas las tareas
            commandList.forEach((c, idx) => {
              const status = idx < i ? '✅' : idx === i ? '⏳' : '⏳';
              console.log(`  ${status} ${idx + 1}. ${c}`); // Mostrar comando completo
            });
            
            console.log(`\n🔄 Ejecutando: ${commandName}...`); // Comando completo
            
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
            
            await new Promise((cmdResolve) => {
              conn.exec(fullCommand, { pty: true }, (err, stream) => {
                if (err) {
                  console.error(`❌ Error ejecutando ${commandName}:`, err);
                  logStream.write(`ERROR en ${cmd}: ${err}\n`);
                  taskStatuses[i] = '❌';
                  cmdResolve();
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
                    passwordHandler.cancel(); // Cancelar timeout
                    
                    logStream.write(`\n=== COMANDO: ${cmd} ===\n`);
                    logStream.write(`DIRECTORIO ACTUAL: ${currentDirectory}\n`);
                    logStream.write(`COMANDO EJECUTADO: ${fullCommand}\n`);
                    logStream.write(output);
                    logStream.write(`\n=== FIN COMANDO (código: ${code}) ===\n\n`);
                    
                    if (code === 0) {
                      taskStatuses[i] = '✅';
                      completedTasks++;
                    } else {
                      taskStatuses[i] = '❌';
                    }
                    
                    cmdResolve();
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
          }
          
          // Mostrar resultado final
          console.clear();
          const endTime = Date.now();
          const totalTime = Math.round((endTime - startTime) / 1000);
          
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
            console.log(`  ${taskStatuses[i]} ${i + 1}. ${c}`); // Mostrar comando completo
          });
          
          conn.end();
          logStream.end();
          resolve();
          
        } catch (error) {
          console.error("❌ Error durante la ejecución:", error);
          logStream.write(`ERROR GENERAL: ${error}\n`);
          conn.end();
          logStream.end();
          resolve();
        }
      })
      .on("error", (err) => {
        console.error("❌ Error de conexión:", err);
        logStream.write(`ERROR DE CONEXIÓN: ${err}\n`);
        logStream.end();
        resolve();
      })
      .connect({
        host: connectionConfig.host,
        port: parseInt(connectionConfig.port, 10) || 22,
        username: connectionConfig.username,
        password: connectionConfig.password,
      });
  });
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
    ║  • 💡 Sugerencias de comandos comunes                    
    ║  • 📊 Estadísticas detalladas de procesos                
    ║  • 🎨 Interfaz mejorada con emojis                       
    ║  • 🔍 Selección visual de hosts y procesos               
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
    ║             🚀 SSH Remote Command Executor v1.0.0  
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
    ║             🚀 SSH Remote Command Executor v1.0.0  
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
