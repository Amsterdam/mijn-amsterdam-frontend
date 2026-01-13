#!/bin/bash
set -e

# AZ AppService allows SSH into a App instance.
if [ "$MA_CONTAINER_SSH_ENABLED" = "true" ]; then
    echo "Starting SSH ..."
    service ssh start
fi

# Tell node to use openssl ca
export NODE_OPTIONS=--use-openssl-ca

# Webjob scripts
# COPY scripts/webjobs/triggered/* /home/site/wwwroot/App_Data/jobs/triggered
SOURCE_FOLDER="/app/jobs/triggered/"
DESTINATION_FOLDER="/home/site/wwwroot/App_Data/jobs/triggered/"

# Check if destination folder exists
if [ ! -d "$DESTINATION_FOLDER" ]; then
  echo "Warning: Webjobs destination folder '$DESTINATION_FOLDER' does not exist."
else
  echo "Merging contents into existing Webjobs folder '$DESTINATION_FOLDER'..."
  # https://unix.stackexchange.com/a/149504
  rsync -hvrPt "$SOURCE_FOLDER/" "$DESTINATION_FOLDER/"
  echo "Successfully merged contents of '$SOURCE_FOLDER' into '$DESTINATION_FOLDER'."
fi

npm run bff-api:serve-build
