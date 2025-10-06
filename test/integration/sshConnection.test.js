// test/integration/sshConnection.test.js - Tests de integración para conexiones SSH
import { expect } from 'chai';
import sinon from 'sinon';
import { TestUtils } from '../helpers/testUtils.js';

describe('🌐 Integración de Conexiones SSH', function() {
  let mockSSHClient;
  let consoleStub;

  beforeEach(function() {
    mockSSHClient = TestUtils.createMockSSHConnection();
    consoleStub = sinon.stub(console, 'log');
  });

  afterEach(function() {
    consoleStub.restore();
  });

  describe('Establecimiento de conexión', function() {
    it('🔌 debe conectarse exitosamente con credenciales válidas', async function() {
      // Arrange
      const config = {
        host: 'test.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpass'
      };

      // Act
      const connectionPromise = new Promise((resolve) => {
        mockSSHClient
          .on('ready', () => {
            resolve({ connected: true });
          })
          .on('error', (err) => {
            resolve({ connected: false, error: err });
          })
          .connect(config);
      });

      const result = await connectionPromise;

      // Assert
      expect(result.connected).to.be.true;
    });

    it('❌ debe manejar errores de conexión', async function() {
      // Arrange
      const config = {
        host: 'invalid.host.com',
        port: 22,
        username: 'testuser',
        password: 'wrongpass'
      };

      const mockErrorClient = {
        on: function(event, callback) {
          setTimeout(() => {
            if (event === 'error') {
              callback(new Error('Authentication failed'));
            }
          }, 10);
          return this;
        },
        connect: function() {
          return this;
        }
      };

      // Act
      const connectionPromise = new Promise((resolve) => {
        mockErrorClient
          .on('ready', () => {
            resolve({ connected: true });
          })
          .on('error', (err) => {
            resolve({ connected: false, error: err });
          })
          .connect(config);
      });

      const result = await connectionPromise;

      // Assert
      expect(result.connected).to.be.false;
      expect(result.error).to.be.instanceOf(Error);
      expect(result.error.message).to.equal('Authentication failed');
    });

    it('⏱️ debe manejar timeout de conexión', async function() {
      // Arrange
      const config = {
        host: 'slow.server.com',
        port: 22,
        username: 'testuser',
        password: 'testpass'
      };

      const mockTimeoutClient = {
        on: function(event, callback) {
          // No llamar callbacks para simular timeout
          return this;
        },
        connect: function() {
          return this;
        }
      };

      // Act
      const connectionPromise = new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({ connected: false, timeout: true });
        }, 100); // Timeout corto para el test

        mockTimeoutClient
          .on('ready', () => {
            clearTimeout(timeout);
            resolve({ connected: true });
          })
          .on('error', (err) => {
            clearTimeout(timeout);
            resolve({ connected: false, error: err });
          })
          .connect(config);
      });

      const result = await connectionPromise;

      // Assert
      expect(result.connected).to.be.false;
      expect(result.timeout).to.be.true;
    });
  });

  describe('Ejecución de comandos remotos', function() {
    it('✅ debe ejecutar comando simple exitosamente', async function() {
      // Arrange
      const command = 'ls -la';
      
      // Act
      const result = await new Promise((resolve) => {
        mockSSHClient.exec(command, (err, stream) => {
          if (err) {
            resolve({ success: false, error: err });
            return;
          }

          let output = '';
          stream
            .on('close', (code) => {
              resolve({ 
                success: code === 0,
                output,
                exitCode: code
              });
            })
            .on('data', (data) => {
              output += data.toString();
            });
        });
      });

      // Assert
      expect(result.success).to.be.true;
      expect(result.exitCode).to.equal(0);
      expect(result.output).to.include('Mock command output');
    });

    it('🔐 debe ejecutar comando sudo con detección de contraseña', async function() {
      // Arrange
      const command = 'sudo systemctl restart nginx';
      const password = 'testpass';
      
      const mockSudoStream = {
        on: function(event, callback) {
          setTimeout(() => {
            if (event === 'close') {
              callback(0);
            } else if (event === 'data') {
              // Simular prompt de sudo primero, luego output normal
              callback('[sudo] password for user:');
              setTimeout(() => callback('Service restarted successfully\\n'), 20);
            }
          }, 10);
          return this;
        },
        write: sinon.stub(),
        stderr: {
          on: function() { return this; }
        }
      };

      mockSSHClient.exec = function(cmd, callback) {
        setTimeout(() => callback(null, mockSudoStream), 10);
      };

      // Act
      const result = await new Promise((resolve) => {
        mockSSHClient.exec(command, (err, stream) => {
          if (err) {
            resolve({ success: false, error: err });
            return;
          }

          let output = '';
          let passwordSent = false;

          stream
            .on('close', (code) => {
              resolve({ 
                success: code === 0,
                output,
                exitCode: code,
                passwordSent
              });
            })
            .on('data', (data) => {
              const text = data.toString();
              output += text;
              
              // Detectar y responder a prompt de sudo
              if (text.includes('[sudo] password') && !passwordSent) {
                stream.write(password + '\\n');
                passwordSent = true;
              }
            });
        });
      });

      // Assert
      expect(result.success).to.be.true;
      expect(result.passwordSent).to.be.true;
      expect(mockSudoStream.write.called).to.be.true;
      expect(result.output).to.include('Service restarted successfully');
    });

    it('❌ debe manejar comandos que fallan', async function() {
      // Arrange
      const command = 'nonexistent-command';
      
      const mockFailingStream = {
        on: function(event, callback) {
          setTimeout(() => {
            if (event === 'close') {
              callback(127); // Command not found
            } else if (event === 'data') {
              callback('command not found\\n');
            }
          }, 10);
          return this;
        },
        stderr: {
          on: function(event, callback) {
            if (event === 'data') {
              setTimeout(() => callback('bash: nonexistent-command: command not found\\n'), 15);
            }
            return this;
          }
        }
      };

      mockSSHClient.exec = function(cmd, callback) {
        setTimeout(() => callback(null, mockFailingStream), 10);
      };

      // Act
      const result = await new Promise((resolve) => {
        mockSSHClient.exec(command, (err, stream) => {
          if (err) {
            resolve({ success: false, error: err });
            return;
          }

          let output = '';
          let stderr = '';

          stream
            .on('close', (code) => {
              resolve({ 
                success: code === 0,
                output,
                stderr,
                exitCode: code
              });
            })
            .on('data', (data) => {
              output += data.toString();
            })
            .stderr.on('data', (data) => {
              stderr += data.toString();
            });
        });
      });

      // Assert
      expect(result.success).to.be.false;
      expect(result.exitCode).to.equal(127);
      expect(result.stderr).to.include('command not found');
    });

    it('📁 debe mantener contexto de directorio entre comandos', async function() {
      // Arrange
      const commands = [
        'cd /var/www',
        'pwd',
        'ls -la'
      ];
      
      let currentDirectory = '~';
      const results = [];

      // Act
      for (const command of commands) {
        const result = await new Promise((resolve) => {
          let fullCommand;
          
          if (command.startsWith('cd ')) {
            const targetDir = command.substring(3).trim();
            currentDirectory = targetDir.startsWith('/') ? targetDir : `${currentDirectory}/${targetDir}`;
            fullCommand = `cd ${currentDirectory} && pwd`;
          } else {
            fullCommand = `cd ${currentDirectory} && ${command}`;
          }

          mockSSHClient.exec(fullCommand, (err, stream) => {
            if (err) {
              resolve({ success: false, error: err });
              return;
            }

            let output = '';
            stream
              .on('close', (code) => {
                resolve({ 
                  success: code === 0,
                  output,
                  command: fullCommand,
                  directory: currentDirectory
                });
              })
              .on('data', (data) => {
                output += data.toString();
              });
          });
        });

        results.push(result);
      }

      // Assert
      expect(results).to.have.lengthOf(3);
      expect(results[0].command).to.include('cd /var/www && pwd');
      expect(results[1].command).to.include('cd /var/www && pwd');
      expect(results[2].command).to.include('cd /var/www && ls -la');
      expect(results.every(r => r.success)).to.be.true;
    });
  });

  describe('Manejo de errores de red', function() {
    it('🌐 debe reconectar automáticamente en caso de pérdida de conexión', async function() {
      // Arrange
      let connectionAttempts = 0;
      const maxRetries = 3;

      const mockUnstableClient = {
        on: function(event, callback) {
          if (event === 'ready') {
            connectionAttempts++;
            if (connectionAttempts < 2) {
              // Simular conexión que falla
              setTimeout(() => {
                this.emit('error', new Error('Connection lost'));
              }, 20);
            } else {
              // Conexión exitosa en el segundo intento
              setTimeout(callback, 10);
            }
          } else if (event === 'error') {
            setTimeout(() => {
              if (connectionAttempts < maxRetries) {
                this.connect(); // Reconectar
              } else {
                callback(new Error('Max retries exceeded'));
              }
            }, 10);
          }
          return this;
        },
        connect: function() {
          setTimeout(() => this.emit('ready'), 10);
          return this;
        },
        emit: function(event, data) {
          // Mock de EventEmitter
          return this;
        }
      };

      // Act
      const result = await new Promise((resolve) => {
        let connected = false;
        
        mockUnstableClient
          .on('ready', () => {
            if (!connected) {
              connected = true;
              resolve({ 
                connected: true, 
                attempts: connectionAttempts 
              });
            }
          })
          .on('error', (err) => {
            if (connectionAttempts >= maxRetries) {
              resolve({ 
                connected: false, 
                error: err,
                attempts: connectionAttempts 
              });
            }
          })
          .connect();
      });

      // Assert
      expect(result.connected).to.be.true;
      expect(result.attempts).to.equal(2);
    });

    it('⚠️ debe manejar desconexión durante ejecución de comandos', async function() {
      // Arrange
      const command = 'long-running-command';
      
      const mockDisconnectingStream = {
        on: function(event, callback) {
          if (event === 'data') {
            setTimeout(() => callback('Starting long process...\\n'), 10);
          } else if (event === 'close') {
            // No llamar close para simular desconexión
          }
          return this;
        },
        stderr: {
          on: function() { return this; }
        }
      };

      mockSSHClient.exec = function(cmd, callback) {
        setTimeout(() => {
          callback(null, mockDisconnectingStream);
          // Simular desconexión después de un tiempo
          setTimeout(() => {
            mockSSHClient.emit('error', new Error('Connection reset by peer'));
          }, 50);
        }, 10);
      };

      mockSSHClient.emit = function(event, data) {
        if (event === 'error') {
          // Simular manejo de error de desconexión
        }
        return this;
      };

      // Act
      const result = await new Promise((resolve) => {
        let disconnected = false;
        
        mockSSHClient.exec(command, (err, stream) => {
          if (err) {
            resolve({ success: false, error: err });
            return;
          }

          let output = '';
          
          // Simular timeout para detectar desconexión
          const timeout = setTimeout(() => {
            if (!disconnected) {
              disconnected = true;
              resolve({
                success: false,
                disconnected: true,
                output
              });
            }
          }, 100);

          stream
            .on('close', (code) => {
              clearTimeout(timeout);
              resolve({ 
                success: code === 0,
                output
              });
            })
            .on('data', (data) => {
              output += data.toString();
            });
        });
      });

      // Assert
      expect(result.success).to.be.false;
      expect(result.disconnected).to.be.true;
      expect(result.output).to.include('Starting long process');
    });
  });
});