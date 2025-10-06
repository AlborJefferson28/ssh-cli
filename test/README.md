# 🧪 Suite de Tests para SSH CLI

Esta suite de tests unitarios e integración proporciona cobertura completa para el CLI SSH Remote Command Executor.

## 📁 Estructura de Tests

```
test/
├── package.json              # Dependencias de testing
├── setup.js                  # Configuración global de tests
├── helpers/
│   └── testUtils.js          # Utilidades y helpers para tests
├── unit/                     # Tests unitarios
│   ├── fileSystem.test.js    # Tests de sistema de archivos
│   ├── processManagement.test.js  # Tests de gestión de procesos
│   ├── passwordDetection.test.js  # Tests de detección de contraseñas
│   ├── validation.test.js    # Tests de validaciones
│   ├── commandProcessing.test.js   # Tests de procesamiento de comandos
│   └── interactiveMenu.test.js    # Tests de navegación interactiva
└── integration/              # Tests de integración
    ├── sshConnection.test.js # Tests de conexiones SSH
    └── endToEnd.test.js      # Tests end-to-end completos
```

## 🚀 Ejecución de Tests

### Instalación de dependencias
```bash
cd test
npm install
```

### Comandos disponibles
```bash
# Ejecutar todos los tests
npm test

# Solo tests unitarios
npm run test:unit

# Solo tests de integración  
npm run test:integration

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests en modo debug
npm run test:debug
```

## 📋 Cobertura de Tests

### 🗂️ Sistema de Archivos (fileSystem.test.js)
- ✅ Creación automática de directorios
- ✅ Carga de procesos desde JSON
- ✅ Guardado de procesos en JSON
- ✅ Manejo de errores de archivo
- ✅ Creación de streams de logs

### ⚙️ Gestión de Procesos (processManagement.test.js)
- ✅ Eliminación de procesos por ID
- ✅ Listado agrupado por host
- ✅ Cálculo de estadísticas
- ✅ Validación de estructura de procesos
- ✅ Manejo de listas vacías

### 🔐 Detección de Contraseñas (passwordDetection.test.js)
- ✅ Detección de prompts sudo
- ✅ Detección multiidioma (inglés/español)
- ✅ Análisis de confianza de prompts
- ✅ Patrones específicos por comando
- ✅ Manejo de timeouts automáticos
- ✅ Prevención de envíos múltiples

### ✅ Validaciones (validation.test.js)
- ✅ Validación de hosts y puertos
- ✅ Validación de nombres de host
- ✅ Validación de credenciales SSH
- ✅ Validación de comandos
- ✅ Validación de IDs y posiciones
- ✅ Validación de host ID y posición combinada

### ⚙️ Procesamiento de Comandos (commandProcessing.test.js)
- ✅ Construcción de comandos con contexto
- ✅ Manejo de directorios de trabajo
- ✅ Análisis de salida de comandos
- ✅ Detección de tipos de errores
- ✅ Formateo de progreso
- ✅ Generación de logs detallados

### 🖱️ Navegación Interactiva (interactiveMenu.test.js)
- ✅ Menú principal y opciones
- ✅ Agrupación y navegación por hosts
- ✅ Navegación de procesos por host
- ✅ Selección rápida de procesos
- ✅ Eliminación interactiva
- ✅ Validación de navegación

### 🌐 Conexiones SSH (sshConnection.test.js)
- ✅ Establecimiento de conexión
- ✅ Manejo de errores de autenticación
- ✅ Timeouts de conexión
- ✅ Ejecución de comandos remotos
- ✅ Detección automática de sudo
- ✅ Manejo de comandos fallidos
- ✅ Contexto de directorio persistente
- ✅ Reconexión automática
- ✅ Manejo de desconexiones

### 🔄 End-to-End (endToEnd.test.js)
- ✅ Flujo completo de creación y ejecución
- ✅ Detección de hosts existentes
- ✅ Navegación y listado completo
- ✅ Selección por host ID y posición
- ✅ Eliminación de procesos
- ✅ Cálculo de estadísticas
- ✅ Manejo de errores del sistema
- ✅ Recuperación de archivos corruptos

## 🔧 Configuración de Tests

### setup.js
- Mock de console para tests limpios
- Helpers para limpieza de directorios de test
- Configuración de paths de test
- Setup/teardown automático

### testUtils.js
- Creación de procesos mock
- Simulación de file system
- Mock de inquirer prompts
- Mock de conexiones SSH
- Utilidades de validación
- Helpers de timing

## 📊 Métricas de Cobertura Esperadas

| Componente | Cobertura |
|------------|-----------|
| Sistema de Archivos | 95%+ |
| Gestión de Procesos | 98%+ |
| Detección de Contraseñas | 90%+ |
| Validaciones | 100% |
| Procesamiento de Comandos | 92%+ |
| Navegación Interactiva | 85%+ |
| Conexiones SSH | 80%+ |
| Integración E2E | 75%+ |

## 🎯 Casos de Test Principales

### Casos de Éxito ✅
- Creación y ejecución exitosa de procesos
- Navegación completa por la interfaz
- Detección automática de contraseñas sudo
- Agrupación correcta por hosts
- Persistencia de datos

### Casos de Error ❌
- Archivos corruptos o inexistentes
- Conexiones SSH fallidas
- IDs y posiciones inválidas
- Validaciones de entrada
- Timeouts y desconexiones

### Casos Edge 🔄
- Listas vacías de procesos
- Hosts sin nombre
- Comandos con caracteres especiales
- Múltiples intentos de reconexión
- Prompts de contraseña ambiguos

## 🚨 Convenciones de Tests

### Naming
- Describe blocks: `🔧 Categoría` (emoji + descripción)
- Test cases: `✅ debe hacer algo` (emoji + acción esperada)
- Error cases: `❌ debe fallar cuando...`
- Edge cases: `🔄 debe manejar caso especial`

### Estructura
```javascript
describe('🔧 Componente', function() {
  beforeEach(function() {
    // Setup específico
  });

  describe('Funcionalidad específica', function() {
    it('✅ debe comportarse correctamente', function() {
      // Arrange
      // Act  
      // Assert
    });
  });
});
```

### Mocking
- Mock completo de dependencias externas
- Stubs para file system operations
- Simulación de inquirer prompts
- Mock de conexiones SSH
- Aislamiento completo entre tests

## 🔍 Debugging de Tests

### Logs de Debug
```bash
# Ver output detallado
npm run test:debug

# Test específico
npx mocha test/unit/validation.test.js --timeout 0 --inspect-brk
```

### Cobertura Detallada
```bash
npm run test:coverage
# Abre ./coverage/index.html para reporte visual
```

## 📈 Métricas y Reporting

Los tests generan reportes detallados que incluyen:
- Cobertura de código por archivo
- Tiempo de ejecución por test
- Fallos y errores detallados
- Métricas de performance

## 🎯 Objetivos de Testing

1. **Cobertura**: >90% de cobertura de código
2. **Confiabilidad**: 0 falsos positivos
3. **Performance**: Tests <5 segundos
4. **Mantenibilidad**: Tests fáciles de leer y modificar
5. **Integración**: CI/CD ready

Esta suite de tests asegura que el SSH CLI funcione correctamente en todos los escenarios de uso y maneje errores de manera robusta.