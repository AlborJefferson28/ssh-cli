# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-09-28

### Added
- ✨ Initial release of SSH Remote Command Executor
- 🔐 Automatic sudo password detection with 90+ patterns
- 💾 Process saving and management system
- 📊 Detailed logging with timestamped files
- 🎨 Professional CLI interface with progress indicators
- 📁 Directory context persistence across commands
- 🚀 Global command installation (`ssh-cli`)
- 📚 Comprehensive documentation
- 🛠️ Interactive process configuration
- ✅ CRUD operations for SSH processes (create, read, update, delete)

### Features
- **Commands**:
  - `help` - Show comprehensive help
  - `list` - Display saved SSH processes  
  - `start` - Create new SSH process
  - `start -p <id>` - Execute saved process
  - `delete -p <id>` - Remove saved process

- **Password Detection**:
  - Sudo prompts with confidence scoring
  - Command-specific patterns (mysql, psql, ssh, su)
  - Multi-language support (English/Spanish)
  - Timeout-based fallback

- **Process Management**:
  - JSON-based storage in `process/ssh-processes.json`
  - Automatic directory creation
  - Process validation and error handling
  - Detailed process information display

- **Logging**:
  - Timestamped log files in `logs/` directory
  - Command execution details
  - Directory context tracking
  - Error logging and debugging info

### Technical
- **Requirements**: Node.js >= 16.0.0
- **Platform**: Ubuntu Linux (tested)
- **Dependencies**: ssh2, inquirer
- **Architecture**: ES Modules (ESM)
- **Binary**: Global `ssh-cli` command available

### Documentation
- Complete API reference
- Installation guide
- Quick start tutorial
- Command reference
- Configuration guide
- Troubleshooting guide
- Practical examples