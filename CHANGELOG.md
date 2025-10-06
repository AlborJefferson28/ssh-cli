# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-06

### Added
- ✨ Enhanced debug mode with interactive features and command history
- 📊 Host grouping and improved interactive menu for SSH process management
- 🧪 Comprehensive unit tests for password detection, process management, and CLI validation
- 📈 Improved test coverage with integration tests for end-to-end functionality
- 🔧 Enhanced dependency management and validation improvements

### Improved
- 📚 Simplified documentation with cleaner README header section
- 🎨 Better visual presentation with removal of unnecessary artifacts
- 🔍 Enhanced password detection patterns and confidence scoring
- ⚡ Improved SSH connection handling and error management
- 🛠️ Better interactive command processing and menu navigation

### Technical
- **Testing**: Added comprehensive test suite with mocha, chai, and sinon
- **Coverage**: Implemented c8 for code coverage reporting
- **Validation**: Enhanced input validation and error handling
- **Dependencies**: Updated and optimized dependency versions
- **Architecture**: Improved modular structure for better maintainability

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