#!/bin/bash
set -e

# echo "Starting SSH ..."
service ssh start

# Tell node to use openssl ca
export NODE_OPTIONS=--use-openssl-ca

npm run bff-api:serve-build

