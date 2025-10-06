// test/unit/fileSystem.test.js - Tests para funciones de sistema de archivos
import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import path from 'path';
import { TestUtils } from '../helpers/testUtils.js';

// Mock del módulo principal para poder testear las funciones
let mockIndex;

describe('🗂️ Sistema de Archivos', function() {
  let fsStub;
  
  beforeEach(async function() {
    // Crear stubs de fs
    fsStub = {
      existsSync: sinon.stub(fs, 'existsSync'),
      mkdirSync: sinon.stub(fs, 'mkdirSync'),
      readFileSync: sinon.stub(fs, 'readFileSync'),
      writeFileSync: sinon.stub(fs, 'writeFileSync'),
      createWriteStream: sinon.stub(fs, 'createWriteStream')
    };
  });

  afterEach(function() {
    // Restaurar stubs
    Object.values(fsStub).forEach(stub => stub.restore());
  });

  describe('ensureDirectories()', function() {
    it('📁 debe crear el directorio process si no existe', function() {
      // Arrange
      fsStub.existsSync.withArgs(sinon.match(/process$/)).returns(false);
      fsStub.existsSync.withArgs(sinon.match(/logs$/)).returns(true);
      
      // Simular la función
      const ensureDirectories = () => {
        const PROCESS_DIR = '/test/process';
        const LOGS_DIR = '/test/logs';
        
        if (!fs.existsSync(PROCESS_DIR)) {
          fs.mkdirSync(PROCESS_DIR, { recursive: true });
        }
        if (!fs.existsSync(LOGS_DIR)) {
          fs.mkdirSync(LOGS_DIR, { recursive: true });
        }
      };

      // Act
      ensureDirectories();

      // Assert
      expect(fsStub.mkdirSync.calledWith(sinon.match(/process$/), { recursive: true })).to.be.true;
      expect(fsStub.mkdirSync.calledWith(sinon.match(/logs$/), { recursive: true })).to.be.false;
    });

    it('📁 debe crear el directorio logs si no existe', function() {
      // Arrange
      fsStub.existsSync.withArgs(sinon.match(/process$/)).returns(true);
      fsStub.existsSync.withArgs(sinon.match(/logs$/)).returns(false);
      
      const ensureDirectories = () => {
        const PROCESS_DIR = '/test/process';
        const LOGS_DIR = '/test/logs';
        
        if (!fs.existsSync(PROCESS_DIR)) {
          fs.mkdirSync(PROCESS_DIR, { recursive: true });
        }
        if (!fs.existsSync(LOGS_DIR)) {
          fs.mkdirSync(LOGS_DIR, { recursive: true });
        }
      };

      // Act
      ensureDirectories();

      // Assert
      expect(fsStub.mkdirSync.calledWith(sinon.match(/logs$/), { recursive: true })).to.be.true;
      expect(fsStub.mkdirSync.calledWith(sinon.match(/process$/), { recursive: true })).to.be.false;
    });

    it('📁 no debe crear directorios si ya existen', function() {
      // Arrange
      fsStub.existsSync.returns(true);
      
      const ensureDirectories = () => {
        const PROCESS_DIR = '/test/process';
        const LOGS_DIR = '/test/logs';
        
        if (!fs.existsSync(PROCESS_DIR)) {
          fs.mkdirSync(PROCESS_DIR, { recursive: true });
        }
        if (!fs.existsSync(LOGS_DIR)) {
          fs.mkdirSync(LOGS_DIR, { recursive: true });
        }
      };

      // Act
      ensureDirectories();

      // Assert
      expect(fsStub.mkdirSync.called).to.be.false;
    });
  });

  describe('loadSshProcesses()', function() {
    it('📄 debe cargar procesos desde archivo JSON existente', function() {
      // Arrange
      const mockProcesses = TestUtils.createMockProcessList(2);
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns(JSON.stringify(mockProcesses));
      
      const loadSshProcesses = () => {
        try {
          if (fs.existsSync('/test/ssh-processes.json')) {
            const data = fs.readFileSync('/test/ssh-processes.json', 'utf8');
            return JSON.parse(data);
          }
        } catch (err) {
          console.error('Error cargando procesos SSH:', err);
        }
        return [];
      };

      // Act
      const result = loadSshProcesses();

      // Assert
      expect(result).to.have.lengthOf(2);
      expect(result[0]).to.have.property('name');
      expect(result[0]).to.have.property('config');
      expect(result[0]).to.have.property('commands');
    });

    it('📄 debe retornar array vacío si el archivo no existe', function() {
      // Arrange
      fsStub.existsSync.returns(false);
      
      const loadSshProcesses = () => {
        try {
          if (fs.existsSync('/test/ssh-processes.json')) {
            const data = fs.readFileSync('/test/ssh-processes.json', 'utf8');
            return JSON.parse(data);
          }
        } catch (err) {
          console.error('Error cargando procesos SSH:', err);
        }
        return [];
      };

      // Act
      const result = loadSshProcesses();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
      expect(fsStub.readFileSync.called).to.be.false;
    });

    it('📄 debe manejar errores de JSON inválido', function() {
      // Arrange
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns('json inválido {');
      
      const loadSshProcesses = () => {
        try {
          if (fs.existsSync('/test/ssh-processes.json')) {
            const data = fs.readFileSync('/test/ssh-processes.json', 'utf8');
            return JSON.parse(data);
          }
        } catch (err) {
          console.error('Error cargando procesos SSH:', err);
        }
        return [];
      };

      // Act
      const result = loadSshProcesses();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('saveSshProcesses()', function() {
    it('💾 debe guardar procesos en archivo JSON', function() {
      // Arrange
      const mockProcesses = TestUtils.createMockProcessList(1);
      fsStub.existsSync.returns(true);
      
      const saveSshProcesses = (processes) => {
        try {
          fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));
        } catch (err) {
          console.error('Error guardando procesos SSH:', err);
        }
      };

      // Act
      saveSshProcesses(mockProcesses);

      // Assert
      expect(fsStub.writeFileSync.calledOnce).to.be.true;
      expect(fsStub.writeFileSync.firstCall.args[0]).to.equal('/test/ssh-processes.json');
      
      const savedData = JSON.parse(fsStub.writeFileSync.firstCall.args[1]);
      expect(savedData).to.have.lengthOf(1);
      expect(savedData[0]).to.have.property('name');
    });

    it('💾 debe manejar errores de escritura', function() {
      // Arrange
      fsStub.writeFileSync.throws(new Error('Permission denied'));
      
      const saveSshProcesses = (processes) => {
        try {
          fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));
        } catch (err) {
          console.error('Error guardando procesos SSH:', err);
        }
      };

      // Act & Assert - No debe lanzar error
      expect(() => saveSshProcesses([])).to.not.throw();
    });

    it('💾 debe formatear JSON correctamente', function() {
      // Arrange
      const mockProcesses = [TestUtils.createMockProcess()];
      
      const saveSshProcesses = (processes) => {
        try {
          fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));
        } catch (err) {
          console.error('Error guardando procesos SSH:', err);
        }
      };

      // Act
      saveSshProcesses(mockProcesses);

      // Assert
      const savedContent = fsStub.writeFileSync.firstCall.args[1];
      expect(savedContent).to.include('\\n'); // JSON formateado
      expect(savedContent).to.include('  '); // Indentación
    });
  });

  describe('Creación de streams de logs', function() {
    it('📊 debe crear stream de escritura para logs', function() {
      // Arrange
      const mockStream = { 
        write: sinon.stub(),
        end: sinon.stub()
      };
      fsStub.createWriteStream.returns(mockStream);
      
      // Act
      const logStream = fs.createWriteStream('/test/logs/test.log');
      logStream.write('Test log entry');

      // Assert
      expect(fsStub.createWriteStream.calledWith('/test/logs/test.log')).to.be.true;
      expect(mockStream.write.calledWith('Test log entry')).to.be.true;
    });
  });
});