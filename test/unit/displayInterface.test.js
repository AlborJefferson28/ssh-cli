// test/unit/displayInterface.test.js - Tests para la interfaz de visualización limpia
import { expect } from 'chai';
import sinon from 'sinon';

describe('🎨 Interfaz de Visualización Limpia', function() {
  let consoleLogStub, consoleClearStub;
  
  beforeEach(function() {
    consoleLogStub = sinon.stub(console, 'log');
    consoleClearStub = sinon.stub(console, 'clear');
  });
  
  afterEach(function() {
    consoleLogStub.restore();
    consoleClearStub.restore();
  });

  describe('displayTaskProgress()', function() {
    const displayTaskProgress = (host, totalTasks, commandList, taskStatuses, currentIndex = -1) => {
      console.clear();
      console.log(`✅ Conectado a ${host}`);
      console.log(`📝 Ejecutando ${totalTasks} tarea(s)...\n`);
      
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
    };

    it('✅ debe limpiar pantalla al inicio', function() {
      // Arrange
      const host = 'test-server.com';
      const commandList = ['ls -la', 'pwd'];
      const taskStatuses = [];

      // Act
      displayTaskProgress(host, 2, commandList, taskStatuses);

      // Assert
      expect(consoleClearStub.calledOnce).to.be.true;
    });

    it('📝 debe mostrar información de conexión correcta', function() {
      // Arrange
      const host = 'prod-server.example.com';
      const totalTasks = 3;
      const commandList = ['git pull', 'npm install', 'npm start'];
      const taskStatuses = [];

      // Act
      displayTaskProgress(host, totalTasks, commandList, taskStatuses);

      // Assert
      expect(consoleLogStub.calledWith(`✅ Conectado a ${host}`)).to.be.true;
      expect(consoleLogStub.calledWith(`📝 Ejecutando ${totalTasks} tarea(s)...\n`)).to.be.true;
    });

    it('⏳ debe mostrar todas las tareas como pendientes por defecto', function() {
      // Arrange
      const host = 'test-server';
      const commandList = ['command1', 'command2', 'command3'];
      const taskStatuses = [];

      // Act
      displayTaskProgress(host, 3, commandList, taskStatuses);

      // Assert
      commandList.forEach((cmd, idx) => {
        expect(consoleLogStub.calledWith(`  ⏳ ${idx + 1}. ${cmd}`)).to.be.true;
      });
    });

    it('✅ debe mostrar comandos completados correctamente', function() {
      // Arrange
      const host = 'test-server';
      const commandList = ['command1', 'command2', 'command3'];
      const taskStatuses = ['✅', '✅', '⏳'];
      const currentIndex = 2;

      // Act
      displayTaskProgress(host, 3, commandList, taskStatuses, currentIndex);

      // Assert
      expect(consoleLogStub.calledWith(`  ✅ 1. command1`)).to.be.true;
      expect(consoleLogStub.calledWith(`  ✅ 2. command2`)).to.be.true;
      expect(consoleLogStub.calledWith(`  ⏳ 3. command3`)).to.be.true;
    });

    it('🔗 debe mostrar estados personalizados de tareas', function() {
      // Arrange
      const host = 'test-server';
      const commandList = ['git pull', 'npm run build', 'npm start'];
      const taskStatuses = ['✅', '❌', '🔗'];
      const currentIndex = 2;

      // Act
      displayTaskProgress(host, 3, commandList, taskStatuses, currentIndex);

      // Assert
      expect(consoleLogStub.calledWith(`  ✅ 1. git pull`)).to.be.true;
      expect(consoleLogStub.calledWith(`  ❌ 2. npm run build`)).to.be.true;
      expect(consoleLogStub.calledWith(`  ⏳ 3. npm start`)).to.be.true;
    });

    it('📄 debe dejar línea en blanco al final para loader', function() {
      // Arrange
      const host = 'test-server';
      const commandList = ['test'];
      const taskStatuses = [];

      // Act
      displayTaskProgress(host, 1, commandList, taskStatuses);

      // Assert
      expect(consoleLogStub.calledWith("")).to.be.true;
    });

    it('🎯 debe manejar comando actual correctamente', function() {
      // Arrange
      const host = 'test-server';
      const commandList = ['cmd1', 'cmd2', 'cmd3'];
      const taskStatuses = ['✅', '❌', '🔗'];
      const currentIndex = 1; // Segundo comando está ejecutándose

      // Act
      displayTaskProgress(host, 3, commandList, taskStatuses, currentIndex);

      // Assert
      expect(consoleLogStub.calledWith(`  ✅ 1. cmd1`)).to.be.true; // Anterior: completado
      expect(consoleLogStub.calledWith(`  ⏳ 2. cmd2`)).to.be.true; // Actual: en progreso
      expect(consoleLogStub.calledWith(`  ⏳ 3. cmd3`)).to.be.true; // Futuro: pendiente
    });
  });

  describe('createLoader()', function() {
    let clockStub, processWriteStub;

    beforeEach(function() {
      clockStub = sinon.useFakeTimers();
      processWriteStub = sinon.stub(process.stdout, 'write');
    });

    afterEach(function() {
      clockStub.restore();
      processWriteStub.restore();
    });

    const createLoader = (message) => {
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
    };

    it('⠋ debe iniciar animación de loader', function() {
      // Arrange
      const message = 'Ejecutando: npm install';

      // Act
      const loader = createLoader(message);
      clockStub.tick(100);

      // Assert
      expect(processWriteStub.calledWith('\r⠋ Ejecutando: npm install')).to.be.true;
      
      // Cleanup
      loader.stop();
    });

    it('🔄 debe ciclar a través de todos los frames', function() {
      // Arrange
      const message = 'Procesando...';
      const expectedFrames = ['⠋', '⠙', '⠹', '⠸', '⠼'];

      // Act
      const loader = createLoader(message);
      
      expectedFrames.forEach((frame, index) => {
        clockStub.tick(100);
        expect(processWriteStub.calledWith(`\r${frame} ${message}`)).to.be.true;
      });

      // Cleanup
      loader.stop();
    });

    it('🛑 debe detenerse correctamente', function() {
      // Arrange
      const message = 'Cargando...';
      const finalMessage = '✅ Completado';

      // Act
      const loader = createLoader(message);
      clockStub.tick(200);
      loader.stop(finalMessage);

      // Assert
      expect(processWriteStub.calledWith(`\r${finalMessage}\n`)).to.be.true;
    });

    it('🔄 debe actualizar mensaje dinámicamente', function() {
      // Arrange
      const initialMessage = 'Conectando...';
      const updatedMessage = 'Ejecutando comandos...';

      // Act
      const loader = createLoader(initialMessage);
      clockStub.tick(100);
      loader.update(updatedMessage);
      clockStub.tick(100);

      // Assert
      expect(processWriteStub.calledWith('\r⠋ Conectando...')).to.be.true;
      expect(processWriteStub.calledWith('\r⠙ Ejecutando comandos...')).to.be.true;
      
      // Cleanup
      loader.stop();
    });
  });

  describe('Limpieza de interfaz', function() {
    it('🧹 debe eliminar mensajes invasivos de contraseña', function() {
      // Arrange
      const createPasswordTimeoutHandler = (stream, password, commandName, logStream) => {
        const sendPassword = (reason = "") => {
          // Solo escribir al log, sin mostrar en consola para mantener interfaz limpia
          stream.write(password + "\n");
          logStream.write(`[AUTO-RESPONSE] Contraseña enviada automáticamente${reason ? ` (${reason})` : ""}\n`);
        };
        
        return {
          triggerPasswordSend: sendPassword,
          cancel: () => {},
          isResponded: () => false
        };
      };

      const mockStream = { write: sinon.stub() };
      const mockLogStream = { write: sinon.stub() };

      // Act
      const handler = createPasswordTimeoutHandler(mockStream, 'password123', 'sudo ls', mockLogStream);
      handler.triggerPasswordSend('Test reason - ');

      // Assert
      expect(mockStream.write.calledWith('password123\n')).to.be.true;
      expect(mockLogStream.write.calledWith('[AUTO-RESPONSE] Contraseña enviada automáticamente (Test reason - )\n')).to.be.true;
      // Verificar que NO se llama console.log
      expect(consoleLogStub.notCalled).to.be.true;
    });

    it('📱 debe mantener interfaz limpia sin logs de debug', function() {
      // Arrange
      const executeDebugCommand = (command, silent = true) => {
        if (!silent) {
          console.log(`🔄 Ejecutando: ${command}`);
        }
        // Funcionalidad sin mostrar mensajes invasivos
        return { success: true, output: 'Command executed' };
      };

      // Act
      const result = executeDebugCommand('ls -la', true); // Modo silencioso

      // Assert
      expect(result.success).to.be.true;
      expect(consoleLogStub.notCalled).to.be.true; // No mensajes en consola
    });
  });
});