#!/usr/bin/env bash

SESSION_NAME="mijnadam-dev"

# Start new session, but don't attach
tmux new-session -d -s $SESSION_NAME

# Create first window and run command
tmux send-keys -t $SESSION_NAME "npm run start" Enter 

# Split vertically and run command
tmux split-window -v -t $SESSION_NAME
tmux send-keys -t $SESSION_NAME "npm run bff-api:watch" Enter 

# Split horizontally (on lower pane) and run command
tmux split-window -h -t $SESSION_NAME
tmux send-keys -t $SESSION_NAME "npm run mock-server" Enter 

# Attach to the session
tmux attach-session -t $SESSION_NAME