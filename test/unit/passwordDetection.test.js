// test/unit/passwordDetection.test.js - Tests para detección de contraseñas y prompts
import { expect } from 'chai';
import sinon from 'sinon';

describe('🔐 Detección de Contraseñas y Prompts', function() {
  
  describe('detectPasswordPrompt()', function() {
    const detectPasswordPrompt = (data) => {
      const str = data.toString().toLowerCase();
      
      const passwordPatterns = [
        /password.*:/i,
        /contraseña.*:/i,
        /\[sudo\].*password/i,
        /password for/i,
        /enter.*password/i,
        /sudo.*password/i,
        /authentication.*password/i,
        /password.*required/i,
        /please.*enter.*password/i,
        /\[sudo\]/i,
        /password\?/i,
        /enter.*passphrase/i,
        /passphrase.*for/i,
        /sorry.*try.*again/i
      ];
      
      return passwordPatterns.some(pattern => pattern.test(str));
    };

    it('🔐 debe detectar prompt sudo estándar', function() {
      // Arrange
      const sudoPrompt = '[sudo] password for user:';

      // Act
      const result = detectPasswordPrompt(sudoPrompt);

      // Assert
      expect(result).to.be.true;
    });

    it('🔐 debe detectar prompt de contraseña en español', function() {
      // Arrange
      const spanishPrompt = 'Contraseña:';

      // Act
      const result = detectPasswordPrompt(spanishPrompt);

      // Assert
      expect(result).to.be.true;
    });

    it('🔐 debe detectar prompt de MySQL', function() {
      // Arrange
      const mysqlPrompt = 'Enter password:';

      // Act
      const result = detectPasswordPrompt(mysqlPrompt);

      // Assert
      expect(result).to.be.true;
    });

    it('🔐 debe detectar prompt SSH', function() {
      // Arrange
      const sshPrompt = 'user@host password:';

      // Act
      const result = detectPasswordPrompt(sshPrompt);

      // Assert
      expect(result).to.be.true;
    });

    it('🔐 debe detectar prompt con pregunta', function() {
      // Arrange
      const questionPrompt = 'Password?';

      // Act
      const result = detectPasswordPrompt(questionPrompt);

      // Assert
      expect(result).to.be.true;
    });

    it('🔐 debe detectar passphrase', function() {
      // Arrange
      const passphrasePrompt = 'Enter passphrase for key:';

      // Act
      const result = detectPasswordPrompt(passphrasePrompt);

      // Assert
      expect(result).to.be.true;
    });

    it('🔐 debe detectar intento fallido', function() {
      // Arrange
      const failedPrompt = 'Sorry, try again.';

      // Act
      const result = detectPasswordPrompt(failedPrompt);

      // Assert
      expect(result).to.be.true;
    });

    it('❌ no debe detectar texto normal', function() {
      // Arrange
      const normalText = 'Loading application...';

      // Act
      const result = detectPasswordPrompt(normalText);

      // Assert
      expect(result).to.be.false;
    });

    it('❌ no debe detectar comando con password', function() {
      // Arrange
      const command = 'echo "password123" > file.txt';

      // Act
      const result = detectPasswordPrompt(command);

      // Assert
      expect(result).to.be.false;
    });
  });

  describe('analyzeStreamOutput()', function() {
    const analyzeStreamOutput = (data, command) => {
      const str = data.toString();
      const lowerStr = str.toLowerCase();
      const analysis = {
        isPasswordPrompt: false,
        isSudoPrompt: false,
        isGenericPrompt: false,
        originalData: str,
        confidence: 0
      };
      
      // Detectar prompts de sudo específicamente
      if (command.toLowerCase().includes('sudo')) {
        const sudoPatterns = [
          { pattern: /\[sudo\].*password.*for/i, confidence: 95 },
          { pattern: /password.*for.*sudo/i, confidence: 90 },
          { pattern: /sorry.*try.*again/i, confidence: 85 },
          { pattern: /\[sudo\]/i, confidence: 80 }
        ];
        
        for (const { pattern, confidence } of sudoPatterns) {
          if (pattern.test(str)) {
            analysis.isSudoPrompt = true;
            analysis.confidence = Math.max(analysis.confidence, confidence);
            break;
          }
        }
      }
      
      // Detectar cualquier tipo de solicitud de contraseña
      const passwordPatterns = [
        { pattern: /password.*:/i, confidence: 90 },
        { pattern: /contraseña.*:/i, confidence: 95 },
        { pattern: /enter.*password/i, confidence: 85 },
        { pattern: /password for/i, confidence: 90 },
        { pattern: /authentication.*password/i, confidence: 80 },
        { pattern: /please.*enter.*password/i, confidence: 85 },
        { pattern: /password\?/i, confidence: 75 }
      ];
      
      for (const { pattern, confidence } of passwordPatterns) {
        if (pattern.test(str)) {
          analysis.isPasswordPrompt = true;
          analysis.confidence = Math.max(analysis.confidence, confidence);
          break;
        }
      }
      
      // Detectar otros tipos de prompts interactivos
      const promptPatterns = [
        /\(y\/n\)/i,
        /yes.*no/i,
        /continue\?/i,
        /press.*enter/i,
        /.*\?\s*$/
      ];
      analysis.isGenericPrompt = promptPatterns.some(pattern => pattern.test(str));
      
      return analysis;
    };

    it('🔐 debe analizar prompt sudo con alta confianza', function() {
      // Arrange
      const data = '[sudo] password for user:';
      const command = 'sudo systemctl restart nginx';

      // Act
      const result = analyzeStreamOutput(data, command);

      // Assert
      expect(result.isSudoPrompt).to.be.true;
      expect(result.isPasswordPrompt).to.be.true;
      expect(result.confidence).to.be.at.least(90);
      expect(result.originalData).to.equal(data);
    });

    it('🔐 debe analizar prompt de contraseña con confianza específica', function() {
      // Arrange
      const data = 'password:';
      const command = 'mysql -u root -p';

      // Act
      const result = analyzeStreamOutput(data, command);

      // Assert
      expect(result.isPasswordPrompt).to.be.true;
      expect(result.confidence).to.equal(90);
      expect(result.isSudoPrompt).to.be.false;
    });

    it('🔐 debe detectar prompt en español con alta confianza', function() {
      // Arrange
      const data = 'Contraseña:';
      const command = 'su - root';

      // Act
      const result = analyzeStreamOutput(data, command);

      // Assert
      expect(result.isPasswordPrompt).to.be.true;
      expect(result.confidence).to.equal(95);
    });

    it('🔄 debe detectar prompt genérico y/n', function() {
      // Arrange
      const data = 'Do you want to continue? (y/n)';
      const command = 'apt update';

      // Act
      const result = analyzeStreamOutput(data, command);

      // Assert
      expect(result.isGenericPrompt).to.be.true;
      expect(result.isPasswordPrompt).to.be.false;
      expect(result.isSudoPrompt).to.be.false;
    });

    it('🔄 debe detectar prompt de continuación', function() {
      // Arrange
      const data = 'Press Enter to continue...';
      const command = 'less /var/log/syslog';

      // Act
      const result = analyzeStreamOutput(data, command);

      // Assert
      expect(result.isGenericPrompt).to.be.true;
    });

    it('❌ no debe detectar texto normal como prompt', function() {
      // Arrange
      const data = 'Service started successfully';
      const command = 'systemctl start nginx';

      // Act
      const result = analyzeStreamOutput(data, command);

      // Assert
      expect(result.isPasswordPrompt).to.be.false;
      expect(result.isSudoPrompt).to.be.false;
      expect(result.isGenericPrompt).to.be.false;
      expect(result.confidence).to.equal(0);
    });

    it('🔐 debe priorizar sudo cuando el comando contiene sudo', function() {
      // Arrange
      const data = 'sorry, try again';
      const command = 'sudo rm file.txt';

      // Act
      const result = analyzeStreamOutput(data, command);

      // Assert
      expect(result.isSudoPrompt).to.be.true;
      expect(result.confidence).to.equal(85);
    });
  });

  describe('getCommandSpecificPatterns()', function() {
    const getCommandSpecificPatterns = (command) => {
      const patterns = {
        sudo: [
          { pattern: /\[sudo\]/i, confidence: 90 },
          { pattern: /password.*for/i, confidence: 85 }
        ],
        ssh: [
          { pattern: /password:/i, confidence: 90 },
          { pattern: /authentication/i, confidence: 70 }
        ],
        su: [
          { pattern: /password:/i, confidence: 90 },
          { pattern: /contraseña:/i, confidence: 95 }
        ],
        mysql: [
          { pattern: /enter.*password/i, confidence: 90 }
        ],
        psql: [
          { pattern: /password.*for.*user/i, confidence: 90 }
        ]
      };
      
      for (const [cmd, cmdPatterns] of Object.entries(patterns)) {
        if (command.toLowerCase().includes(cmd)) {
          return cmdPatterns;
        }
      }
      
      return [
        { pattern: /password/i, confidence: 70 },
        { pattern: /contraseña/i, confidence: 80 }
      ];
    };

    it('🔧 debe retornar patrones específicos para sudo', function() {
      // Arrange
      const command = 'sudo systemctl restart nginx';

      // Act
      const patterns = getCommandSpecificPatterns(command);

      // Assert
      expect(patterns).to.have.lengthOf(2);
      expect(patterns[0].confidence).to.equal(90);
      expect(patterns[1].confidence).to.equal(85);
    });

    it('🔧 debe retornar patrones específicos para SSH', function() {
      // Arrange
      const command = 'ssh user@server.com';

      // Act
      const patterns = getCommandSpecificPatterns(command);

      // Assert
      expect(patterns).to.have.lengthOf(2);
      expect(patterns.some(p => p.confidence === 90)).to.be.true;
      expect(patterns.some(p => p.confidence === 70)).to.be.true;
    });

    it('🔧 debe retornar patrones específicos para MySQL', function() {
      // Arrange
      const command = 'mysql -u root -p database';

      // Act
      const patterns = getCommandSpecificPatterns(command);

      // Assert
      expect(patterns).to.have.lengthOf(1);
      expect(patterns[0].confidence).to.equal(90);
    });

    it('🔧 debe retornar patrones genéricos para comandos desconocidos', function() {
      // Arrange
      const command = 'unknown-command --option';

      // Act
      const patterns = getCommandSpecificPatterns(command);

      // Assert
      expect(patterns).to.have.lengthOf(2);
      expect(patterns[0].confidence).to.equal(70);
      expect(patterns[1].confidence).to.equal(80);
    });

    it('🔧 debe ser case insensitive', function() {
      // Arrange
      const command = 'SUDO SYSTEMCTL RESTART';

      // Act
      const patterns = getCommandSpecificPatterns(command);

      // Assert
      expect(patterns).to.have.lengthOf(2);
      expect(patterns[0].confidence).to.equal(90);
    });
  });

  describe('createPasswordTimeoutHandler()', function() {
    let clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
    });

    afterEach(function() {
      clock.restore();
    });

    const createPasswordTimeoutHandler = (stream, password, commandName, logStream) => {
      let timeoutId;
      let responded = false;
      
      const sendPassword = (reason = "") => {
        if (!responded) {
          stream.write(password + "\\n");
          logStream.write(`[AUTO-RESPONSE] Contraseña enviada automáticamente${reason ? ` (${reason})` : ""}\\n`);
          responded = true;
        }
      };
      
      timeoutId = setTimeout(() => {
        if (!responded) {
          sendPassword("Timeout - ");
        }
      }, 3000);
      
      return {
        triggerPasswordSend: (reason = "") => {
          clearTimeout(timeoutId);
          sendPassword(reason);
        },
        cancel: () => {
          clearTimeout(timeoutId);
          responded = true;
        },
        isResponded: () => responded
      };
    };

    it('⏰ debe enviar contraseña automáticamente después de timeout', function() {
      // Arrange
      const mockStream = { write: sinon.stub() };
      const mockLogStream = { write: sinon.stub() };
      const password = 'testpassword';
      const commandName = 'sudo test';

      // Act
      const handler = createPasswordTimeoutHandler(mockStream, password, commandName, mockLogStream);
      
      // Avanzar el tiempo para trigger el timeout
      clock.tick(3000);

      // Assert
      expect(mockStream.write.calledWith('testpassword\\n')).to.be.true;
      expect(mockLogStream.write.calledWith('[AUTO-RESPONSE] Contraseña enviada automáticamente (Timeout - )\\n')).to.be.true;
      expect(handler.isResponded()).to.be.true;
    });

    it('🎯 debe enviar contraseña manualmente cuando se trigger', function() {
      // Arrange
      const mockStream = { write: sinon.stub() };
      const mockLogStream = { write: sinon.stub() };
      const password = 'testpassword';
      const commandName = 'sudo test';

      // Act
      const handler = createPasswordTimeoutHandler(mockStream, password, commandName, mockLogStream);
      handler.triggerPasswordSend('Manual trigger - ');

      // Assert
      expect(mockStream.write.calledWith('testpassword\\n')).to.be.true;
      expect(mockLogStream.write.calledWith('[AUTO-RESPONSE] Contraseña enviada automáticamente (Manual trigger - )\\n')).to.be.true;
      expect(handler.isResponded()).to.be.true;
    });

    it('🛑 debe cancelar timeout correctamente', function() {
      // Arrange
      const mockStream = { write: sinon.stub() };
      const mockLogStream = { write: sinon.stub() };
      const password = 'testpassword';
      const commandName = 'sudo test';

      // Act
      const handler = createPasswordTimeoutHandler(mockStream, password, commandName, mockLogStream);
      handler.cancel();
      
      // Avanzar el tiempo más allá del timeout
      clock.tick(5000);

      // Assert
      expect(mockStream.write.called).to.be.false;
      expect(mockLogStream.write.called).to.be.false;
      expect(handler.isResponded()).to.be.true;
    });

    it('🔒 no debe enviar contraseña múltiples veces', function() {
      // Arrange
      const mockStream = { write: sinon.stub() };
      const mockLogStream = { write: sinon.stub() };
      const password = 'testpassword';
      const commandName = 'sudo test';

      // Act
      const handler = createPasswordTimeoutHandler(mockStream, password, commandName, mockLogStream);
      handler.triggerPasswordSend('First trigger - ');
      handler.triggerPasswordSend('Second trigger - ');

      // Assert
      expect(mockStream.write.calledOnce).to.be.true;
      expect(mockLogStream.write.calledOnce).to.be.true;
    });
  });
});