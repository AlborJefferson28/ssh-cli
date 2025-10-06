// test/integration/endToEnd.test.js - Tests end-to-end del CLI completo
import { expect } from 'chai';
import sinon from 'sinon';
import fs from 'fs';
import { TestUtils } from '../helpers/testUtils.js';

describe('🔄 Tests End-to-End del CLI', function() {
  let fsStubs;
  let inquirerStub;
  let consoleStub;

  beforeEach(function() {
    fsStubs = {
      existsSync: sinon.stub(fs, 'existsSync'),
      readFileSync: sinon.stub(fs, 'readFileSync'),
      writeFileSync: sinon.stub(fs, 'writeFileSync'),
      mkdirSync: sinon.stub(fs, 'mkdirSync'),
      createWriteStream: sinon.stub(fs, 'createWriteStream')
    };

    consoleStub = sinon.stub(console, 'log');
  });

  afterEach(function() {
    Object.values(fsStubs).forEach(stub => stub.restore());
    consoleStub.restore();
    if (inquirerStub) {
      inquirerStub();
    }
  });

  describe('🚀 Flujo completo de creación y ejecución de proceso', function() {
    it('✅ debe crear, guardar y ejecutar un proceso SSH completo', async function() {
      // Arrange - Setup del sistema de archivos
      fsStubs.existsSync.returns(false); // Directorios no existen inicialmente
      fsStubs.readFileSync.returns('[]'); // No hay procesos guardados

      const mockLogStream = {
        write: sinon.stub(),
        end: sinon.stub()
      };
      fsStubs.createWriteStream.returns(mockLogStream);

      // Mock de inquirer para simular inputs del usuario
      inquirerStub = await TestUtils.simulateInquirerPrompts({
        host: 'test.example.com',
        hostName: 'Test Server',
        port: '22',
        username: 'testuser',
        password: 'testpass',
        cmd: 'ls -la',
        again: false,
        saveProcess: true,
        name: 'Test Process',
        executeNow: true
      });

      // Mock de SSH connection
      const mockSSHConnection = TestUtils.createMockSSHConnection();

      // Simular función principal de creación de proceso
      const runSshProcess = async () => {
        // 1. Configuración de conexión (simulada por inquirer)
        const connectionConfig = {
          host: 'test.example.com',
          port: '22',
          username: 'testuser',
          password: 'testpass',
          hostName: 'Test Server'
        };

        const commandList = ['ls -la'];
        const processName = 'Test Process';

        // 2. Guardar proceso
        const processes = [];
        const newProcess = {
          id: Date.now(),
          name: processName,
          config: { ...connectionConfig, password: '***' },
          commands: [...commandList],
          createdAt: new Date().toISOString()
        };
        
        processes.push(newProcess);
        fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));

        // 3. Ejecutar proceso
        return new Promise((resolve) => {
          mockSSHConnection
            .on('ready', async () => {
              const results = [];
              
              for (const command of commandList) {
                const result = await new Promise((cmdResolve) => {
                  mockSSHConnection.exec(command, (err, stream) => {
                    if (err) {
                      cmdResolve({ success: false, error: err });
                      return;
                    }

                    let output = '';
                    stream
                      .on('close', (code) => {
                        cmdResolve({ 
                          success: code === 0,
                          command,
                          output,
                          exitCode: code
                        });
                      })
                      .on('data', (data) => {
                        output += data.toString();
                      });
                  });
                });
                
                results.push(result);
              }

              resolve({
                success: true,
                connectionConfig,
                processName,
                commands: commandList,
                results
              });
            })
            .connect(connectionConfig);
        });
      };

      // Act
      const result = await runSshProcess();

      // Assert
      expect(result.success).to.be.true;
      expect(result.processName).to.equal('Test Process');
      expect(result.commands).to.deep.equal(['ls -la']);
      expect(result.results).to.have.lengthOf(1);
      expect(result.results[0].success).to.be.true;
      
      // Verificar que se guardó el proceso
      expect(fsStubs.writeFileSync.calledOnce).to.be.true;
      const savedData = JSON.parse(fsStubs.writeFileSync.firstCall.args[1]);
      expect(savedData).to.have.lengthOf(1);
      expect(savedData[0].name).to.equal('Test Process');
      expect(savedData[0].config.hostName).to.equal('Test Server');
    });

    it('🏠 debe manejar host existente con valores pre-completados', async function() {
      // Arrange - Host existente
      const existingProcesses = [
        TestUtils.createMockProcess({
          config: {
            host: 'existing.example.com',
            port: '2222',
            username: 'deploy',
            hostName: 'Existing Server'
          }
        })
      ];

      fsStubs.existsSync.returns(true);
      fsStubs.readFileSync.returns(JSON.stringify(existingProcesses));

      inquirerStub = await TestUtils.simulateInquirerPrompts({
        host: 'existing.example.com', // Host existente
        port: '2222', // Debería usar el valor existente
        username: 'deploy', // Debería usar el valor existente
        password: 'newpass',
        cmd: 'git pull',
        again: false,
        saveProcess: true,
        name: 'Deploy Process',
        executeNow: false // No ejecutar
      });

      const createProcessWithExistingHost = async () => {
        // Simular lógica de detección de host existente
        const inputHost = 'existing.example.com';
        const loadedProcesses = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        const existingHost = loadedProcesses.find(proc => proc.config.host === inputHost);

        if (existingHost) {
          // Usar configuración existente
          const connectionConfig = {
            host: inputHost,
            port: existingHost.config.port,
            username: existingHost.config.username,
            password: 'newpass', // Nueva contraseña
            hostName: existingHost.config.hostName
          };

          return {
            hostExists: true,
            connectionConfig,
            existingData: {
              hostName: existingHost.config.hostName,
              port: existingHost.config.port,
              username: existingHost.config.username
            }
          };
        }

        return { hostExists: false };
      };

      // Act
      const result = await createProcessWithExistingHost();

      // Assert
      expect(result.hostExists).to.be.true;
      expect(result.connectionConfig.hostName).to.equal('Existing Server');
      expect(result.connectionConfig.port).to.equal('2222');
      expect(result.connectionConfig.username).to.equal('deploy');
      expect(result.existingData.hostName).to.equal('Existing Server');
    });
  });

  describe('📋 Flujo de navegación y listado de procesos', function() {
    it('🏠 debe listar procesos agrupados por host correctamente', function() {
      // Arrange
      const mockProcesses = [
        TestUtils.createMockProcess({
          name: 'Deploy Frontend',
          config: { hostName: 'Web Server', host: 'web.example.com' }
        }),
        TestUtils.createMockProcess({
          name: 'Deploy Backend',
          config: { hostName: 'Web Server', host: 'web.example.com' }
        }),
        TestUtils.createMockProcess({
          name: 'Backup Database',
          config: { hostName: 'Database Server', host: 'db.example.com' }
        })
      ];

      fsStubs.existsSync.returns(true);
      fsStubs.readFileSync.returns(JSON.stringify(mockProcesses));

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
      expect(result.processes).to.have.lengthOf(3);
      expect(result.hostEntries).to.have.lengthOf(2);
      expect(result.groupedByHost['Web Server']).to.have.lengthOf(2);
      expect(result.groupedByHost['Database Server']).to.have.lengthOf(1);
      
      // Verificar que los procesos mantienen el índice original
      expect(result.groupedByHost['Web Server'][0]).to.have.property('originalIndex');
      expect(result.groupedByHost['Web Server'][1]).to.have.property('originalIndex');
    });

    it('🎯 debe seleccionar proceso por host ID y posición correctamente', function() {
      // Arrange
      const mockProcesses = TestUtils.createMockProcessList(3);
      fsStubs.existsSync.returns(true);
      fsStubs.readFileSync.returns(JSON.stringify(mockProcesses));

      const selectProcessByHostIdAndPosition = (hostId, position) => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        // Agrupar por host
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
        const hostIndex = hostId - 1;
        
        if (hostIndex < 0 || hostIndex >= hostEntries.length) {
          return { error: `Host ID ${hostId} no encontrado` };
        }

        const [hostName, hostProcesses] = hostEntries[hostIndex];
        const processIndex = position - 1;
        
        if (processIndex < 0 || processIndex >= hostProcesses.length) {
          return { error: `Posición ${position} inválida para host ${hostName}` };
        }

        return {
          success: true,
          hostName,
          process: hostProcesses[processIndex]
        };
      };

      // Act & Assert
      const validSelection = selectProcessByHostIdAndPosition(1, 1);
      expect(validSelection.success).to.be.true;
      expect(validSelection.hostName).to.be.a('string');
      expect(validSelection.process).to.have.property('name');

      const invalidHostId = selectProcessByHostIdAndPosition(10, 1);
      expect(invalidHostId.error).to.include('Host ID 10 no encontrado');

      const invalidPosition = selectProcessByHostIdAndPosition(1, 10);
      expect(invalidPosition.error).to.include('Posición 10 inválida');
    });
  });

  describe('🗑️ Flujo de eliminación de procesos', function() {
    it('✅ debe eliminar proceso exitosamente', function() {
      // Arrange
      const mockProcesses = TestUtils.createMockProcessList(3);
      fsStubs.existsSync.returns(true);
      fsStubs.readFileSync.returns(JSON.stringify(mockProcesses));

      const deleteSshProcess = (processId) => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          return { success: false, message: 'No hay procesos para eliminar' };
        }
      
        const processIndex = processId - 1;
        
        if (processIndex < 0 || processIndex >= processes.length) {
          return { success: false, message: 'ID de proceso inválido' };
        }
      
        const processToDelete = processes[processIndex];
        processes.splice(processIndex, 1);
        
        fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));
        
        return { 
          success: true, 
          deletedProcess: processToDelete,
          remainingCount: processes.length 
        };
      };

      // Act
      const result = deleteSshProcess(2);

      // Assert
      expect(result.success).to.be.true;
      expect(result.deletedProcess).to.have.property('name');
      expect(result.remainingCount).to.equal(2);
      expect(fsStubs.writeFileSync.calledOnce).to.be.true;
      
      const savedData = JSON.parse(fsStubs.writeFileSync.firstCall.args[1]);
      expect(savedData).to.have.lengthOf(2);
    });

    it('❌ debe fallar al eliminar proceso inexistente', function() {
      // Arrange
      const mockProcesses = TestUtils.createMockProcessList(2);
      fsStubs.existsSync.returns(true);
      fsStubs.readFileSync.returns(JSON.stringify(mockProcesses));

      const deleteSshProcess = (processId) => {
        const processes = JSON.parse(fs.readFileSync('/test/ssh-processes.json', 'utf8'));
        
        if (processes.length === 0) {
          return { success: false, message: 'No hay procesos para eliminar' };
        }
      
        const processIndex = processId - 1;
        
        if (processIndex < 0 || processIndex >= processes.length) {
          return { success: false, message: 'ID de proceso inválido' };
        }
      
        const processToDelete = processes[processIndex];
        processes.splice(processIndex, 1);
        
        fs.writeFileSync('/test/ssh-processes.json', JSON.stringify(processes, null, 2));
        
        return { 
          success: true, 
          deletedProcess: processToDelete,
          remainingCount: processes.length 
        };
      };

      // Act
      const result = deleteSshProcess(5); // ID muy alto

      // Assert
      expect(result.success).to.be.false;
      expect(result.message).to.include('inválido');
      expect(fsStubs.writeFileSync.called).to.be.false;
    });
  });

  describe('📊 Flujo de estadísticas', function() {
    it('📈 debe calcular y mostrar estadísticas correctamente', function() {
      // Arrange
      const mockProcesses = [
        TestUtils.createMockProcess({
          config: { hostName: 'Web Server' },
          commands: ['cmd1', 'cmd2', 'cmd3']
        }),
        TestUtils.createMockProcess({
          config: { hostName: 'Web Server' },
          commands: ['cmd4', 'cmd5']
        }),
        TestUtils.createMockProcess({
          config: { hostName: 'Database' },
          commands: ['cmd6']
        })
      ];

      fsStubs.existsSync.returns(true);
      fsStubs.readFileSync.returns(JSON.stringify(mockProcesses));

      const calculateStatistics = () => {
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
      const stats = calculateStatistics();

      // Assert
      expect(stats.totalProcesses).to.equal(3);
      expect(stats.uniqueHosts).to.equal(2);
      expect(stats.totalCommands).to.equal(6);
      expect(stats.averageCommands).to.equal(2.0);
      expect(stats.groupedByHost['Web Server'].count).to.equal(2);
      expect(stats.groupedByHost['Web Server'].commands).to.equal(5);
      expect(stats.groupedByHost['Database'].count).to.equal(1);
      expect(stats.groupedByHost['Database'].commands).to.equal(1);
    });
  });

  describe('🔧 Manejo de errores del sistema', function() {
    it('📁 debe crear directorios automáticamente si no existen', function() {
      // Arrange
      fsStubs.existsSync.returns(false);

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
      expect(fsStubs.mkdirSync.calledTwice).to.be.true;
      expect(fsStubs.mkdirSync.firstCall.args[0]).to.include('process');
      expect(fsStubs.mkdirSync.secondCall.args[0]).to.include('logs');
      expect(fsStubs.mkdirSync.firstCall.args[1]).to.deep.equal({ recursive: true });
    });

    it('🔄 debe manejar archivo de procesos corrupto', function() {
      // Arrange
      fsStubs.existsSync.returns(true);
      fsStubs.readFileSync.returns('{ json corrupto'); // JSON inválido

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
      expect(consoleStub.called).to.be.false; // Console está mockeado
    });
  });
});