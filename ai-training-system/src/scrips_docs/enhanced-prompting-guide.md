# @ai-protected
# Enhanced AI Development Prompting Guide

[Previous sections remain unchanged...]

## File Protection Protocol

### File Status Check Prompt
```markdown
Before modifying any file:
1. Check file header for protection status
2. Verify in .aiprotect.json
3. Determine modification permissions
4. Request authorization if needed
5. Document any approved changes

Please confirm the file's protection status before proceeding.
```

### Protection Marking Prompt
```markdown
When marking a file as complete:
1. What is the file's current status?
2. What protection level is appropriate?
3. What modifications should be allowed?
4. What documentation is needed?
5. Should it be added to .aiprotect.json?

Please provide the protection marker details for review.
```

### Protected File Modification Request
```markdown
When changes to protected files are needed:
1. Current protection status: [status]
2. Reason for modification: [explanation]
3. Proposed changes: [details]
4. Impact assessment: [analysis]
5. Rollback plan: [steps]

Please authorize these changes before proceeding.
```

### File Recovery Prompt
```markdown
When restoring deleted protected files:
1. Check .aiprotect.json for status
2. Verify last known state
3. Confirm protection markers
4. Validate dependencies
5. Update modification dates

Please confirm the restored file matches protected status.
```

## Protection System Rules

### File Markers
```javascript
/**
 * @ai-protected
 * @status [complete|in-progress]
 * @last-modified ${DATE}
 * @description ${BRIEF_DESCRIPTION}
 * @allowed-modifications ${LIST_OF_ALLOWED_CHANGES}
 */
```

### Protection Levels
1. **@ai-protected**
   - No modifications allowed
   - Requires explicit authorization
   - Changes must be documented

2. **@ai-restricted**
   - Limited modifications allowed
   - Must explain changes
   - Must maintain structure

3. **Unmarked**
   - Open for modification
   - Consider protection needs
   - Document significant changes

## Implementation Checklist

Before each development session:
```markdown
1. File Protection Status:
   - [ ] Checked .aiprotect.json
   - [ ] Verified file markers
   - [ ] Confirmed modification permissions

2. Development Context:
   - [ ] Module boundaries clear
   - [ ] Protection requirements understood
   - [ ] Documentation up to date

3. Modification Protocol:
   - [ ] Protected files identified
   - [ ] Change requirements documented
   - [ ] Authorizations received
```

## Handoff Template (Updated)

```markdown
Session Summary:
[Previous fields remain...]
Protection Status:
- Files Protected: [list]
- Pending Protections: [list]
- Authorized Changes: [list]
- Protection Updates: [list]
```

## Quick Reference Commands

### Check File Protection
```markdown
Please check the protection status of [filename] and provide:
1. Current protection level
2. Allowed modifications
3. Last modified date
4. Required authorizations
```

### Mark File Complete
```markdown
Please mark [filename] as complete with:
1. Protection level: [protected|restricted]
2. Status description
3. Modification permissions
4. Update protection registry
```

### Request Changes
```markdown
For protected file [filename], I need to:
1. Modify: [specific changes]
2. Reason: [justification]
3. Impact: [assessment]
Please review and advise.
```

## System Maintenance

Regular checks:
1. Verify .aiprotect.json accuracy
2. Update protection markers
3. Document protection changes
4. Review modification logs
5. Update protection registry

## Remember
- Protection markers are permanent unless explicitly removed
- Always check before modifying
- Document all protection changes
- Maintain protection registry
- Ask when uncertain

This guide should be used alongside the core development principles to ensure both code quality and file protection.
