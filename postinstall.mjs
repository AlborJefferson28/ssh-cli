#!/usr/bin/env node

/**
 * Post-install script para SSH Remote Command Executor
 * Se ejecuta automáticamente después de la instalación via npm
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log(`
🎉 ¡SSH Remote Command Executor instalado exitosamente!

📋 El comando 'ssh-cli' ya está disponible globalmente.

💡 Comandos básicos:
   ssh-cli help     - Mostrar ayuda
   ssh-cli list     - Listar procesos guardados
   ssh-cli start    - Crear nuevo proceso SSH

🚀 ¡Tu CLI está listo para usar!

📚 Documentación completa: https://github.com/AlborJefferson28/ssh-cli/tree/master/docs
🐛 Reportar problemas: https://github.com/AlborJefferson28/ssh-cli/issues
`);

// Crear directorios necesarios en el directorio del usuario
const homeDir = process.env.HOME || process.env.USERPROFILE;
if (homeDir) {
  const sshCliDir = join(homeDir, '.ssh-cli');
  const processDir = join(sshCliDir, 'process');
  const logsDir = join(sshCliDir, 'logs');
  
  try {
    if (!fs.existsSync(sshCliDir)) {
      fs.mkdirSync(sshCliDir, { recursive: true });
    }
    if (!fs.existsSync(processDir)) {
      fs.mkdirSync(processDir, { recursive: true });
    }
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    console.log(`📁 Directorios de configuración creados en: ${sshCliDir}`);
  } catch (error) {
    // Silenciar errores de permisos, no es crítico
  }
}