#!/bin/bash

# test/run-tests.sh - Script para ejecutar tests con diferentes configuraciones

set -e

echo "🧪 SSH CLI - Suite de Tests"
echo "================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [OPCIÓN]"
    echo
    echo "Opciones:"
    echo "  unit           Ejecutar solo tests unitarios"
    echo "  integration    Ejecutar solo tests de integración"  
    echo "  coverage       Ejecutar tests con cobertura"
    echo "  watch          Ejecutar tests en modo watch"
    echo "  debug          Ejecutar tests en modo debug"
    echo "  ci             Ejecutar tests para CI/CD"
    echo "  help           Mostrar esta ayuda"
    echo
    echo "Sin opciones ejecuta todos los tests"
}

# Función para verificar dependencias
check_dependencies() {
    if [ ! -d "../node_modules" ]; then
        echo -e "${YELLOW}⚠️  Instalando dependencias...${NC}"
        cd .. && npm install && cd test
    fi
}

# Función para limpiar archivos temporales
cleanup() {
    echo -e "${BLUE}🧹 Limpiando archivos temporales...${NC}"
    rm -rf coverage/ 2>/dev/null || true
    rm -rf .nyc_output/ 2>/dev/null || true
    rm -rf test-results/ 2>/dev/null || true
}

# Función para ejecutar tests unitarios
run_unit_tests() {
    echo -e "${BLUE}🔬 Ejecutando tests unitarios...${NC}"
    cd .. && npm run test:unit && cd test
}

# Función para ejecutar tests de integración
run_integration_tests() {
    echo -e "${BLUE}🔗 Ejecutando tests de integración...${NC}"
    cd .. && npm run test:integration && cd test
}

# Función para ejecutar todos los tests
run_all_tests() {
    echo -e "${BLUE}🎯 Ejecutando todos los tests...${NC}"
    cd .. && npm test && cd test
}

# Función para ejecutar tests con cobertura
run_coverage() {
    echo -e "${BLUE}📊 Ejecutando tests con cobertura...${NC}"
    cd .. && npm run test:coverage && cd test
    
    if [ -f "../coverage/index.html" ]; then
        echo -e "${GREEN}✅ Reporte de cobertura generado en ../coverage/index.html${NC}"
    fi
}

# Función para ejecutar tests en modo watch
run_watch() {
    echo -e "${BLUE}👀 Ejecutando tests en modo watch...${NC}"
    echo -e "${YELLOW}Presiona Ctrl+C para salir${NC}"
    cd .. && npm run test:watch && cd test
}

# Función para ejecutar tests en modo debug
run_debug() {
    echo -e "${BLUE}🐛 Ejecutando tests en modo debug...${NC}"
    echo -e "${YELLOW}Conecta el debugger en el puerto 9229${NC}"
    cd .. && npm run test:debug && cd test
}

# Función para ejecutar tests para CI/CD
run_ci() {
    echo -e "${BLUE}🤖 Ejecutando tests para CI/CD...${NC}"
    
    # Crear directorio para resultados
    mkdir -p ../test-results
    
    cd .. && npm run test:ci && cd test
    
    echo -e "${GREEN}✅ Tests CI/CD completados${NC}"
    echo -e "${BLUE}📊 Cobertura LCOV: ../coverage/lcov.info${NC}"
}

# Función para mostrar estadísticas de tests
show_stats() {
    echo
    echo -e "${GREEN}📈 Estadísticas de Tests:${NC}"
    echo "================================"
    
    # Contar archivos de test
    unit_tests=$(find test/unit -name "*.test.js" | wc -l)
    integration_tests=$(find test/integration -name "*.test.js" | wc -l)
    total_tests=$((unit_tests + integration_tests))
    
    echo "📝 Archivos de test:"
    echo "  - Tests unitarios: $unit_tests"
    echo "  - Tests integración: $integration_tests"
    echo "  - Total: $total_tests"
    
    # Contar casos de test aproximadamente
    test_cases=$(grep -r "it(" test/ | wc -l)
    echo "🧪 Casos de test: ~$test_cases"
    
    echo
}

# Función principal
main() {
    # Cambiar al directorio de tests
    cd "$(dirname "$0")"
    
    # Verificar dependencias
    check_dependencies
    
    # Procesar argumentos
    case "${1:-all}" in
        "unit")
            run_unit_tests
            ;;
        "integration")
            run_integration_tests
            ;;
        "coverage")
            run_coverage
            ;;
        "watch")
            run_watch
            ;;
        "debug")
            run_debug
            ;;
        "ci")
            run_ci
            ;;
        "clean")
            cleanup
            echo -e "${GREEN}✅ Limpieza completada${NC}"
            ;;
        "stats")
            show_stats
            ;;
        "help")
            show_help
            ;;
        "all"|"")
            run_all_tests
            ;;
        *)
            echo -e "${RED}❌ Opción desconocida: $1${NC}"
            show_help
            exit 1
            ;;
    esac
    
    # Mostrar estadísticas al final (excepto en watch/debug)
    if [[ "$1" != "watch" && "$1" != "debug" && "$1" != "help" && "$1" != "stats" ]]; then
        show_stats
    fi
}

# Capturar Ctrl+C para limpieza
trap cleanup EXIT

# Ejecutar función principal
main "$@"