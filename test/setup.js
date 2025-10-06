// test/setup.js - Configuración global de tests
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock de console para tests
global.originalConsole = { ...console };
global.mockConsole = () => {
  console.log = () => {};
  console.clear = () => {};
  console.error = () => {};
};

global.restoreConsole = () => {
  Object.assign(console, global.originalConsole);
};

// Helper para limpiar directorios de test
global.cleanTestDirs = () => {
  const testDirs = [
    join(__dirname, '..', 'test-process'),
    join(__dirname, '..', 'test-logs')
  ];
  
  testDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
};

// Mock de paths para tests
global.TEST_PROCESS_DIR = join(__dirname, '..', 'test-process');
global.TEST_LOGS_DIR = join(__dirname, '..', 'test-logs');
global.TEST_SSH_DATA_FILE = join(global.TEST_PROCESS_DIR, 'ssh-processes.json');

// Setup inicial
beforeEach(function() {
  global.mockConsole();
});

afterEach(function() {
  global.restoreConsole();
  global.cleanTestDirs();
});