# 🚀 Configuración de Alias y Comandos

## 💡 **Formas de ejecutar el SSH CLI**

Una vez instalado, puedes usar el CLI de varias formas para evitar escribir `node index.mjs` cada vez.

## 🌟 **Opción 1: Script de Instalación Automática (Recomendada)**

Ejecuta el script de instalación que configura todo automáticamente:

```bash
# Desde el directorio ssh-cli
./install.sh
```

El script te configurará:
- ✅ Permisos de ejecución
- ✅ Comando global `ssh-cli`
- ✅ Opción de alias personalizado
- ✅ Múltiples formas de uso

## 🔧 **Opción 2: Configuración Manual**

### A. Permisos de Ejecución + Shebang

```bash
# Dar permisos de ejecución
chmod +x index.mjs

# Usar directamente
./index.mjs help
./index.mjs list
./index.mjs start
```

### B. Comando Global

```bash
# Crear enlace simbólico global
sudo ln -sf $(pwd)/index.mjs /usr/local/bin/ssh-cli

# Usar desde cualquier directorio
ssh-cli help
ssh-cli list
ssh-cli start
```

### C. Alias en ~/.bashrc

```bash
# Agregar al final de ~/.bashrc
echo "alias sshcli='$(pwd)/index.mjs'" >> ~/.bashrc

# Recargar configuración
source ~/.bashrc

# Usar el alias
sshcli help
sshcli list
sshcli start
```

## 📋 **Resumen de Comandos Disponibles**

Una vez configurado, puedes usar cualquiera de estas formas:

### 🌐 **Comando Global (Recomendado)**
```bash
ssh-cli help
ssh-cli list
ssh-cli start
ssh-cli start -p 1
ssh-cli delete -p 2
```

### 📁 **Ejecutable Local**
```bash
./index.mjs help
./index.mjs list
./index.mjs start
./index.mjs start -p 1
./index.mjs delete -p 2
```

### 💫 **Con Alias Personalizado**
```bash
sshcli help
sshcli list
sshcli start
sshcli start -p 1
sshcli delete -p 2
```

### 🔗 **Método Original (Siempre funciona)**
```bash
node index.mjs help
node index.mjs list
node index.mjs start
node index.mjs start -p 1
node index.mjs delete -p 2
```

## ✅ **Verificar Instalación**

```bash
# Verificar comando global
which ssh-cli
ssh-cli help

# Verificar permisos
ls -la index.mjs
# Debería mostrar: -rwxr-xr-x ... index.mjs

# Verificar alias (si lo configuraste)
alias | grep sshcli
```

## 🔄 **Desinstalar/Limpiar**

```bash
# Remover comando global
sudo rm /usr/local/bin/ssh-cli

# Remover alias de ~/.bashrc
sed -i '/alias sshcli=/d' ~/.bashrc
source ~/.bashrc

# Quitar permisos de ejecución (opcional)
chmod -x index.mjs
```

## 💡 **Recomendaciones**

1. **Para uso personal**: Usa el comando global `ssh-cli`
2. **Para desarrollo**: Usa `./index.mjs` 
3. **Para servidores**: Considera alias personalizado
4. **Para CI/CD**: Usa `node index.mjs` para máxima compatibilidad

## 🎯 **Ventajas de cada método**

### Comando Global (`ssh-cli`)
- ✅ Funciona desde cualquier directorio
- ✅ Sintaxis corta y profesional
- ✅ Fácil de recordar
- ❌ Requiere permisos sudo para instalar

### Ejecutable Local (`./index.mjs`)
- ✅ No requiere permisos sudo
- ✅ Funciona inmediatamente
- ✅ Control total sobre el archivo
- ❌ Solo funciona desde el directorio del proyecto

### Alias Personalizado (`sshcli`)
- ✅ Personalizable
- ✅ No requiere permisos sudo
- ✅ Funciona desde cualquier directorio
- ❌ Solo disponible en tu sesión de terminal

¡Elige el método que mejor se adapte a tu flujo de trabajo! 🚀