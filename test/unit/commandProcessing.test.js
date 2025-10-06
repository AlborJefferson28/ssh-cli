// test/unit/commandProcessing.test.js - Tests para procesamiento de comandos
import { expect } from 'chai';
import sinon from 'sinon';

describe('⚙️ Procesamiento de Comandos', function() {

  describe('getShortCommandName()', function() {
    const getShortCommandName = (cmd) => {
      return cmd.trim();
    };

    it('📝 debe retornar comando completo sin modificar', function() {
      const commands = [
        'ls -la',
        'sudo systemctl restart nginx',
        'git pull origin main',
        'npm install --production',
        'docker ps -a --format "table {{.Names}}\\t{{.Status}}"'
      ];

      commands.forEach(cmd => {
        expect(getShortCommandName(cmd)).to.equal(cmd);
      });
    });

    it('🔤 debe trimear espacios en blanco', function() {
      const commandsWithSpaces = [
        '  ls -la  ',
        '\tcd /var/www\t',
        '\nwhoami\n',
        '   sudo systemctl status nginx   '
      ];

      commandsWithSpaces.forEach(cmd => {
        const result = getShortCommandName(cmd);
        expect(result).to.equal(cmd.trim());
        expect(result).to.not.match(/^\s|\s$/); // No espacios al inicio o final
      });
    });

    it('📄 debe manejar comandos vacíos', function() {
      const emptyCommands = ['', '   ', '\t', '\n'];

      emptyCommands.forEach(cmd => {
        expect(getShortCommandName(cmd)).to.equal('');
      });
    });
  });

  describe('Construcción de comandos con contexto de directorio', function() {
    const buildCommandWithContext = (command, currentDirectory) => {
      let fullCommand;
      
      if (command.trim().startsWith('cd ')) {
        const targetDir = command.trim().substring(3).trim();
        let newDirectory;
        
        if (targetDir.startsWith('/')) {
          newDirectory = targetDir;
        } else if (targetDir === '~' || targetDir === '') {
          newDirectory = '~';
        } else {
          newDirectory = currentDirectory === '~' ? `~/${targetDir}` : `${currentDirectory}/${targetDir}`;
        }
        
        fullCommand = `cd ${newDirectory} && pwd`;
        return { fullCommand, newDirectory };
      } else {
        fullCommand = `cd ${currentDirectory} && ${command}`;
        return { fullCommand, newDirectory: currentDirectory };
      }
    };

    it('📁 debe construir comando cd con directorio absoluto', function() {
      // Arrange
      const command = 'cd /var/www/html';
      const currentDirectory = '/home/user';

      // Act
      const result = buildCommandWithContext(command, currentDirectory);

      // Assert
      expect(result.fullCommand).to.equal('cd /var/www/html && pwd');
      expect(result.newDirectory).to.equal('/var/www/html');
    });

    it('📁 debe construir comando cd con directorio relativo', function() {
      // Arrange
      const command = 'cd app';
      const currentDirectory = '/var/www';

      // Act
      const result = buildCommandWithContext(command, currentDirectory);

      // Assert
      expect(result.fullCommand).to.equal('cd /var/www/app && pwd');
      expect(result.newDirectory).to.equal('/var/www/app');
    });

    it('🏠 debe manejar cd al home directory', function() {
      // Arrange
      const command = 'cd ~';
      const currentDirectory = '/var/www';

      // Act
      const result = buildCommandWithContext(command, currentDirectory);

      // Assert
      expect(result.fullCommand).to.equal('cd ~ && pwd');
      expect(result.newDirectory).to.equal('~');
    });

    it('🏠 debe manejar cd desde home directory', function() {
      // Arrange
      const command = 'cd Documents';
      const currentDirectory = '~';

      // Act
      const result = buildCommandWithContext(command, currentDirectory);

      // Assert
      expect(result.fullCommand).to.equal('cd ~/Documents && pwd');
      expect(result.newDirectory).to.equal('~/Documents');
    });

    it('⚙️ debe construir comando normal con contexto', function() {
      // Arrange
      const command = 'ls -la';
      const currentDirectory = '/var/www';

      // Act
      const result = buildCommandWithContext(command, currentDirectory);

      // Assert
      expect(result.fullCommand).to.equal('cd /var/www && ls -la');
      expect(result.newDirectory).to.equal('/var/www');
    });

    it('🔧 debe manejar comando sudo con contexto', function() {
      // Arrange
      const command = 'sudo systemctl restart nginx';
      const currentDirectory = '/etc/nginx';

      // Act
      const result = buildCommandWithContext(command, currentDirectory);

      // Assert
      expect(result.fullCommand).to.equal('cd /etc/nginx && sudo systemctl restart nginx');
      expect(result.newDirectory).to.equal('/etc/nginx');
    });
  });

  describe('Análisis de salida de comandos', function() {
    const analyzeCommandOutput = (output, exitCode) => {
      const analysis = {
        isSuccess: exitCode === 0,
        hasError: exitCode !== 0,
        outputLines: output.split('\\n').length,
        hasStdErr: output.includes('[STDERR]'),
        isEmpty: !output.trim(),
        exitCode
      };

      // Detectar tipos específicos de errores
      if (output.toLowerCase().includes('permission denied')) {
        analysis.errorType = 'PERMISSION_DENIED';
      } else if (output.toLowerCase().includes('command not found')) {
        analysis.errorType = 'COMMAND_NOT_FOUND';
      } else if (output.toLowerCase().includes('no such file or directory')) {
        analysis.errorType = 'FILE_NOT_FOUND';
      } else if (exitCode !== 0) {
        analysis.errorType = 'UNKNOWN_ERROR';
      }

      return analysis;
    };

    it('✅ debe analizar salida exitosa', function() {
      // Arrange
      const output = 'Service started successfully\\nStatus: active';
      const exitCode = 0;

      // Act
      const analysis = analyzeCommandOutput(output, exitCode);

      // Assert
      expect(analysis.isSuccess).to.be.true;
      expect(analysis.hasError).to.be.false;
      expect(analysis.outputLines).to.equal(2);
      expect(analysis.hasStdErr).to.be.false;
      expect(analysis.isEmpty).to.be.false;
      expect(analysis.errorType).to.be.undefined;
    });

    it('❌ debe analizar error de permisos', function() {
      // Arrange
      const output = 'Permission denied: cannot access file';
      const exitCode = 1;

      // Act
      const analysis = analyzeCommandOutput(output, exitCode);

      // Assert
      expect(analysis.isSuccess).to.be.false;
      expect(analysis.hasError).to.be.true;
      expect(analysis.errorType).to.equal('PERMISSION_DENIED');
    });

    it('❌ debe analizar comando no encontrado', function() {
      // Arrange
      const output = 'bash: unknowncommand: command not found';
      const exitCode = 127;

      // Act
      const analysis = analyzeCommandOutput(output, exitCode);

      // Assert
      expect(analysis.errorType).to.equal('COMMAND_NOT_FOUND');
      expect(analysis.hasError).to.be.true;
    });

    it('❌ debe analizar archivo no encontrado', function() {
      // Arrange
      const output = 'cat: /nonexistent/file: No such file or directory';
      const exitCode = 1;

      // Act
      const analysis = analyzeCommandOutput(output, exitCode);

      // Assert
      expect(analysis.errorType).to.equal('FILE_NOT_FOUND');
    });

    it('🔍 debe detectar stderr en la salida', function() {
      // Arrange
      const output = 'Normal output\\n[STDERR] Error message';
      const exitCode = 0;

      // Act
      const analysis = analyzeCommandOutput(output, exitCode);

      // Assert
      expect(analysis.hasStdErr).to.be.true;
    });

    it('📄 debe manejar salida vacía', function() {
      // Arrange
      const output = '';
      const exitCode = 0;

      // Act
      const analysis = analyzeCommandOutput(output, exitCode);

      // Assert
      expect(analysis.isEmpty).to.be.true;
      expect(analysis.outputLines).to.equal(1); // split devuelve array con un elemento vacío
    });
  });

  describe('Formateo de progreso de comandos', function() {
    const formatCommandProgress = (commandList, currentIndex, taskStatuses) => {
      const progress = {
        total: commandList.length,
        current: currentIndex + 1,
        percentage: Math.round(((currentIndex + 1) / commandList.length) * 100),
        completed: taskStatuses.filter(status => status === '✅').length,
        failed: taskStatuses.filter(status => status === '❌').length,
        skipped: taskStatuses.filter(status => status === '⏭️').length,
        pending: taskStatuses.filter(status => status === '⏳').length
      };

      progress.formattedProgress = `${progress.current}/${progress.total} (${progress.percentage}%)`;
      
      return progress;
    };

    it('📊 debe calcular progreso correctamente', function() {
      // Arrange
      const commandList = ['cmd1', 'cmd2', 'cmd3', 'cmd4', 'cmd5'];
      const currentIndex = 2; // Ejecutando comando 3
      const taskStatuses = ['✅', '✅', '⏳', '⏳', '⏳'];

      // Act
      const progress = formatCommandProgress(commandList, currentIndex, taskStatuses);

      // Assert
      expect(progress.total).to.equal(5);
      expect(progress.current).to.equal(3);
      expect(progress.percentage).to.equal(60);
      expect(progress.completed).to.equal(2);
      expect(progress.failed).to.equal(0);
      expect(progress.skipped).to.equal(0);
      expect(progress.pending).to.equal(3);
      expect(progress.formattedProgress).to.equal('3/5 (60%)');
    });

    it('📊 debe manejar comandos fallidos y omitidos', function() {
      // Arrange
      const commandList = ['cmd1', 'cmd2', 'cmd3', 'cmd4'];
      const currentIndex = 3;
      const taskStatuses = ['✅', '❌', '⏭️', '⏳'];

      // Act
      const progress = formatCommandProgress(commandList, currentIndex, taskStatuses);

      // Assert
      expect(progress.completed).to.equal(1);
      expect(progress.failed).to.equal(1);
      expect(progress.skipped).to.equal(1);
      expect(progress.pending).to.equal(1);
      expect(progress.percentage).to.equal(100);
    });

    it('📊 debe manejar proceso completado', function() {
      // Arrange
      const commandList = ['cmd1', 'cmd2'];
      const currentIndex = 1;
      const taskStatuses = ['✅', '✅'];

      // Act
      const progress = formatCommandProgress(commandList, currentIndex, taskStatuses);

      // Assert
      expect(progress.percentage).to.equal(100);
      expect(progress.completed).to.equal(2);
      expect(progress.pending).to.equal(0);
    });
  });

  describe('Generación de logs de comandos', function() {
    const generateCommandLog = (command, output, exitCode, duration, directory) => {
      const timestamp = new Date().toISOString();
      
      const logEntry = {
        timestamp,
        command,
        directory,
        output,
        exitCode,
        duration,
        status: exitCode === 0 ? 'SUCCESS' : 'FAILED'
      };

      const formattedLog = [
        `\\n=== COMANDO: ${command} ===`,
        `DIRECTORIO ACTUAL: ${directory}`,
        `TIMESTAMP: ${timestamp}`,
        `DURACIÓN: ${duration}ms`,
        output,
        `=== FIN COMANDO (código: ${exitCode}) ===\\n`
      ].join('\\n');

      return { logEntry, formattedLog };
    };

    it('📝 debe generar log para comando exitoso', function() {
      // Arrange
      const command = 'ls -la';
      const output = 'total 0\\ndrwxr-xr-x 2 user user 4096 Oct  6 10:00 .';
      const exitCode = 0;
      const duration = 150;
      const directory = '/home/user';

      // Act
      const result = generateCommandLog(command, output, exitCode, duration, directory);

      // Assert
      expect(result.logEntry.command).to.equal(command);
      expect(result.logEntry.status).to.equal('SUCCESS');
      expect(result.logEntry.exitCode).to.equal(0);
      expect(result.logEntry.duration).to.equal(150);
      expect(result.formattedLog).to.include('=== COMANDO: ls -la ===');
      expect(result.formattedLog).to.include('DIRECTORIO ACTUAL: /home/user');
      expect(result.formattedLog).to.include('DURACIÓN: 150ms');
    });

    it('📝 debe generar log para comando fallido', function() {
      // Arrange
      const command = 'nonexistent-command';
      const output = 'command not found';
      const exitCode = 127;
      const duration = 50;
      const directory = '/tmp';

      // Act
      const result = generateCommandLog(command, output, exitCode, duration, directory);

      // Assert
      expect(result.logEntry.status).to.equal('FAILED');
      expect(result.logEntry.exitCode).to.equal(127);
      expect(result.formattedLog).to.include('=== FIN COMANDO (código: 127) ===');
    });

    it('📝 debe incluir timestamp válido', function() {
      // Arrange
      const command = 'pwd';
      const output = '/home/user';
      const exitCode = 0;
      const duration = 25;
      const directory = '/home/user';

      // Act
      const result = generateCommandLog(command, output, exitCode, duration, directory);

      // Assert
      expect(result.logEntry.timestamp).to.match(/^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d{3}Z$/);
      expect(new Date(result.logEntry.timestamp)).to.be.instanceOf(Date);
    });
  });
});