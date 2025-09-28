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

// Mostrar lista de procesos SSH
function showSshProcessList() {
  const processes = loadSshProcesses();
  
  if (processes.length === 0) {
    console.log("\n📭 No hay procesos SSH guardados.");
    return processes;
  }

  console.log("\n📋 Procesos SSH Guardados");
  console.log("═".repeat(80));
  
  // Usar formato simple y limpio
  processes.forEach((proc, index) => {
    console.log(`\n┌─ ID: ${index + 1} ──────────────────────────────────────────────────────────┐`);
    console.log(`│ 📝 Nombre: ${proc.name || `Proceso ${index + 1}`}`);
    console.log(`│ 🌐 Host: ${proc.config.host}:${proc.config.port}`);
    console.log(`│ 👤 Usuario: ${proc.config.username}`);
    
    const dateStr = new Date(proc.createdAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }) + ' ' + new Date(proc.createdAt).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    console.log(`│ 📅 Creado: ${dateStr}`);
    console.log(`│ ⚙️  Comandos: ${proc.commands.length} comando(s)`);
    
    console.log(`│`);
    console.log(`│ 📋 Lista de comandos:`);
    proc.commands.forEach((cmd, i) => {
      console.log(`│   ${(i + 1).toString().padStart(2)}. ${cmd}`);
    });
    console.log(`└──────────────────────────────────────────────────────────────────┘`);
  });
  
  console.log(`\n💡 Uso: ssh-cli start -p <ID> para ejecutar un proceso`);
  console.log(`📁 Procesos guardados en: ./process/`);
  console.log(`📁 Logs guardados en: ./logs/`);
  
  return processes;
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
    // Solicitar nueva configuración
    connectionConfig = await inquirer.prompt([
      { type: "input", name: "host", message: "Host remoto:" },
      { type: "input", name: "port", message: "Puerto SSH:", default: "22" },
      { type: "input", name: "username", message: "Usuario SSH:" },
      {
        type: "password",
        name: "password",
        message: "Contraseña:",
        mask: "*",
      },
    ]);

    commandList = [];
    let addMore = true;

    while (addMore) {
      const { cmd } = await inquirer.prompt([
        { type: "input", name: "cmd", message: "Comando a ejecutar:" },
      ]);

      commandList.push(cmd);

      const { again } = await inquirer.prompt([
        {
          type: "confirm",
          name: "again",
          message: "¿Quieres agregar otro comando?",
          default: false,
        },
      ]);

      addMore = again;
    }

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
        config: { ...connectionConfig, password: "***" }, // No guardar la contraseña real
        commands: [...commandList],
        createdAt: new Date().toISOString(),
      };
      
      processes.push(newProcess);
      saveSshProcesses(processes);
      console.log(`✅ Proceso "${processName}" guardado exitosamente.`);
    }
  }

  console.log("\n📋 Tareas a ejecutar:");
  commandList.forEach((c, i) => {
    console.log(`  ⏳ ${i + 1}. ${c}`); // Mostrar comando completo
  });

  const { executeNow } = await inquirer.prompt([
    { type: "confirm", name: "executeNow", message: "¿Ejecutar ahora?", default: true },
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
    ╔══════════════════════════════════════════════════════════════╗
    ║                       📚 SSH CLI - AYUDA                     ║
    ╠══════════════════════════════════════════════════════════════╣
    ║                                                              ║
    ║  📋 COMANDOS DISPONIBLES:                                    ║
    ║                                                              ║
    ║  🆘 help                      Mostrar esta ayuda             ║
    ║  📋 list                      Listar procesos guardados      ║
    ║  🚀 start                     Crear nuevo proceso SSH        ║
    ║  ▶️  start -p <id>             Ejecutar proceso guardado     ║
    ║  🗑️  delete -p <id>            Eliminar proceso guardado     ║
    ║                                                              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  💡 EJEMPLOS DE USO:                                         ║
    ║                                                              ║
    ║  ssh-cli start                                               ║
    ║  ssh-cli list                                                ║
    ║  ssh-cli start -p 1                                          ║
    ║  ssh-cli delete -p 2                                         ║
    ║                                                              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║  🔧 CARACTERÍSTICAS:                                         ║
    ║                                                              ║
    ║  • Gestión completa de conexiones SSH                       ║
    ║  • Guardado de procesos para reutilización                  ║
    ║  • Detección automática de prompts sudo                     ║
    ║  • Registro detallado de todas las ejecuciones              ║
    ║  • Persistencia del contexto de directorio                  ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
  `);
}

// Función principal
async function main() {
  // Banner profesional del CLI
  console.log(`
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║              _____ _____ _   _     _____  _     _            ║
    ║             |   __|   __| |_| |   |  ___|| |   | |           ║
    ║             |___  |___  |  _  |   | |___ | |___| |           ║
    ║             |_____|_____|_| |_|   |_____||_____|_|           ║
    ║                                                              ║
    ║             🚀 SSH Remote Command Executor v1.0.0            ║
    ║                                                              ║
    ╠══════════════════════════════════════════════════════════════╣
    ║                                                              ║
    ║  📋 Gestiona conexiones SSH y ejecuta comandos remotos       ║
    ║  💾 Guarda procesos para reutilización futura                ║
    ║  🔐 Soporte automático para comandos sudo                    ║
    ║  📊 Registro detallado de ejecuciones                        ║
    ║                                                              ║
    ║  💡 Ejecuta 'ssh-cli help' para ver comandos                 ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
  `);
  
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === "help") {
    showHelp();
    return;
  }

  if (command === "list") {
    showSshProcessList();
    return;
  }

  if (command === "start") {
    const processIdFlag = args.indexOf("-p");
    
    if (processIdFlag !== -1 && args[processIdFlag + 1]) {
      // Ejecutar proceso específico
      const processIndex = parseInt(args[processIdFlag + 1]) - 1;
      const processes = loadSshProcesses();
      
      if (processIndex >= 0 && processIndex < processes.length) {
        const selectedProcess = processes[processIndex];
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

  // Si no hay comando específico, mostrar ayuda
  showHelp();
}

main().catch((err) => {
  console.error("❌ Error:", err);
});
