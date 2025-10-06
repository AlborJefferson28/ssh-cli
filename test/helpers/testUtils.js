// test/helpers/testUtils.js - Utilidades para tests
import fs from 'fs';
import path from 'path';

export class TestUtils {
  static createMockProcess(overrides = {}) {
    const defaultProcess = {
      id: Date.now(),
      name: 'Test Process',
      config: {
        host: 'test.example.com',
        port: '22',
        username: 'testuser',
        password: '***',
        hostName: 'Test Server'
      },
      commands: ['ls -la', 'pwd', 'whoami'],
      createdAt: new Date().toISOString()
    };
    
    return { ...defaultProcess, ...overrides };
  }

  static createMockProcessList(count = 3) {
    const processes = [];
    const hosts = ['Servidor Web', 'Base de Datos', 'API Server'];
    
    for (let i = 0; i < count; i++) {
      processes.push(this.createMockProcess({
        id: Date.now() + i,
        name: `Proceso ${i + 1}`,
        config: {
          host: `server${i + 1}.example.com`,
          port: '22',
          username: 'deploy',
          password: '***',
          hostName: hosts[i] || `Host ${i + 1}`
        },
        commands: [`command${i + 1}`, `test${i + 1}`]
      }));
    }
    
    return processes;
  }

  static setupMockFileSystem(processes = []) {
    if (!fs.existsSync(global.TEST_PROCESS_DIR)) {
      fs.mkdirSync(global.TEST_PROCESS_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(global.TEST_LOGS_DIR)) {
      fs.mkdirSync(global.TEST_LOGS_DIR, { recursive: true });
    }
    
    if (processes.length > 0) {
      fs.writeFileSync(
        global.TEST_SSH_DATA_FILE,
        JSON.stringify(processes, null, 2)
      );
    }
  }

  static async simulateInquirerPrompts(answers) {
    const inquirer = await import('inquirer');
    const originalPrompt = inquirer.default?.prompt || inquirer.prompt;
    
    const mockPrompt = async (questions) => {
      return results;
    };
    
    // Mock both possible locations
    if (inquirer.default) {
      inquirer.default.prompt = mockPrompt;
    } else {
      inquirer.prompt = mockPrompt;
    }
    
    return {
      restore: () => {
        if (inquirer.default) {
          inquirer.default.prompt = originalPrompt;
        } else {
          inquirer.prompt = originalPrompt;
        }
      }
    };
  }

  static createMockSSHStream() {
    return {
      on: function(event, callback) {
        setTimeout(() => {
          if (event === 'close') {
            callback(0); // Exit code 0
          } else if (event === 'data') {
            callback(Buffer.from('Mock command output\n'));
          }
        }, 10);
        return this;
      },
      write: function(data) {
        // Mock de write - simulate successful write
        return true;
      },
      stderr: {
        on: function(event, callback) {
          return this;
        }
      },
      end: function() {
        // Mock de end
        return this;
      }
    };
  }

  static createMockSSHConnection() {
    return {
      on: function(event, callback) {
        setTimeout(() => {
          if (event === 'ready') {
            callback();
          } else if (event === 'error') {
            // No llamar error callback por defecto
          }
        }, 10);
        return this;
      },
      connect: function(config) {
        return this;
      },
      exec: function(command, options, callback) {
        if (typeof options === 'function') {
          callback = options;
          options = {};
        }
        
        setTimeout(() => {
          // Simular diferentes tipos de comandos
          let stream;
          if (command.includes('sudo')) {
            // Mock stream que simula prompt de contraseña
            stream = {
              ...TestUtils.createMockSSHStream(),
              on: function(event, callback) {
                setTimeout(() => {
                  if (event === 'data') {
                    callback(Buffer.from('[sudo] password for user:'));
                  } else if (event === 'close') {
                    callback(0);
                  }
                }, 10);
                return this;
              }
            };
          } else if (command.includes('nonexistentcommand')) {
            // Mock command not found
            stream = {
              ...TestUtils.createMockSSHStream(),
              on: function(event, callback) {
                setTimeout(() => {
                  if (event === 'data') {
                    callback(Buffer.from(''));
                  } else if (event === 'close') {
                    callback(127); // Command not found exit code
                  }
                }, 10);
                return this;
              },
              stderr: {
                on: function(event, callback) {
                  if (event === 'data') {
                    setTimeout(() => {
                      callback(Buffer.from('command not found'));
                    }, 10);
                  }
                  return this;
                }
              }
            };
          } else {
            stream = TestUtils.createMockSSHStream();
          }
          
          callback(null, stream);
        }, 10);
        
        return this;
      },
      end: function() {
        return this;
      }
    };
  }

  static validateProcessStructure(process) {
    const requiredFields = ['id', 'name', 'config', 'commands', 'createdAt'];
    const configFields = ['host', 'port', 'username', 'password', 'hostName'];
    
    for (const field of requiredFields) {
      if (!(field in process)) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    
    for (const field of configFields) {
      if (!(field in process.config)) {
        throw new Error(`Missing required config field: ${field}`);
      }
    }
    
    if (!Array.isArray(process.commands)) {
      throw new Error('Commands must be an array');
    }
    
    return true;
  }

  static async waitFor(condition, timeout = 1000) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 10);
        }
      };
      
      check();
    });
  }
}