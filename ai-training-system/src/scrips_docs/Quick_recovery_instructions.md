# @ai-protected
# Quick Recovery Guide

## If a file is deleted:

1. Quick Recovery:
```bash
node recovery.js your-deleted-file.js
```

2. Git Recovery (if #1 fails):
```bash
git checkout HEAD -- your-deleted-file.js
```

3. Manual Recovery:
- Check .backup/ folder
- Check version-backups/
- Check git history

## Recovery Commands by File Type:

### Config Files
```bash
# Package.json
git checkout HEAD -- package.json
npm install

# Environment files
cp .env.example .env
# Then fill in your values
```

### Source Files
```bash
# Check git history
git log --all --full-history -- src/your-file.js
git checkout $(git rev-list -n 1 HEAD -- src/your-file.js) -- src/your-file.js
```

### Version Files
```bash
# Recover protection config
git checkout HEAD -- version-protection.json

# Recover regular versions
git checkout HEAD -- versions.json
```

Always verify recovered files against version-protection.json!


your-project/
├── version-protection.json     # Protected version info (PROTECTED)
├── versions.json              # Regular version tracking
├── recovery.js               # Recovery script
├── backup-system.js         # Backup script
├── protect-versions.js      # Protection script
├── .backup/                 # Backup directory
│   └── ... backup files
├── version-backups/         # Version specific backups
│   └── ... version backups
└── ... rest of your project files