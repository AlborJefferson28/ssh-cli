// test/unit/validation.test.js - Tests para validaciones del CLI
import { expect } from 'chai';

describe('✅ Validaciones del CLI', function() {
  
  describe('Validación de Host', function() {
    const validateHost = (input) => {
      if (!input.trim()) return "El host es obligatorio";
      const hostRegex = /^[a-zA-Z0-9.-]+$/;
      if (!hostRegex.test(input.trim())) {
        return "Formato de host inválido. Usa solo letras, números, puntos y guiones.";
      }
      return true;
    };

    it('✅ debe validar hosts válidos', function() {
      const validHosts = [
        'example.com',
        'server.example.com',
        'sub.domain.com',
        '192.168.1.1',
        'localhost',
        'server-01',
        'server.test-domain.com'
      ];

      validHosts.forEach(host => {
        expect(validateHost(host)).to.be.true;
      });
    });

    it('❌ debe rechazar hosts inválidos', function() {
      const invalidHosts = [
        '',
        '   ',
        'server with spaces',
        'server@domain.com',
        'server/path',
        'server:port',
        'server#anchor',
        'server?query=value'
      ];

      invalidHosts.forEach(host => {
        const result = validateHost(host);
        expect(result).to.be.a('string').and.not.equal('true');
      });
    });

    it('🔤 debe trimear espacios en hosts válidos', function() {
      const hostsWithSpaces = [
        '  example.com  ',
        '\tserver.com\t',
        '\nhost.com\n'
      ];

      hostsWithSpaces.forEach(host => {
        expect(validateHost(host)).to.be.true;
      });
    });
  });

  describe('Validación de Puerto', function() {
    const validatePort = (input) => {
      if (!input || input.trim() === '') {
        return "Puerto inválido. Debe ser un número entre 1 y 65535.";
      }
      // Verificar que sea un número entero válido (sin decimales)
      if (!/^\d+$/.test(input.trim())) {
        return "Puerto inválido. Debe ser un número entre 1 y 65535.";
      }
      const port = parseInt(input, 10);
      if (isNaN(port) || port < 1 || port > 65535) {
        return "Puerto inválido. Debe ser un número entre 1 y 65535.";
      }
      return true;
    };

    it('✅ debe validar puertos válidos', function() {
      const validPorts = [
        '22',
        '80',
        '443',
        '3000',
        '8080',
        '65535',
        '1'
      ];

      validPorts.forEach(port => {
        expect(validatePort(port)).to.be.true;
      });
    });

    it('❌ debe rechazar puertos inválidos', function() {
      const invalidPorts = [
        '0',
        '-1',
        '65536',
        '99999',
        'abc',
        '',
        '22.5',
        '22a'
      ];

      invalidPorts.forEach(port => {
        const result = validatePort(port);
        expect(result).to.be.a('string').and.include('Puerto inválido');
      });
    });

    it('🔢 debe manejar números como strings', function() {
      expect(validatePort('22')).to.be.true;
      expect(validatePort('443')).to.be.true;
    });
  });

  describe('Validación de Nombre de Host', function() {
    const validateHostName = (input) => {
      if (!input.trim()) return "El nombre del host es obligatorio";
      if (input.trim().length < 3) return "El nombre debe tener al menos 3 caracteres";
      return true;
    };

    it('✅ debe validar nombres de host válidos', function() {
      const validNames = [
        'Servidor Web',
        'Base de Datos',
        'API Server',
        'Producción',
        'Testing Environment',
        'Development-01'
      ];

      validNames.forEach(name => {
        expect(validateHostName(name)).to.be.true;
      });
    });

    it('❌ debe rechazar nombres muy cortos', function() {
      const shortNames = [
        '',
        '  ',
        'AB',
        'X',
        '12'
      ];

      shortNames.forEach(name => {
        const result = validateHostName(name);
        expect(result).to.be.a('string');
        if (name.trim().length === 0) {
          expect(result).to.include('obligatorio');
        } else {
          expect(result).to.include('al menos 3 caracteres');
        }
      });
    });

    it('🔤 debe trimear y validar correctamente', function() {
      expect(validateHostName('   ABC   ')).to.be.true;
      expect(validateHostName('  AB  ')).to.include('al menos 3 caracteres');
    });
  });

  describe('Validación de Usuario SSH', function() {
    const validateUsername = (input) => {
      return input.trim() ? true : "El usuario es obligatorio";
    };

    it('✅ debe validar usuarios válidos', function() {
      const validUsers = [
        'root',
        'ubuntu',
        'deploy',
        'admin',
        'user123',
        'service-account'
      ];

      validUsers.forEach(user => {
        expect(validateUsername(user)).to.be.true;
      });
    });

    it('❌ debe rechazar usuarios vacíos', function() {
      const emptyUsers = [
        '',
        '   ',
        '\t',
        '\n'
      ];

      emptyUsers.forEach(user => {
        const result = validateUsername(user);
        expect(result).to.include('obligatorio');
      });
    });
  });

  describe('Validación de Contraseña', function() {
    const validatePassword = (input) => {
      return input.trim() ? true : "La contraseña es obligatoria";
    };

    it('✅ debe validar contraseñas válidas', function() {
      const validPasswords = [
        'password123',
        'ComplexP@ssw0rd!',
        'simple',
        '123456'
      ];

      validPasswords.forEach(password => {
        expect(validatePassword(password)).to.be.true;
      });
    });

    it('❌ debe rechazar contraseñas vacías', function() {
      const emptyPasswords = [
        '',
        '   ',
        '\t',
        '\n'
      ];

      emptyPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result).to.include('obligatoria');
      });
    });
  });

  describe('Validación de Comandos', function() {
    const validateCommand = (input) => {
      if (!input.trim()) return "El comando no puede estar vacío";
      return true;
    };

    it('✅ debe validar comandos válidos', function() {
      const validCommands = [
        'ls -la',
        'cd /var/www',
        'sudo systemctl restart nginx',
        'git pull origin main',
        'npm install --production',
        'docker ps -a'
      ];

      validCommands.forEach(command => {
        expect(validateCommand(command)).to.be.true;
      });
    });

    it('❌ debe rechazar comandos vacíos', function() {
      const emptyCommands = [
        '',
        '   ',
        '\t',
        '\n'
      ];

      emptyCommands.forEach(command => {
        const result = validateCommand(command);
        expect(result).to.include('vacío');
      });
    });
  });

  describe('Validación de IDs de Proceso', function() {
    const validateProcessId = (input, maxProcesses) => {
      if (!input || input.trim() === '') {
        return "ID de proceso inválido. Debe ser un número mayor a 0.";
      }
      // Verificar que sea un número entero válido (sin decimales)
      if (!/^\d+$/.test(input.trim())) {
        return "ID de proceso inválido. Debe ser un número mayor a 0.";
      }
      const id = parseInt(input, 10);
      if (isNaN(id) || id <= 0) {
        return "ID de proceso inválido. Debe ser un número mayor a 0.";
      }
      if (id > maxProcesses) {
        return `ID de proceso inválido. Solo hay ${maxProcesses} proceso(s) disponible(s).`;
      }
      return true;
    };

    it('✅ debe validar IDs válidos', function() {
      const maxProcesses = 5;
      const validIds = ['1', '2', '3', '4', '5'];

      validIds.forEach(id => {
        expect(validateProcessId(id, maxProcesses)).to.be.true;
      });
    });

    it('❌ debe rechazar IDs inválidos', function() {
      const maxProcesses = 3;
      const invalidIds = [
        '0',
        '-1',
        '4', // Mayor que maxProcesses
        '10',
        'abc',
        '',
        '1.5'
      ];

      invalidIds.forEach(id => {
        const result = validateProcessId(id, maxProcesses);
        expect(result).to.be.a('string').and.include('inválido');
      });
    });
  });

  describe('Validación de Host ID y Posición', function() {
    const validateHostIdAndPosition = (hostId, position, hostEntries) => {
      const hostIdNum = parseInt(hostId);
      const positionNum = parseInt(position);

      if (isNaN(hostIdNum) || hostIdNum <= 0) {
        return {
          valid: false,
          message: "ID de host inválido. Debe ser un número mayor a 0."
        };
      }

      const hostIndex = hostIdNum - 1;
      if (hostIndex < 0 || hostIndex >= hostEntries.length) {
        return {
          valid: false,
          message: `No se encontró el host con ID "${hostIdNum}". Hay ${hostEntries.length} host(s) disponible(s).`
        };
      }

      if (isNaN(positionNum) || positionNum <= 0) {
        return {
          valid: false,
          message: "Posición inválida. Debe ser un número mayor a 0."
        };
      }

      const [hostName, hostProcesses] = hostEntries[hostIndex];
      const processIndex = positionNum - 1;

      if (processIndex < 0 || processIndex >= hostProcesses.length) {
        return {
          valid: false,
          message: `Posición inválida para el host ID "${hostIdNum}" (${hostName}). El host "${hostName}" tiene ${hostProcesses.length} proceso(s).`
        };
      }

      return { valid: true };
    };

    it('✅ debe validar host ID y posición válidos', function() {
      // Arrange
      const hostEntries = [
        ['Servidor Web', [{ name: 'Deploy Frontend' }, { name: 'Deploy Backend' }]],
        ['Base de Datos', [{ name: 'Backup' }]]
      ];

      // Act & Assert
      expect(validateHostIdAndPosition('1', '1', hostEntries).valid).to.be.true;
      expect(validateHostIdAndPosition('1', '2', hostEntries).valid).to.be.true;
      expect(validateHostIdAndPosition('2', '1', hostEntries).valid).to.be.true;
    });

    it('❌ debe rechazar host ID inválido', function() {
      // Arrange
      const hostEntries = [
        ['Servidor Web', [{ name: 'Deploy' }]]
      ];

      // Act
      const result = validateHostIdAndPosition('2', '1', hostEntries);

      // Assert
      expect(result.valid).to.be.false;
      expect(result.message).to.include('No se encontró el host con ID "2"');
    });

    it('❌ debe rechazar posición inválida', function() {
      // Arrange
      const hostEntries = [
        ['Servidor Web', [{ name: 'Deploy' }]]
      ];

      // Act
      const result = validateHostIdAndPosition('1', '2', hostEntries);

      // Assert
      expect(result.valid).to.be.false;
      expect(result.message).to.include('Posición inválida para el host ID "1"');
    });

    it('❌ debe rechazar valores no numéricos', function() {
      // Arrange
      const hostEntries = [
        ['Servidor Web', [{ name: 'Deploy' }]]
      ];

      // Act
      const result1 = validateHostIdAndPosition('abc', '1', hostEntries);
      const result2 = validateHostIdAndPosition('1', 'xyz', hostEntries);

      // Assert
      expect(result1.valid).to.be.false;
      expect(result1.message).to.include('ID de host inválido');
      expect(result2.valid).to.be.false;
      expect(result2.message).to.include('Posición inválida');
    });
  });
});