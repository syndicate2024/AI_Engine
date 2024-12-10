# @ai-protected
# New Session Start

Usage Instructions

Save this as ai-session.ps1 in your project root
To start a new AI session:

.\ai-session.ps1 -action start


To end an AI session:

.\ai-session.ps1 -action end

That's it! This script will:

Create necessary directories
Initialize/maintain session state
Show you previous session info
Handle session tracking automatically

The script shows you everything you need to know when starting a new session and handles all the organization automatically.


# Start session
.\ai-session.ps1 -action start

# End session
.\ai-session.ps1 -action end

# Cleanup old sessions (keeps last 5 by default)
.\ai-session.ps1 -action cleanup