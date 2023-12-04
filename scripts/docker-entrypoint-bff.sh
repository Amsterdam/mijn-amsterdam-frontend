#!/bin/bash
set -e

# AZ AppService allows SSH into a App instance.
if [ "$MA_OTAP_ENV" = "test" ]; then
    echo "Starting SSH ..."
    service ssh start
fi

# Tell node to use openssl ca
export NODE_OPTIONS=--use-openssl-ca

npm run bff-api:serve-build

