# AI Training System Development Guide
*Master Index and Reference*

## Quick Reference Links
- [Project Blueprint](#project-blueprint)
- [AI Development Guide](#ai-development-guide)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [PowerShell Tools](#powershell-tools)
- [AI Agent Specifications](#ai-agent-specifications)

## Project Blueprint
Location: `masterplan.md`

### Core Components
1. **AI Orchestration Layer**
   - Task distribution
   - Context management
   - Learning paths
   - Resource management

2. **System Architecture**
   - Frontend (React/Tailwind)
   - Backend (Node.js/Express)
   - AI Components (LangChain.js)
   - Data Storage

3. **Development Phases**
   - Environment Setup
   - Core AI Development
   - Frontend Implementation
   - Backend Integration
   - Testing & Deployment

## AI Development Guide
Location: `ai-prompting-guide.md`

### Key Sections
1. **Role Definition Prompts**
   - Module focus
   - Task alignment
   - Code quality
   - Documentation

2. **Development Protocols**
   - Stay on track
   - Troubleshooting
   - Documentation
   - Handoffs

3. **Best Practices**
   - One thing at a time
   - Verification first
   - Documentation always
   - Question everything

## Project Structure
Location: `project-setup-guide.md`

### Implementation Order
1. **Initial Setup**
   ```
   ai-training-system/
   ├── src/
   │   ├── main.tsx
   │   ├── App.tsx
   │   └── vite-env.d.ts
   ```

2. **Module Structure**
   ```
   src/
   ├── agents/
   │   ├── tutor/
   │   ├── assessment/
   │   └── progress/
   ```

3. **Configuration Files**
   - vite.config.ts
   - tsconfig.json
   - .env files

## Setup Instructions
Location: `project-setup-guide.md#setup-order`

### Key Steps
1. **Project Creation**
   ```powershell
   npm create vite@latest ai-training-system -- --template react-ts
   ```

2. **Dependencies**
   ```powershell
   npm install langchain @langchain/openai @langchain/community
   ```

3. **Configuration**
   - Tailwind setup
   - TypeScript config
   - Environment variables

## PowerShell Tools
Location: `powershell-guide.md`

### Available Scripts
1. **Handoff Generation**
   ```powershell
   .\scripts\handoff.ps1 -module "tutor"
   ```

2. **Status Check**
   ```powershell
   .\scripts\status.ps1 -module "all"
   ```

3. **Progress Tracking**
   ```powershell
   .\scripts\track-progress.ps1
   ```

## AI Agent Specifications
Location: `ai-tutor-spec.md`

### Components
1. **Tutor Agent**
   - Interactive learning
   - Teaching methods
   - Response types
   - Knowledge assessment

2. **Integration Points**
   - Assessment integration
   - Resource management
   - Progress tracking

## Development Workflow
Location: Various files

### Key Processes
1. **Module Development**
   - Start with role definition
   - Follow AI prompting guide
   - Use PowerShell tools
   - Document progress

2. **Testing Protocol**
   - Unit tests with modules
   - Integration testing
   - Performance validation

3. **Documentation**
   - Regular handoffs
   - Progress updates
   - Decision records

## Dependency Management
Location: `project-setup-guide.md#dependencies`

### Implementation Timeline
1. **Base Setup**
   - React
   - TypeScript
   - LangChain.js

2. **AI Development**
   - OpenAI integration
   - Vector databases
   - Testing tools

3. **UI Development**
   - Tailwind CSS
   - UI components
   - State management

## File Structure Reference
Location: `powershell-guide.md#project-structure`

### Key Directories
```
ai-training-system/
├── src/
│   ├── agents/
│   ├── core/
│   └── types/
├── docs/
├── tests/
└── scripts/
```

## Configuration Templates
Location: `project-setup-guide.md#configuration-files`

### Available Templates
1. **Vite Config**
   - Path aliases
   - Build options
   - Server settings

2. **TypeScript Config**
   - Compiler options
   - Module resolution
   - Type definitions

## Common Tasks Quick Reference

### Starting New Module
1. Define role using AI prompts
2. Create module structure
3. Set up tests
4. Document progress

### Handoff Process
1. Generate handoff document
2. Update progress tracking
3. Document next steps
4. Push changes

### Troubleshooting
1. Use AI prompting guide
2. Check status with PowerShell tools
3. Document issues
4. Update handoff

## Navigation Tips
- Use section links for quick access
- Reference file locations
- Follow implementation order
- Check dependencies per phase

Would you like me to:
1. Add more specific details to any section?
2. Create additional quick reference sections?
3. Provide more examples for common tasks?
