// Funciones de validación para los tests
// Estas son implementaciones temporales basadas en lo que esperan los tests

export function validateHost(host) {
  if (!host || typeof host !== 'string' || host.trim().length === 0) {
    return 'Host inválido';
  }
  
  const trimmedHost = host.trim();
  
  // Validar formato básico de host/IP
  const hostRegex = /^[a-zA-Z0-9.-]+$/;
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  
  if (!hostRegex.test(trimmedHost) && !ipRegex.test(trimmedHost)) {
    return 'Host inválido';
  }
  
  return true;
}

export function validatePort(port) {
  const numericPort = parseInt(port, 10);
  
  if (isNaN(numericPort) || numericPort <= 0 || numericPort > 65535) {
    return 'Puerto inválido';
  }
  
  return true;
}

export function validateHostname(hostname) {
  if (!hostname || typeof hostname !== 'string' || hostname.trim().length < 3) {
    return 'Nombre de host muy corto';
  }
  
  return true;
}

export function validateUsername(username) {
  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return 'Usuario vacío';
  }
  
  return true;
}

export function validatePassword(password) {
  if (!password || typeof password !== 'string' || password.length === 0) {
    return 'Contraseña vacía';
  }
  
  return true;
}

export function validateCommand(command) {
  if (!command || typeof command !== 'string' || command.trim().length === 0) {
    return 'Comando vacío';
  }
  
  return true;
}

export function validateProcessId(id) {
  const numericId = parseInt(id, 10);
  
  if (isNaN(numericId) || numericId <= 0) {
    return 'ID inválido';
  }
  
  return true;
}

export function validateHostIdAndPosition(hostId, position) {
  const numericHostId = parseInt(hostId, 10);
  const numericPosition = parseInt(position, 10);
  
  if (isNaN(numericHostId) || numericHostId < 0) {
    return 'Host ID inválido';
  }
  
  if (isNaN(numericPosition) || numericPosition < 0) {
    return 'Posición inválida';
  }
  
  return true;
}