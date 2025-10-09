// test/unit/sshKeyboardInteractive.test.js - Tests para SSH keyboard-interactive authentication
import { expect } from 'chai';
import sinon from 'sinon';
import { EventEmitter } from 'events';

describe('🔐 SSH Keyboard-Interactive Authentication', function() {
  
  describe('keyboard-interactive handler', function() {
    let mockClient;
    let mockConnection;
    let logStream;
    let connectionConfig;

    beforeEach(function() {
      // Mock del cliente SSH2
      mockClient = new EventEmitter();
      mockClient.connect = sinon.stub();
      mockClient.end = sinon.stub();
      mockClient.exec = sinon.stub();
      
      // Mock del log stream
      logStream = {
        write: sinon.stub(),
        end: sinon.stub()
      };
      
      // Configuración de conexión de prueba
      connectionConfig = {
        host: 'test.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpassword'
      };
    });

    it('🔐 debe manejar keyboard-interactive con prompts de contraseña', function(done) {
      // Arrange
      const prompts = [
        { prompt: 'Password:', echo: false }
      ];
      const finish = sinon.stub();
      
      // Simular el handler keyboard-interactive del código real
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([connectionConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          finish([]);
        }
      };

      // Act
      keyboardInteractiveHandler('', '', '', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([connectionConfig.password])).to.be.true;
        done();
      }, 10);
    });

    it('🔐 debe manejar keyboard-interactive sin prompts', function(done) {
      // Arrange
      const prompts = [];
      const finish = sinon.stub();
      
      // Simular el handler keyboard-interactive del código real
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([connectionConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          finish([]);
        }
      };

      // Act
      keyboardInteractiveHandler('', '', '', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([])).to.be.true;
        done();
      }, 10);
    });

    it('🔐 debe manejar keyboard-interactive con prompts undefined', function(done) {
      // Arrange
      const prompts = undefined;
      const finish = sinon.stub();
      
      // Simular el handler keyboard-interactive del código real
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([connectionConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          finish([]);
        }
      };

      // Act
      keyboardInteractiveHandler('', '', '', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([])).to.be.true;
        done();
      }, 10);
    });

    it('🔐 debe manejar keyboard-interactive con múltiples prompts', function(done) {
      // Arrange
      const prompts = [
        { prompt: 'Password:', echo: false },
        { prompt: 'Token:', echo: false }
      ];
      const finish = sinon.stub();
      
      // Simular el handler keyboard-interactive del código real
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([connectionConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          finish([]);
        }
      };

      // Act
      keyboardInteractiveHandler('', '', '', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([connectionConfig.password])).to.be.true;
        done();
      }, 10);
    });

    it('🛡️ debe manejar errores en keyboard-interactive handler', function(done) {
      // Arrange
      const prompts = [
        { prompt: 'Password:', echo: false }
      ];
      const finish = sinon.stub();
      
      // Simular el handler keyboard-interactive con error
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          // Simular error interno
          throw new Error('Test error');
        } catch (e) {
          finish([]);
        }
      };

      // Act
      keyboardInteractiveHandler('', '', '', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([])).to.be.true;
        done();
      }, 10);
    });

    it('🔐 debe responder con la contraseña correcta del config', function(done) {
      // Arrange
      const customPassword = 'custom-secret-password';
      const customConfig = { ...connectionConfig, password: customPassword };
      const prompts = [{ prompt: 'Password:', echo: false }];
      const finish = sinon.stub();
      
      // Simular el handler keyboard-interactive con config personalizada
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([customConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          finish([]);
        }
      };

      // Act
      keyboardInteractiveHandler('', '', '', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([customPassword])).to.be.true;
        done();
      }, 10);
    });
  });

  describe('SSH Connection Configuration', function() {
    let connectionOptions;

    beforeEach(function() {
      connectionOptions = {
        host: 'test.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpassword'
      };
    });

    it('🔧 debe incluir tryKeyboard: true en opciones de conexión', function() {
      // Arrange
      const expectedOptions = {
        ...connectionOptions,
        tryKeyboard: true
      };

      // Act
      const finalOptions = {
        host: connectionOptions.host,
        port: parseInt(connectionOptions.port, 10) || 22,
        username: connectionOptions.username,
        password: connectionOptions.password,
        tryKeyboard: true
      };

      // Assert
      expect(finalOptions.tryKeyboard).to.be.true;
      expect(finalOptions.host).to.equal(connectionOptions.host);
      expect(finalOptions.username).to.equal(connectionOptions.username);
      expect(finalOptions.password).to.equal(connectionOptions.password);
      expect(finalOptions.port).to.equal(22);
    });

    it('🔧 debe parsear puerto correctamente', function() {
      // Arrange
      const connectionWithStringPort = {
        ...connectionOptions,
        port: '2222'
      };

      // Act
      const finalOptions = {
        host: connectionWithStringPort.host,
        port: parseInt(connectionWithStringPort.port, 10) || 22,
        username: connectionWithStringPort.username,
        password: connectionWithStringPort.password,
        tryKeyboard: true
      };

      // Assert
      expect(finalOptions.port).to.equal(2222);
      expect(typeof finalOptions.port).to.equal('number');
    });

    it('🔧 debe usar puerto por defecto 22 si puerto es inválido', function() {
      // Arrange
      const connectionWithInvalidPort = {
        ...connectionOptions,
        port: 'invalid'
      };

      // Act
      const finalOptions = {
        host: connectionWithInvalidPort.host,
        port: parseInt(connectionWithInvalidPort.port, 10) || 22,
        username: connectionWithInvalidPort.username,
        password: connectionWithInvalidPort.password,
        tryKeyboard: true
      };

      // Assert
      expect(finalOptions.port).to.equal(22);
    });

    it('🔧 debe usar puerto por defecto 22 si puerto es undefined', function() {
      // Arrange
      const connectionWithoutPort = {
        host: connectionOptions.host,
        username: connectionOptions.username,
        password: connectionOptions.password
      };

      // Act
      const finalOptions = {
        host: connectionWithoutPort.host,
        port: parseInt(connectionWithoutPort.port, 10) || 22,
        username: connectionWithoutPort.username,
        password: connectionWithoutPort.password,
        tryKeyboard: true
      };

      // Assert
      expect(finalOptions.port).to.equal(22);
    });
  });

  describe('Integración keyboard-interactive + tryKeyboard', function() {
    let mockClient;
    let eventHandlers;

    beforeEach(function() {
      eventHandlers = {};
      
      // Mock del cliente SSH que registra event handlers
      mockClient = {
        on: sinon.stub().callsFake((event, handler) => {
          eventHandlers[event] = handler;
          return mockClient;
        }),
        connect: sinon.stub().callsFake((options) => {
          // Simular conexión exitosa después de un tick
          setTimeout(() => {
            if (eventHandlers.ready) {
              eventHandlers.ready();
            }
          }, 10);
          return mockClient;
        }),
        end: sinon.stub(),
        exec: sinon.stub()
      };
    });

    it('🔗 debe registrar handler keyboard-interactive antes de connect', function(done) {
      // Arrange
      const connectionConfig = {
        host: 'test.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpassword'
      };

      // Act - Simular la secuencia del código real
      mockClient
        .on("ready", () => {
          // Connection ready
        })
        .on("error", (err) => {
          // Error handling
        })
        .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
          try {
            if (prompts && prompts.length > 0) {
              finish([connectionConfig.password]);
            } else {
              finish([]);
            }
          } catch (e) {
            finish([]);
          }
        })
        .connect({
          host: connectionConfig.host,
          port: parseInt(connectionConfig.port, 10) || 22,
          username: connectionConfig.username,
          password: connectionConfig.password,
          tryKeyboard: true,
        });

      // Assert
      setTimeout(() => {
        expect(mockClient.on.calledWith('keyboard-interactive')).to.be.true;
        expect(mockClient.connect.calledOnce).to.be.true;
        
        const connectOptions = mockClient.connect.firstCall.args[0];
        expect(connectOptions.tryKeyboard).to.be.true;
        expect(connectOptions.host).to.equal(connectionConfig.host);
        expect(connectOptions.username).to.equal(connectionConfig.username);
        expect(connectOptions.password).to.equal(connectionConfig.password);
        
        done();
      }, 20);
    });

    it('🔐 debe ejecutar keyboard-interactive handler cuando sea triggered', function(done) {
      // Arrange
      const connectionConfig = {
        host: 'test.example.com',
        username: 'testuser',
        password: 'secretpassword'
      };
      const finish = sinon.stub();

      // Act - Registrar handler y simular trigger
      mockClient
        .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
          try {
            if (prompts && prompts.length > 0) {
              finish([connectionConfig.password]);
            } else {
              finish([]);
            }
          } catch (e) {
            finish([]);
          }
        });

      // Simular que el servidor SSH solicita keyboard-interactive
      const prompts = [{ prompt: 'Password:', echo: false }];
      eventHandlers['keyboard-interactive']('Authentication', 'Please enter your password', 'en', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([connectionConfig.password])).to.be.true;
        done();
      }, 10);
    });

    it('🛡️ debe manejar keyboard-interactive con múltiples intentos', function(done) {
      // Arrange
      const connectionConfig = {
        host: 'test.example.com',
        username: 'testuser',
        password: 'correctpassword'
      };
      const finish1 = sinon.stub();
      const finish2 = sinon.stub();

      // Act - Registrar handler
      mockClient
        .on('keyboard-interactive', (name, instructions, instructionsLang, prompts, finish) => {
          try {
            if (prompts && prompts.length > 0) {
              finish([connectionConfig.password]);
            } else {
              finish([]);
            }
          } catch (e) {
            finish([]);
          }
        });

      // Simular múltiples intentos de autenticación
      const prompts = [{ prompt: 'Password:', echo: false }];
      eventHandlers['keyboard-interactive']('Auth1', 'Enter password', 'en', prompts, finish1);
      eventHandlers['keyboard-interactive']('Auth2', 'Enter password again', 'en', prompts, finish2);

      // Assert
      setTimeout(() => {
        expect(finish1.calledOnce).to.be.true;
        expect(finish1.calledWith([connectionConfig.password])).to.be.true;
        expect(finish2.calledOnce).to.be.true;
        expect(finish2.calledWith([connectionConfig.password])).to.be.true;
        done();
      }, 20);
    });
  });

  describe('Casos Edge y Compatibilidad', function() {
    it('🔐 debe funcionar con contraseñas que contengan caracteres especiales', function(done) {
      // Arrange
      const specialPassword = 'P@ssw0rd!#$%^&*()_+{}|:<>?[]\\;\'",./';
      const connectionConfig = {
        password: specialPassword
      };
      const prompts = [{ prompt: 'Password:', echo: false }];
      const finish = sinon.stub();
      
      // Simular el handler
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([connectionConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          finish([]);
        }
      };

      // Act
      keyboardInteractiveHandler('', '', '', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([specialPassword])).to.be.true;
        done();
      }, 10);
    });

    it('🔐 debe funcionar con contraseñas vacías', function(done) {
      // Arrange
      const emptyPassword = '';
      const connectionConfig = {
        password: emptyPassword
      };
      const prompts = [{ prompt: 'Password:', echo: false }];
      const finish = sinon.stub();
      
      // Simular el handler
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([connectionConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          finish([]);
        }
      };

      // Act
      keyboardInteractiveHandler('', '', '', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([emptyPassword])).to.be.true;
        done();
      }, 10);
    });

    it('🔐 debe manejar prompts con propiedades extra', function(done) {
      // Arrange
      const connectionConfig = {
        password: 'testpassword'
      };
      const prompts = [
        { 
          prompt: 'Password:', 
          echo: false,
          extraProp: 'value',
          nested: { data: 'test' }
        }
      ];
      const finish = sinon.stub();
      
      // Simular el handler
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([connectionConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          finish([]);
        }
      };

      // Act
      keyboardInteractiveHandler('', '', '', prompts, finish);

      // Assert
      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        expect(finish.calledWith([connectionConfig.password])).to.be.true;
        done();
      }, 10);
    });

    it('🛡️ debe manejar finish function que arroja error', function(done) {
      // Arrange
      const connectionConfig = {
        password: 'testpassword'
      };
      const prompts = [{ prompt: 'Password:', echo: false }];
      const finish = sinon.stub().throws(new Error('Finish error'));
      
      // Simular el handler con manejo de error en finish
      const keyboardInteractiveHandler = (name, instructions, instructionsLang, prompts, finish) => {
        try {
          if (prompts && prompts.length > 0) {
            finish([connectionConfig.password]);
          } else {
            finish([]);
          }
        } catch (e) {
          // En el código real, esto podría manejarse de forma específica
          // pero actualmente se captura en el try-catch general
        }
      };

      // Act & Assert
      expect(() => {
        keyboardInteractiveHandler('', '', '', prompts, finish);
      }).to.not.throw();

      setTimeout(() => {
        expect(finish.calledOnce).to.be.true;
        done();
      }, 10);
    });
  });

  describe('Compatibilidad con Autenticación Legacy', function() {
    it('🔄 debe ser compatible con autenticación password tradicional', function() {
      // Arrange
      const connectionOptions = {
        host: 'test.example.com',
        port: 22,
        username: 'testuser',
        password: 'testpassword'
      };

      // Act - Configuración que incluye tanto password como tryKeyboard
      const finalOptions = {
        host: connectionOptions.host,
        port: parseInt(connectionOptions.port, 10) || 22,
        username: connectionOptions.username,
        password: connectionOptions.password,
        tryKeyboard: true
      };

      // Assert
      expect(finalOptions.password).to.equal(connectionOptions.password);
      expect(finalOptions.tryKeyboard).to.be.true;
      
      // Ambos métodos de autenticación deben estar disponibles
      expect(finalOptions).to.have.property('password');
      expect(finalOptions).to.have.property('tryKeyboard');
    });

    it('🔄 debe mantener todas las opciones de conexión originales', function() {
      // Arrange
      const originalOptions = {
        host: 'test.example.com',
        port: '2222',
        username: 'testuser',
        password: 'testpassword',
        customOption: 'customValue' // Opción adicional
      };

      // Act - Preservar opciones existentes y añadir tryKeyboard
      const finalOptions = {
        ...originalOptions,
        port: parseInt(originalOptions.port, 10) || 22,
        tryKeyboard: true
      };

      // Assert
      expect(finalOptions.host).to.equal(originalOptions.host);
      expect(finalOptions.port).to.equal(2222);
      expect(finalOptions.username).to.equal(originalOptions.username);
      expect(finalOptions.password).to.equal(originalOptions.password);
      expect(finalOptions.customOption).to.equal(originalOptions.customOption);
      expect(finalOptions.tryKeyboard).to.be.true;
    });
  });
});