#!/bin/bash
set -e

printenv > .env # Save all environment variables to a file

# AZ AppService allows SSH into a App instance.
if [ "$MA_CONTAINER_SSH_ENABLED" = "true" ]; then
    echo "Starting SSH ..."
    service ssh start
fi

# Tell node to use openssl ca
export NODE_OPTIONS=--use-openssl-ca

npm run bff-api:serve-build

