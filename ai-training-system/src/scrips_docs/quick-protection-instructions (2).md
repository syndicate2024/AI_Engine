# @ai-protected
# Quick Start Protection Instructions

Copy this at the start of your AI sessions:

```markdown
Please follow these file protection rules:

1. Check file status before modifications:
   - Look for @ai-protected or @ai-restricted headers
   - Verify against .aiprotect.json
   - Ask before modifying protected files

2. When completing files:
   - Add protection headers
   - Update .aiprotect.json
   - Document protection level

3. For protected files:
   - Request permission for changes
   - Explain modifications needed
   - Show change impact
   - Update last-modified date

4. If files are deleted:
   - Check protection registry
   - Restore with markers
   - Verify protection status

Please confirm you understand these protection rules before proceeding.
```

## Emergency Recovery
If protected files are deleted, use:

```markdown
Please help restore [filename]:
1. Check .aiprotect.json for status
2. Restore file with protection markers
3. Verify last known state
4. Update modification dates
```
