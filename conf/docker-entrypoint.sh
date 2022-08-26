#!/bin/bash
set -e

# echo "Starting SSH ..."
service ssh start

npm run bff-api:serve-build