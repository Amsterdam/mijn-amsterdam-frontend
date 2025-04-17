#!/bin/bash

# filepath: /Users/tvo/projects/mijn-amsterdam-frontend/scripts/generate-thema-files.sh

# Check if a path is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <path>"
  exit 1
fi

# Get the specified path
TARGET_PATH="$1"

# Check if the path exists and is a directory
if [ ! -d "$TARGET_PATH" ]; then
  echo "Error: $TARGET_PATH is not a valid directory."
  exit 1
fi

# Find all directories in the specified path and output them as a comma-separated string
folders=$(find "$TARGET_PATH" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | paste -sd "," -)

# Output the result
echo "$folders"
