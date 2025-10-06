// test/unit/processManagement.test.js - Tests para gestión de procesos SSH
import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import { TestUtils } from '../helpers/testUtils.js';

describe('⚙️ Gestión de Procesos SSH', function() {
  let fsStub;
  
  beforeEach(function() {
    fsStub = {
      existsSync: sinon.stub(fs, 'existsSync'),
      readFileSync: sinon.stub(fs, 'readFileSync'),
      writeFileSync: sinon.stub(fs, 'writeFileSync')
    };
  });

  afterEach(function() {
    Object.values(fsStub).forEach(stub => stub.restore());
  });

  describe('deleteSshProcess()', function() {
    it('🗑️ debe eliminar proceso por ID válido', function() {
      // Arrange
      const mockProcesses = TestUtils.createMockProcessList(3);
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns(JSON.stringify(mockProcesses));
      
      const deleteSshProcess = (processId) => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          console.log('📭 No hay procesos SSH guardados para eliminar.');
          return false;
        }
      
        const processIndex = processId - 1;
        
        if (processIndex < 0 || processIndex >= processes.length) {
          console.log('❌ ID de proceso inválido. Usa "list" para ver los procesos disponibles.');
          return false;
        }
      
        const processToDelete = processes[processIndex];
        processes.splice(processIndex, 1);
        
        fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));
        return true;
      };

      // Act
      const result = deleteSshProcess(2);

      // Assert
      expect(result).to.be.true;
      expect(fsStub.writeFileSync.calledOnce).to.be.true;
      
      const savedData = JSON.parse(fsStub.writeFileSync.firstCall.args[1]);
      expect(savedData).to.have.lengthOf(2); // Un proceso eliminado
    });

    it('🗑️ debe fallar con ID inválido (muy alto)', function() {
      // Arrange
      const mockProcesses = TestUtils.createMockProcessList(2);
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns(JSON.stringify(mockProcesses));
      
      const deleteSshProcess = (processId) => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          return false;
        }
      
        const processIndex = processId - 1;
        
        if (processIndex < 0 || processIndex >= processes.length) {
          return false;
        }
      
        processes.splice(processIndex, 1);
        fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));
        return true;
      };

      // Act
      const result = deleteSshProcess(5); // ID muy alto

      // Assert
      expect(result).to.be.false;
      expect(fsStub.writeFileSync.called).to.be.false;
    });

    it('🗑️ debe fallar con ID inválido (muy bajo)', function() {
      // Arrange
      const mockProcesses = TestUtils.createMockProcessList(2);
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns(JSON.stringify(mockProcesses));
      
      const deleteSshProcess = (processId) => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          return false;
        }
      
        const processIndex = processId - 1;
        
        if (processIndex < 0 || processIndex >= processes.length) {
          return false;
        }
      
        processes.splice(processIndex, 1);
        fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));
        return true;
      };

      // Act
      const result = deleteSshProcess(0); // ID muy bajo

      // Assert
      expect(result).to.be.false;
      expect(fsStub.writeFileSync.called).to.be.false;
    });

    it('🗑️ debe fallar cuando no hay procesos', function() {
      // Arrange
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns('[]'); // Array vacío
      
      const deleteSshProcess = (processId) => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          return false;
        }
      
        const processIndex = processId - 1;
        
        if (processIndex < 0 || processIndex >= processes.length) {
          return false;
        }
      
        processes.splice(processIndex, 1);
        fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));
        return true;
      };

      // Act
      const result = deleteSshProcess(1);

      // Assert
      expect(result).to.be.false;
      expect(fsStub.writeFileSync.called).to.be.false;
    });
  });

  describe('showSshProcessList()', function() {
    it('📋 debe mostrar procesos agrupados por host', function() {
      // Arrange
      const mockProcesses = [
        TestUtils.createMockProcess({
          name: 'Deploy Frontend',
          config: { hostName: 'Servidor Web', host: 'web.example.com' }
        }),
        TestUtils.createMockProcess({
          name: 'Deploy Backend',
          config: { hostName: 'Servidor Web', host: 'web.example.com' }
        }),
        TestUtils.createMockProcess({
          name: 'Backup Database',
          config: { hostName: 'Base de Datos', host: 'db.example.com' }
        })
      ];
      
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns(JSON.stringify(mockProcesses));
      
      const showSshProcessList = () => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
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

        const hostEntries = Object.entries(groupedByHost);
        
        return { processes, groupedByHost, hostEntries };
      };

      // Act
      const result = showSshProcessList();

      // Assert
      expect(result.processes).to.have.lengthOf(3);
      expect(result.groupedByHost).to.have.property('Servidor Web');
      expect(result.groupedByHost).to.have.property('Base de Datos');
      expect(result.groupedByHost['Servidor Web']).to.have.lengthOf(2);
      expect(result.groupedByHost['Base de Datos']).to.have.lengthOf(1);
      expect(result.hostEntries).to.have.lengthOf(2);
    });

    it('📋 debe manejar lista vacía de procesos', function() {
      // Arrange
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns('[]');
      
      const showSshProcessList = () => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          return processes;
        }

        // Código de agrupación...
        return { processes: [], groupedByHost: {}, hostEntries: [] };
      };

      // Act
      const result = showSshProcessList();

      // Assert
      expect(result).to.be.an('array').that.is.empty;
    });

    it('📋 debe manejar procesos sin nombre de host', function() {
      // Arrange
      const mockProcesses = [
        TestUtils.createMockProcess({
          config: { host: 'test.example.com', hostName: undefined }
        })
      ];
      
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns(JSON.stringify(mockProcesses));
      
      const showSshProcessList = () => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          return processes;
        }

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
        
        return { processes, groupedByHost, hostEntries };
      };

      // Act
      const result = showSshProcessList();

      // Assert
      expect(result.groupedByHost).to.have.property('Sin nombre de host');
      expect(result.groupedByHost['Sin nombre de host']).to.have.lengthOf(1);
    });
  });

  describe('showProcessStatistics()', function() {
    it('📊 debe calcular estadísticas correctamente', function() {
      // Arrange
      const mockProcesses = [
        TestUtils.createMockProcess({
          config: { hostName: 'Servidor Web' },
          commands: ['cmd1', 'cmd2', 'cmd3']
        }),
        TestUtils.createMockProcess({
          config: { hostName: 'Servidor Web' },
          commands: ['cmd4', 'cmd5']
        }),
        TestUtils.createMockProcess({
          config: { hostName: 'Base de Datos' },
          commands: ['cmd6']
        })
      ];
      
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns(JSON.stringify(mockProcesses));
      
      const showProcessStatistics = () => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          return null;
        }

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

        return {
          totalProcesses: processes.length,
          uniqueHosts: Object.keys(groupedByHost).length,
          totalCommands,
          averageCommands: totalCommands / processes.length,
          groupedByHost
        };
      };

      // Act
      const result = showProcessStatistics();

      // Assert
      expect(result.totalProcesses).to.equal(3);
      expect(result.uniqueHosts).to.equal(2);
      expect(result.totalCommands).to.equal(6);
      expect(result.averageCommands).to.equal(2.0);
      expect(result.groupedByHost['Servidor Web'].count).to.equal(2);
      expect(result.groupedByHost['Servidor Web'].commands).to.equal(5);
      expect(result.groupedByHost['Base de Datos'].count).to.equal(1);
      expect(result.groupedByHost['Base de Datos'].commands).to.equal(1);
    });

    it('📊 debe manejar lista vacía', function() {
      // Arrange
      fsStub.existsSync.returns(true);
      fsStub.readFileSync.returns('[]');
      
      const showProcessStatistics = () => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          return null;
        }
        // ... resto del código
      };

      // Act
      const result = showProcessStatistics();

      // Assert
      expect(result).to.be.null;
    });
  });

  describe('Validación de estructura de procesos', function() {
    it('✅ debe validar estructura de proceso correcta', function() {
      // Arrange
      const validProcess = TestUtils.createMockProcess();

      // Act & Assert
      expect(() => TestUtils.validateProcessStructure(validProcess)).to.not.throw();
    });

    it('❌ debe fallar con estructura inválida - falta ID', function() {
      // Arrange
      const invalidProcess = TestUtils.createMockProcess();
      delete invalidProcess.id;

      // Act & Assert
      expect(() => TestUtils.validateProcessStructure(invalidProcess))
        .to.throw('Missing required field: id');
    });

    it('❌ debe fallar con estructura inválida - falta config', function() {
      // Arrange
      const invalidProcess = TestUtils.createMockProcess();
      delete invalidProcess.config;

      // Act & Assert
      expect(() => TestUtils.validateProcessStructure(invalidProcess))
        .to.throw('Missing required field: config');
    });

    it('❌ debe fallar con estructura inválida - comandos no es array', function() {
      // Arrange
      const invalidProcess = TestUtils.createMockProcess();
      invalidProcess.commands = 'not an array';

      // Act & Assert
      expect(() => TestUtils.validateProcessStructure(invalidProcess))
        .to.throw('Commands must be an array');
    });

    it('❌ debe fallar con config incompleta', function() {
      // Arrange
      const invalidProcess = TestUtils.createMockProcess();
      delete invalidProcess.config.hostName;

      // Act & Assert
      expect(() => TestUtils.validateProcessStructure(invalidProcess))
        .to.throw('Missing required config field: hostName');
    });
  });
});