# @ai-protected
# Comprehensive Project Ignore Configuration

## .gitignore
```gitignore
# Environment Variables
.env
.env.local
.env.*.local
.env.development
.env.development.local
.env.test
.env.test.local
.env.production
.env.production.local
.env.staging
.env.staging.local

# Dependencies
node_modules/
package-lock.json
yarn.lock
pnpm-lock.yaml
.pnpm-store/

# Build outputs
dist/
build/
out/
.next/
.nuxt/
.output/
.cache/
.parcel-cache/

# IDE and Editor files
.idea/
.vscode/
*.swp
*.swo
*~
.DS_Store
Thumbs.db
.project
.classpath
.settings/
*.sublime-workspace
*.sublime-project

# Logs and Debugging
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.pnpm-debug.log*
debug.log
coverage/
.nyc_output/

# Testing
/coverage
/cypress/videos/
/cypress/screenshots/
.jest-cache/
jest.results.json

# Temporary files
tmp/
temp/
.temp/
*.tmp
*.temp

# Platform specific
.DS_Store
Thumbs.db
Desktop.ini
$RECYCLE.BIN/

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Misc
.vercel
.netlify
.serverless/
.env*.local
.env.development
.env.test
.env.production
.env.local
*.pem
.turbo

# Local Netlify folder
.netlify

# PWA / Service workers
public/sw.js
public/workbox-*.js
public/worker-*.js
public/sw.js.map
public/workbox-*.js.map
public/worker-*.js.map

# Storybook
storybook-static/

# Database
*.sqlite
*.sqlite3
*.db

# Yarn
.yarn/*
!.yarn/cache
!.yarn/patches
!.yarn/plugins
!.yarn/releases
!.yarn/sdks
!.yarn/versions
.pnp.*
```

## .dockerignore
```dockerignore
# Version control
.git
.gitignore
.gitattributes

# Node.js
node_modules
npm-debug.log
yarn-debug.log
yarn-error.log
.pnpm-debug.log

# Environment variables
.env*
*.env

# Build outputs
dist
build
out
.next
.nuxt
.output

# Development tools
.vscode
.idea
*.swp
*.swo
.DS_Store
Thumbs.db

# Testing
coverage
.nyc_output
cypress/videos
cypress/screenshots

# Logs
logs
*.log

# Temporary files
tmp
temp
.temp
```

## .prettierignore
```gitignore
# Build outputs
dist
build
out
.next
.nuxt
.output

# Dependencies
node_modules
package-lock.json
yarn.lock
pnpm-lock.yaml

# Generated files
*.gen.*
*.generated.*
generated/

# Coverage reports
coverage

# Public assets
public/

# Static files
static/
```

## .eslintignore
```gitignore
# Build outputs
dist
build
out
.next
.nuxt
.output

# Dependencies
node_modules

# Generated files
*.gen.*
*.generated.*
generated/

# Test coverage
coverage

# Public assets
public/

# Configuration files
*.config.js
*.config.ts
```

## Protection Registry (.aiprotect.json)
```json
{
  "ignoredPaths": {
    "git": [".gitignore", ".gitattributes"],
    "docker": [".dockerignore"],
    "formatting": [".prettierignore", ".eslintignore"],
    "environment": [
      ".env",
      ".env.local",
      ".env.*.local",
      ".env.development",
      ".env.development.local",
      ".env.test",
      ".env.test.local",
      ".env.production",
      ".env.production.local",
      ".env.staging",
      ".env.staging.local"
    ],
    "dependencies": [
      "node_modules/",
      "package-lock.json",
      "yarn.lock",
      "pnpm-lock.yaml"
    ],
    "build": ["dist/", "build/", "out/", ".next/", ".nuxt/", ".output/"],
    "temp": ["tmp/", "temp/", ".temp/"],
    "ide": [".vscode/", ".idea/"],
    "logs": ["logs/", "*.log"]
  },
  "protectedConfigs": [
    ".gitignore",
    ".dockerignore",
    ".prettierignore",
    ".eslintignore",
    ".aiprotect.json"
  ]
}
```

## Usage Instructions

1. Copy these files to your project root:
   - `.gitignore`
   - `.dockerignore`
   - `.prettierignore`
   - `.eslintignore`
   - `.aiprotect.json`

2. Mark all config files as protected:
```javascript
/**
 * @ai-protected
 * @status complete
 * @last-modified ${CURRENT_DATE}
 * @description Project ignore configuration
 */
```

3. Protection Rules:
   - Never modify these files without explicit permission
   - Keep all ignore patterns synchronized
   - Update all relevant files when adding new patterns
   - Document any changes in protection registry

4. Verification Commands:
```bash
# Verify .gitignore is working
git status --ignored

# Check Docker context
docker build --no-cache .

# Verify eslint ignores
npx eslint --print-config path/to/file.js

# Check prettier ignores
npx prettier --debug-check path/to/file.js
```
