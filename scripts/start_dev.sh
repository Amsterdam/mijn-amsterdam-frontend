#!/bin/bash

# Get the directory of the script and go back one folder
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

# Check if iTerm2 is installed
if osascript -e 'id of application "iTerm2"' &>/dev/null; then
    # iTerm2 is installed, use it
    osascript <<EOF
    tell application "iTerm2"
        tell current window
            create tab with default profile
            tell current session
                write text "cd \"$SCRIPT_DIR\" && npm run test"
            end tell
            create tab with default profile
            tell current session
                write text "cd \"$SCRIPT_DIR\" && npm run bff-api:test"
            end tell
            create tab with default profile
            tell current session
                write text "cd \"$SCRIPT_DIR\" && npm run start"
            end tell
            create tab with default profile
            tell current session
                write text "cd \"$SCRIPT_DIR\" && npm run bff-api:watch"
            end tell
            create tab with default profile
            tell current session
                write text "cd \"$SCRIPT_DIR\" && npm run mock-server:serve"
            end tell
        end tell
    end tell
EOF
else
    # iTerm2 is not installed, use Terminal instead
    osascript <<EOF
    tell application "Terminal"
        do script "cd \"$SCRIPT_DIR\" && npm run test"
        do script "cd \"$SCRIPT_DIR\" && npm run bff-api:test"
        do script "cd \"$SCRIPT_DIR\" && npm run start"
        do script "cd \"$SCRIPT_DIR\" && npm run bff-api:watch"
        do script "cd \"$SCRIPT_DIR\" && npm run mock-server:serve"
    end tell
EOF
fi