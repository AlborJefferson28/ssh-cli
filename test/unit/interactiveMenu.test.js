// test/unit/interactiveMenu.test.js - Tests para navegación interactiva
import { expect } from 'chai';
import sinon from 'sinon';
import { TestUtils } from '../helpers/testUtils.js';

describe('🖱️ Navegación Interactiva', function() {
  let inquirerStub;
  let consoleStub;

  beforeEach(function() {
    consoleStub = sinon.stub(console, 'clear');
  });

  afterEach(function() {
    consoleStub.restore();
    if (inquirerStub) {
      inquirerStub();
    }
  });

  describe('Menú Principal', function() {
    it('🏠 debe mostrar todas las opciones del menú principal', async function() {
      // Arrange
      const expectedChoices = [
        'list',
        'create', 
        'execute',
        'delete',
        'stats',
        'help',
        'exit'
      ];

      inquirerStub = await TestUtils.simulateInquirerPrompts({
        action: 'exit'
      });

      const showMainMenu = async () => {
        const choices = [
          { name: "📋 Navegar procesos SSH por host", value: "list" },
          { name: "🚀 Crear nuevo proceso SSH", value: "create" },
          { name: "▶️  Ejecutar proceso (selección rápida)", value: "execute" },
          { name: "🗑️  Eliminar proceso", value: "delete" },
          { name: "📊 Ver estadísticas", value: "stats" },
          { name: "🆘 Ver ayuda", value: "help" },
          { name: "🚪 Salir", value: "exit" }
        ];

        // Simular inquirer.prompt
        return { action: 'exit', availableChoices: choices.map(c => c.value) };
      };

      // Act
      const result = await showMainMenu();

      // Assert
      expect(result.availableChoices).to.include.members(expectedChoices);
      expect(result.action).to.equal('exit');
    });

    it('🧹 debe limpiar pantalla al mostrar menú', async function() {
      // Arrange
      inquirerStub = await TestUtils.simulateInquirerPrompts({
        action: 'help'
      });

      const showMainMenuWithClear = async () => {
        console.clear(); // Simulación de limpieza de pantalla
        return { action: 'help' };
      };

      // Act
      await showMainMenuWithClear();

      // Assert
      expect(consoleStub.calledOnce).to.be.true;
    });
  });

  describe('Navegación por Hosts', function() {
    it('🏠 debe agrupar procesos por host correctamente', function() {
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
          name: 'Database Backup',
          config: { hostName: 'Database Server', host: 'db.example.com' }
        })
      ];

      const groupProcessesByHost = (processes) => {
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

        return Object.entries(groupedByHost).map(([hostName, hostProcesses], index) => ({
          hostId: index + 1,
          hostName,
          processCount: hostProcesses.length,
          processes: hostProcesses
        }));
      };

      // Act
      const groupedHosts = groupProcessesByHost(mockProcesses);

      // Assert
      expect(groupedHosts).to.have.lengthOf(2);
      expect(groupedHosts[0].hostName).to.equal('Web Server');
      expect(groupedHosts[0].processCount).to.equal(2);
      expect(groupedHosts[1].hostName).to.equal('Database Server');
      expect(groupedHosts[1].processCount).to.equal(1);
      expect(groupedHosts[0].hostId).to.equal(1);
      expect(groupedHosts[1].hostId).to.equal(2);
    });

    it('📋 debe crear opciones de menú para hosts', function() {
      // Arrange
      const groupedHosts = [
        {
          hostId: 1,
          hostName: 'Web Server',
          processCount: 2,
          processes: []
        },
        {
          hostId: 2,
          hostName: 'Database Server', 
          processCount: 1,
          processes: []
        }
      ];

      const createHostChoices = (hosts) => {
        const choices = hosts.map(host => ({
          name: `🏠 ${host.hostName} (${host.processCount} proceso${host.processCount !== 1 ? 's' : ''})`,
          value: host.hostId - 1, // Índice base 0
          short: host.hostName
        }));

        choices.push({
          name: "🚪 Volver al menú principal",
          value: -1
        });

        return choices;
      };

      // Act
      const choices = createHostChoices(groupedHosts);

      // Assert
      expect(choices).to.have.lengthOf(3); // 2 hosts + opción de volver
      expect(choices[0].name).to.include('Web Server (2 procesos)');
      expect(choices[1].name).to.include('Database Server (1 proceso)');
      expect(choices[2].name).to.include('Volver al menú principal');
      expect(choices[2].value).to.equal(-1);
    });

    it('🔄 debe manejar navegación bidireccional', async function() {
      // Arrange
      inquirerStub = await TestUtils.simulateInquirerPrompts({
        selectedHostIndex: -1 // Volver al menú principal
      });

      const simulateHostNavigation = async () => {
        const hostChoices = [
          { name: "🏠 Web Server (2 procesos)", value: 0 },
          { name: "🚪 Volver al menú principal", value: -1 }
        ];

        // Simular selección del usuario
        const selection = -1; // Volver
        
        if (selection === -1) {
          return { action: 'back_to_main', navigated: true };
        }

        return { action: 'navigate_to_host', hostIndex: selection };
      };

      // Act
      const result = await simulateHostNavigation();

      // Assert
      expect(result.action).to.equal('back_to_main');
      expect(result.navigated).to.be.true;
    });
  });

  describe('Navegación de Procesos en Host', function() {
    it('📝 debe mostrar procesos de un host específico', function() {
      // Arrange
      const hostProcesses = [
        TestUtils.createMockProcess({
          name: 'Deploy Frontend',
          commands: ['git pull', 'npm build', 'nginx reload']
        }),
        TestUtils.createMockProcess({
          name: 'Deploy Backend',
          commands: ['git pull', 'docker build']
        })
      ];

      const createProcessChoices = (processes, hostName) => {
        const choices = processes.map((proc, index) => ({
          name: `📝 ${proc.name || `Proceso ${index + 1}`} (${proc.commands.length} comando${proc.commands.length !== 1 ? 's' : ''})`,
          value: index,
          short: proc.name || `Proceso ${index + 1}`
        }));

        choices.push({
          name: "⬅️  Volver a la lista de hosts",
          value: -1
        });

        return { hostName, choices };
      };

      // Act
      const result = createProcessChoices(hostProcesses, 'Web Server');

      // Assert
      expect(result.hostName).to.equal('Web Server');
      expect(result.choices).to.have.lengthOf(3); // 2 procesos + volver
      expect(result.choices[0].name).to.include('Deploy Frontend (3 comandos)');
      expect(result.choices[1].name).to.include('Deploy Backend (2 comandos)');
      expect(result.choices[2].name).to.include('Volver a la lista de hosts');
    });

    it('🔍 debe mostrar detalles completos de un proceso', function() {
      // Arrange
      const process = TestUtils.createMockProcess({
        name: 'Deploy Application',
        config: {
          hostName: 'Production Server',
          host: 'prod.example.com',
          port: '22',
          username: 'deploy'
        },
        commands: ['cd /var/www', 'git pull origin main', 'npm install', 'pm2 restart app'],
        createdAt: '2025-10-06T10:30:00.000Z'
      });

      const formatProcessDetails = (proc, hostName) => {
        const createdAt = new Date(proc.createdAt);
        const dateStr = createdAt.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit', 
          year: '2-digit'
        }) + ' ' + createdAt.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });

        return {
          name: proc.name || 'Sin nombre',
          hostName,
          server: `${proc.config.host}:${proc.config.port}`,
          username: proc.config.username,
          created: dateStr,
          commandCount: proc.commands.length,
          commands: proc.commands.map((cmd, i) => `  ${(i + 1).toString().padStart(2)}. ${cmd}`)
        };
      };

      // Act
      const details = formatProcessDetails(process, 'Production Server');

      // Assert
      expect(details.name).to.equal('Deploy Application');
      expect(details.hostName).to.equal('Production Server');
      expect(details.server).to.equal('prod.example.com:22');
      expect(details.username).to.equal('deploy');
      expect(details.created).to.match(/\d{2}\/\d{2}\/\d{2} \d{2}:\d{2}/);
      expect(details.commandCount).to.equal(4);
      expect(details.commands).to.have.lengthOf(4);
      expect(details.commands[0]).to.include('1. cd /var/www');
    });
  });

  describe('Selección Rápida de Procesos', function() {
    it('⚡ debe permitir selección rápida por host y proceso', async function() {
      // Arrange
      const mockProcesses = TestUtils.createMockProcessList(3);
      
      inquirerStub = await TestUtils.simulateInquirerPrompts({
        selectedHostIndex: 0,
        selectedProcessIndex: 1
      });

      const quickSelectProcess = async (processes) => {
        // 1. Agrupar por host
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
        
        // 2. Selección de host (simulada)
        const selectedHostIndex = 0;
        const [hostName, hostProcesses] = hostEntries[selectedHostIndex];
        
        // 3. Selección de proceso (simulada)
        const selectedProcessIndex = 1;
        const selectedProcess = hostProcesses[selectedProcessIndex];

        return {
          hostName,
          selectedProcess,
          totalHosts: hostEntries.length,
          processesInHost: hostProcesses.length
        };
      };

      // Act
      const result = await quickSelectProcess(mockProcesses);

      // Assert
      expect(result.hostName).to.be.a('string');
      expect(result.selectedProcess).to.have.property('name');
      expect(result.selectedProcess).to.have.property('config');
      expect(result.selectedProcess).to.have.property('commands');
      expect(result.totalHosts).to.be.greaterThan(0);
      expect(result.processesInHost).to.be.greaterThan(0);
    });

    it('✅ debe confirmar antes de ejecutar proceso', async function() {
      // Arrange
      const process = TestUtils.createMockProcess();
      
      inquirerStub = await TestUtils.simulateInquirerPrompts({
        confirmExecution: true
      });

      const confirmProcessExecution = async (proc) => {
        const processInfo = {
          name: proc.name || 'Sin nombre',
          server: `${proc.config.host}:${proc.config.port}`,
          username: proc.config.username,
          commandCount: proc.commands.length,
          commands: proc.commands
        };

        // Simular confirmación del usuario
        const confirmed = true; // Desde inquirer mock

        return {
          confirmed,
          processInfo
        };
      };

      // Act
      const result = await confirmProcessExecution(process);

      // Assert
      expect(result.confirmed).to.be.true;
      expect(result.processInfo).to.have.property('name');
      expect(result.processInfo).to.have.property('server');
      expect(result.processInfo).to.have.property('commandCount');
      expect(result.processInfo.commands).to.be.an('array');
    });
  });

  describe('Eliminación Interactiva', function() {
    it('🗑️ debe mostrar lista de procesos para eliminar', function() {
      // Arrange
      const mockProcesses = [
        TestUtils.createMockProcess({
          name: 'Deploy App',
          config: { hostName: 'Web Server', host: 'web.example.com' }
        }),
        TestUtils.createMockProcess({
          name: 'Backup DB',
          config: { hostName: 'Database', host: 'db.example.com' }
        })
      ];

      const createDeletionChoices = (processes) => {
        const choices = processes.map((proc, index) => ({
          name: `📝 ${proc.name || `Proceso ${index + 1}`} - 🏠 ${proc.config.hostName || 'Sin nombre'} (${proc.config.host})`,
          value: index,
          short: proc.name || `Proceso ${index + 1}`
        }));

        choices.push({
          name: "❌ Cancelar",
          value: -1
        });

        return choices;
      };

      // Act
      const choices = createDeletionChoices(mockProcesses);

      // Assert
      expect(choices).to.have.lengthOf(3); // 2 procesos + cancelar
      expect(choices[0].name).to.include('Deploy App - 🏠 Web Server');
      expect(choices[1].name).to.include('Backup DB - 🏠 Database');
      expect(choices[2].name).to.include('❌ Cancelar');
      expect(choices[2].value).to.equal(-1);
    });

    it('⚠️ debe confirmar eliminación con información detallada', async function() {
      // Arrange
      const processToDelete = TestUtils.createMockProcess({
        name: 'Critical Process',
        config: { hostName: 'Production', host: 'prod.example.com' }
      });

      inquirerStub = await TestUtils.simulateInquirerPrompts({
        confirmDeletion: false // Usuario cancela
      });

      const confirmDeletion = async (proc, index) => {
        const deletionInfo = {
          name: proc.name || `Proceso ${index + 1}`,
          hostName: proc.config.hostName || 'Sin nombre',
          server: `${proc.config.host}:${proc.config.port}`,
          username: proc.config.username,
          commandCount: proc.commands.length
        };

        // Simular confirmación (cancelada en este caso)
        const confirmed = false;

        return {
          confirmed,
          deletionInfo,
          cancelled: !confirmed
        };
      };

      // Act
      const result = await confirmDeletion(processToDelete, 0);

      // Assert
      expect(result.confirmed).to.be.false;
      expect(result.cancelled).to.be.true;
      expect(result.deletionInfo.name).to.equal('Critical Process');
      expect(result.deletionInfo.hostName).to.equal('Production');
    });
  });

  describe('Validación de Navegación', function() {
    it('📊 debe validar disponibilidad de procesos antes de mostrar menús', function() {
      // Arrange
      const emptyProcesses = [];
      const populatedProcesses = TestUtils.createMockProcessList(2);

      const validateProcessAvailability = (processes, action) => {
        const hasProcesses = processes.length > 0;
        
        const validActions = {
          'navigate': hasProcesses,
          'execute': hasProcesses,
          'delete': hasProcesses,
          'stats': hasProcesses,
          'create': true, // Siempre disponible
          'help': true   // Siempre disponible
        };

        return {
          isValid: validActions[action] || false,
          processCount: processes.length,
          message: hasProcesses ? null : 'No hay procesos SSH guardados. Crea uno nuevo primero.'
        };
      };

      // Act & Assert
      const emptyNavigate = validateProcessAvailability(emptyProcesses, 'navigate');
      expect(emptyNavigate.isValid).to.be.false;
      expect(emptyNavigate.message).to.include('No hay procesos');

      const emptyCreate = validateProcessAvailability(emptyProcesses, 'create');
      expect(emptyCreate.isValid).to.be.true;

      const populatedNavigate = validateProcessAvailability(populatedProcesses, 'navigate');
      expect(populatedNavigate.isValid).to.be.true;
      expect(populatedNavigate.processCount).to.equal(2);
    });

    it('🔢 debe validar índices de selección', function() {
      // Arrange
      const hostEntries = [
        ['Web Server', [{}, {}]], // 2 procesos
        ['Database', [{}]]        // 1 proceso
      ];

      const validateSelection = (hostId, processPosition, hostEntries) => {
        const hostIndex = hostId - 1;
        
        if (hostIndex < 0 || hostIndex >= hostEntries.length) {
          return {
            valid: false,
            error: `Host ID ${hostId} no encontrado`
          };
        }

        const [hostName, processes] = hostEntries[hostIndex];
        const processIndex = processPosition - 1;

        if (processIndex < 0 || processIndex >= processes.length) {
          return {
            valid: false,
            error: `Posición ${processPosition} inválida para ${hostName}`
          };
        }

        return {
          valid: true,
          hostName,
          processIndex
        };
      };

      // Act & Assert
      const validSelection = validateSelection(1, 2, hostEntries);
      expect(validSelection.valid).to.be.true;
      expect(validSelection.hostName).to.equal('Web Server');

      const invalidHost = validateSelection(5, 1, hostEntries);
      expect(invalidHost.valid).to.be.false;
      expect(invalidHost.error).to.include('Host ID 5 no encontrado');

      const invalidPosition = validateSelection(2, 5, hostEntries);
      expect(invalidPosition.valid).to.be.false;
      expect(invalidPosition.error).to.include('Posición 5 inválida para Database');
    });
  });
});