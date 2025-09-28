#!/bin/bash

# SSH CLI - Script de Instalación
# Configura aliases y enlaces simbólicos para facilitar el uso

set -e  # Salir si hay errores

SSH_CLI_PATH="$(pwd)/index.mjs"
SSH_CLI_DIR="$(pwd)"

echo "🚀 Configurando SSH CLI..."

# Verificar que estamos en el directorio correcto
if [[ ! -f "index.mjs" ]]; then
    echo "❌ Error: Ejecuta este script desde el directorio ssh-cli"
    echo "💡 Uso: cd /ruta/a/ssh-cli && ./install.sh"
    exit 1
fi

# Dar permisos de ejecución
echo "🔧 Configurando permisos de ejecución..."
chmod +x index.mjs

# Crear enlace simbólico global
echo "🌐 Creando comando global 'ssh-cli'..."
if sudo ln -sf "$SSH_CLI_PATH" /usr/local/bin/ssh-cli 2>/dev/null; then
    echo "✅ Comando global 'ssh-cli' creado exitosamente"
    GLOBAL_SUCCESS=true
else
    echo "⚠️  No se pudo crear el comando global (requiere sudo)"
    GLOBAL_SUCCESS=false
fi

# Configurar alias en ~/.bashrc (opcional)
echo ""
read -p "¿Quieres agregar un alias 'sshcli' a tu ~/.bashrc? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if ! grep -q "alias sshcli=" ~/.bashrc 2>/dev/null; then
        echo "alias sshcli='$SSH_CLI_PATH'" >> ~/.bashrc
        echo "✅ Alias 'sshcli' agregado a ~/.bashrc"
        echo "💡 Ejecuta 'source ~/.bashrc' o reinicia la terminal para usar el alias"
    else
        echo "ℹ️  El alias 'sshcli' ya existe en ~/.bashrc"
    fi
fi

echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Formas de usar el SSH CLI:"
echo ""

# Mostrar opciones disponibles
echo "1. 🌐 Comando global (desde cualquier directorio):"
if [[ $GLOBAL_SUCCESS == true ]]; then
    echo "   ssh-cli help"
    echo "   ssh-cli list"
    echo "   ssh-cli start"
else
    echo "   ❌ No disponible (requiere sudo)"
fi

echo ""
echo "2. 📁 Desde el directorio del proyecto:"
echo "   ./index.mjs help"
echo "   ./index.mjs list" 
echo "   ./index.mjs start"

echo ""
echo "3. 🔗 Usando Node.js (método original):"
echo "   node index.mjs help"
echo "   node index.mjs list"
echo "   node index.mjs start"

if grep -q "alias sshcli=" ~/.bashrc 2>/dev/null; then
    echo ""
    echo "4. 💫 Usando el alias (después de 'source ~/.bashrc'):"
    echo "   sshcli help"
    echo "   sshcli list"
    echo "   sshcli start"
fi

echo ""
echo "🚀 ¡Tu SSH CLI está listo para usar!"