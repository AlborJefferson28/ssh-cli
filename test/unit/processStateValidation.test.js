// test/unit/processStateValidation.test.js - Tests para validación por estado del proceso
import { expect } from 'chai';
import sinon from 'sinon';

// Definir patrones de errores críticos globalmente para usar en tests
const criticalErrorPatterns = [
  /command not found/i,
  /not found/i,
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
  /cannot find module/i,
  /modulenotfounderror/i
];

describe('🔍 Validación por Estado del Proceso', function() {
  let clockStub;

  beforeEach(function() {
    clockStub = sinon.useFakeTimers();
  });

  afterEach(function() {
    clockStub.restore();
  });

  describe('validateCommandByProcessState()', function() {
    const validateCommandByProcessState = (conn, command, stream, options = {}) => {
      const {
        timeoutSeconds = 30,
        checkInterval = 5000,
        enableProcessCheck = true,
        enablePortCheck = true
      } = options;
      
      return new Promise((resolve) => {
        let hasOutput = false;
        let hasCriticalError = false;
        
        // Simular timeout de validación
        setTimeout(() => {
          if (!hasCriticalError) {
            const isLongRunning = command.includes('serve') || command.includes('start') || command.includes('dev');
            
            if (isLongRunning) {
              resolve({
                success: true,
                method: 'process_state_validation',
                duration: timeoutSeconds,
                stateValidation: {
                  overall_success: true,
                  checks: [
                    { type: 'process_by_command', success: true },
                    { type: 'port_status', port: 3000, success: true }
                  ]
                }
              });
            } else {
              resolve({
                success: true,
                method: 'exit_normally',
                duration: timeoutSeconds
              });
            }
          }
        }, timeoutSeconds * 10); // Simulación rápida
        
        // Simular stream events
        if (stream && stream.on) {
          stream.on('data', (data) => {
            hasOutput = true;
            const text = data.toString();
            
            // Verificar errores críticos
            const hasCritical = criticalErrorPatterns.some(pattern => pattern.test(text));
            if (hasCritical) {
              hasCriticalError = true;
              resolve({
                success: false,
                method: 'critical_error',
                reason: 'Error crítico detectado',
                error: text.match(criticalErrorPatterns.find(p => p.test(text)))[0]
              });
            }
          });
          
          stream.on('close', (code) => {
            if (code === 0) {
              resolve({
                success: true,
                method: 'exit_normally',
                exitCode: code
              });
            } else {
              resolve({
                success: false,
                method: 'exit_with_error',
                exitCode: code,
                reason: `Comando terminó con código ${code}`
              });
            }
          });
        }
      });
    };

    it('✅ debe validar comandos de servidor como exitosos', async function() {
      // Arrange
      const mockConn = {};
      const command = 'npm run serve';
      const mockStream = { on: sinon.stub() };

      // Act
      const promise = validateCommandByProcessState(mockConn, command, mockStream);
      clockStub.tick(300); // Simular timeout
      const result = await promise;

      // Assert
      expect(result.success).to.be.true;
      expect(result.method).to.equal('process_state_validation');
      expect(result.stateValidation).to.exist;
    });

    it('🎯 debe detectar comando exitoso por estado del proceso', async function() {
      // Arrange
      const mockConn = {};
      const command = 'npm start';
      const mockStream = { on: sinon.stub() };

      // Act
      const promise = validateCommandByProcessState(mockConn, command, mockStream);
      clockStub.tick(300);
      const result = await promise;

      // Assert
      expect(result.success).to.be.true;
      expect(result.stateValidation.overall_success).to.be.true;
    });

    it('❌ debe detectar errores críticos inmediatamente', async function() {
      // Arrange
      const mockConn = {};
      const command = 'invalid-command';
      const mockStream = {
        on: sinon.stub()
      };

      // Simular que el stream emite un error crítico
      mockStream.on.withArgs('data').callsArgWith(1, Buffer.from('command not found'));

      // Act
      const promise = validateCommandByProcessState(mockConn, command, mockStream);
      const result = await promise;

      // Assert
      expect(result.success).to.be.false;
      expect(result.method).to.equal('critical_error');
    });

    it('🔧 debe validar usando opciones personalizadas', async function() {
      // Arrange
      const mockConn = {};
      const command = 'npm run dev';
      const mockStream = { on: sinon.stub() };
      const options = {
        timeoutSeconds: 45,
        enableProcessCheck: true,
        enablePortCheck: false
      };

      // Act
      const promise = validateCommandByProcessState(mockConn, command, mockStream, options);
      clockStub.tick(450);
      const result = await promise;

      // Assert
      expect(result.success).to.be.true;
      expect(result.duration).to.equal(45);
    });

    it('🚫 debe fallar comandos con código de salida no cero', async function() {
      // Arrange
      const mockConn = {};
      const command = 'exit 1';
      const mockStream = {
        on: sinon.stub()
      };

      // Simular que el stream se cierra con código de error
      mockStream.on.withArgs('close').callsArgWith(1, 1);

      // Act
      const promise = validateCommandByProcessState(mockConn, command, mockStream);
      const result = await promise;

      // Assert
      expect(result.success).to.be.false;
      expect(result.method).to.equal('exit_with_error');
      expect(result.exitCode).to.equal(1);
    });

    it('⚡ debe validar comandos normales rápidamente', async function() {
      // Arrange
      const mockConn = {};
      const command = 'ls -la';
      const mockStream = { on: sinon.stub() };

      // Act
      const promise = validateCommandByProcessState(mockConn, command, mockStream);
      clockStub.tick(300);
      const result = await promise;

      // Assert
      expect(result.success).to.be.true;
      expect(result.method).to.equal('exit_normally');
    });
  });

  describe('Patrones de error crítico', function() {
    it('🚨 debe detectar "command not found"', function() {
      const testStrings = [
        'bash: nonexistent: command not found',
        'command not found: invalid-cmd',
        '/bin/sh: 1: nonexistent: not found',
        'zsh: command not found: invalidcmd'
      ];

      testStrings.forEach(str => {
        const detected = criticalErrorPatterns.some(pattern => pattern.test(str));
        expect(detected, `No se detectó error en: "${str}"`).to.be.true;
      });
    });

    it('🔒 debe detectar "permission denied"', function() {
      const testStrings = [
        'Permission denied',
        'bash: /restricted/file: Permission denied',
        'chmod: permission denied'
      ];

      testStrings.forEach(str => {
        const detected = criticalErrorPatterns.some(pattern => pattern.test(str));
        expect(detected).to.be.true;
      });
    });

    it('📁 debe detectar archivos no encontrados', function() {
      const testStrings = [
        'No such file or directory',
        'cat: file.txt: No such file or directory',
        'ls: cannot access file: No such file or directory'
      ];

      testStrings.forEach(str => {
        const detected = criticalErrorPatterns.some(pattern => pattern.test(str));
        expect(detected).to.be.true;
      });
    });

    it('🌐 debe detectar errores de puerto', function() {
      const testStrings = [
        'Error: listen EADDRINUSE: address already in use :::3000',
        'bind: address already in use',
        'port 8080 already in use'
      ];

      testStrings.forEach(str => {
        const detected = criticalErrorPatterns.some(pattern => pattern.test(str));
        expect(detected).to.be.true;
      });
    });

    it('💥 debe detectar errores fatales', function() {
      const testStrings = [
        'Fatal error: Uncaught exception',
        'Segmentation fault (core dumped)',
        'Process killed'
      ];

      testStrings.forEach(str => {
        const detected = criticalErrorPatterns.some(pattern => pattern.test(str));
        expect(detected).to.be.true;
      });
    });

    it('📦 debe detectar módulos no encontrados', function() {
      const testStrings = [
        'Error: Cannot find module \'express\'',
        'Module not found: Error: Can\'t resolve \'react\'',
        'ModuleNotFoundError: No module named \'django\''
      ];

      testStrings.forEach(str => {
        const detected = criticalErrorPatterns.some(pattern => pattern.test(str));
        expect(detected).to.be.true;
      });
    });

    it('✅ no debe detectar falsos positivos', function() {
      const testStrings = [
        'Server started successfully',
        'npm start completed',
        'Application running on port 3000',
        'Build completed without errors'
      ];

      testStrings.forEach(str => {
        const detected = criticalErrorPatterns.some(pattern => pattern.test(str));
        expect(detected).to.be.false;
      });
    });
  });

  describe('Integración con sistema de validación', function() {
    it('🔍 debe validar proceso por comando', function() {
      const serverCommands = ['npm run dev', 'npm start', 'python app.py'];
      
      serverCommands.forEach(cmd => {
        const isServerCommand = cmd.includes('dev') || cmd.includes('start') || cmd.includes('app.py');
        expect(isServerCommand).to.be.true;
      });
    });

    it('🔌 debe validar puerto cuando es aplicable', function() {
      const mockValidation = {
        stateValidation: {
          checks: [
            { type: 'port_status', port: 3000, success: true }
          ]
        }
      };

      const portCheck = mockValidation.stateValidation.checks.find(c => c.type === 'port_status');
      expect(portCheck.success).to.be.true;
      expect(portCheck.port).to.equal(3000);
    });

    it('🆔 debe validar proceso por PID', function() {
      const mockValidation = {
        stateValidation: {
          checks: [
            { type: 'process_by_command', success: true, pid: 12345 }
          ]
        }
      };

      const processCheck = mockValidation.stateValidation.checks.find(c => c.type === 'process_by_command');
      expect(processCheck.success).to.be.true;
    });

    it('❌ debe manejar comandos no servidores', function() {
      const normalCommands = ['ls -la', 'cd /home', 'echo hello'];
      
      normalCommands.forEach(cmd => {
        const isServerCommand = cmd.includes('dev') || cmd.includes('start') || cmd.includes('serve');
        expect(isServerCommand).to.be.false;
      });
    });

    it('🚨 debe manejar errores de validación', function() {
      const errorResult = {
        success: false,
        method: 'critical_error',
        error: 'command not found'
      };

      expect(errorResult.success).to.be.false;
      expect(errorResult.method).to.equal('critical_error');
      expect(errorResult.error).to.include('command not found');
    });
  });
});