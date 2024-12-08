# Project Setup and Structure Implementation Guide

## Setup Order

### 1. Initial Project Creation
```powershell
# First, create the project base with Vite
npm create vite@latest ai-training-system -- --template react-ts
cd ai-training-system

# Install base dependencies
npm install

# Install core dependencies for AI functionality
npm install langchain @langchain/openai @langchain/community
npm install @types/node --save-dev

# Install UI and utility dependencies
npm install tailwindcss postcss autoprefixer
npm install @headlessui/react @heroicons/react
```

### 2. Project Structure Implementation Order

1. **Base Structure Setup** (Immediate)
```
ai-training-system/
├── src/
│   ├── main.tsx          # (Vite default)
│   ├── App.tsx           # (Vite default)
│   └── vite-env.d.ts     # (Vite default)
├── public/
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

2. **Core Configuration** (Before any development)
```powershell
# Initialize Tailwind
npx tailwindcss init -p

# Create environment files
New-Item .env.local
New-Item .env.development
```

3. **Module Structure** (Before AI implementation)
```
ai-training-system/
├── src/
│   ├── agents/           # AI Agent modules
│   ├── core/             # Core functionality
│   ├── types/            # TypeScript types
│   └── config/           # Configuration files
```

4. **Development Structure** (As needed per module)
```
src/agents/
├── tutor/
│   ├── chains/
│   ├── prompts/
│   └── handlers/
├── assessment/
└── progress/
```

### 3. Dependencies Implementation Timeline

#### Phase 1: Base Setup
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.0.0",
    "@langchain/openai": "latest",
    "@langchain/community": "latest",
    "tailwindcss": "^3.0.0"
  }
}
```

#### Phase 2: AI Development
```json
{
  "dependencies": {
    "langchain": "latest",
    "zod": "^3.0.0",
    "hnswlib-node": "^1.4.2"
  }
}
```

#### Phase 3: UI Development
```json
{
  "dependencies": {
    "@headlessui/react": "^1.7.0",
    "@heroicons/react": "^2.0.0",
    "react-markdown": "^8.0.0"
  }
}
```

### 4. Configuration Files Setup

#### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@agents': path.resolve(__dirname, './src/agents'),
      '@core': path.resolve(__dirname, './src/core'),
      '@types': path.resolve(__dirname, './src/types')
    }
  },
  server: {
    port: 3000,
    host: true
  }
})
```

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@agents/*": ["src/agents/*"],
      "@core/*": ["src/core/*"],
      "@types/*": ["src/types/*"]
    },
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 5. Implementation Order Checklist

1. [ ] Create Vite project
2. [ ] Install base dependencies
3. [ ] Configure TypeScript
4. [ ] Set up project structure
5. [ ] Configure Tailwind
6. [ ] Set up environment files
7. [ ] Create base components
8. [ ] Implement AI modules
9. [ ] Add additional dependencies as needed

### 6. When to Create Each Component

1. **Initial Setup (Day 1)**
   - Vite project creation
   - Base dependency installation
   - Basic configuration files

2. **Structure Setup (Day 1-2)**
   - Create folder structure
   - Set up path aliases
   - Initialize base components

3. **Module Implementation (After Structure)**
   - Create individual module folders as needed
   - Implement one module at a time
   - Add module-specific dependencies when required

4. **Testing Setup (With Each Module)**
   - Create test files alongside modules
   - Set up test configurations
   - Implement testing utilities

### Best Practices

1. **Dependency Management**
   - Install dependencies only when needed
   - Document dependency purpose
   - Keep versions locked in package.json

2. **Structure Implementation**
   - Create folders just before use
   - Maintain consistent naming
   - Document folder purpose

3. **Configuration**
   - Set up environment variables early
   - Use TypeScript paths
   - Configure build tools properly

4. **Module Development**
   - Complete one module before starting another
   - Keep related files together
   - Maintain clear boundaries

Would you like me to:
1. Provide more specific details about any section?
2. Add additional configuration examples?
3. Create a script to automate this setup process?
