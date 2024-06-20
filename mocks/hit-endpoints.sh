#!/usr/bin/env bash

# Script for testing endpoints to quikly see if the mock server
# threw any errors for any given route.
#
# For GET you can simply do `curl [url]`, see `man curl' for other options
# (tip: 'http://localhost:3100/{remote, local}/document/[1-100]' patterns are pretty great! See Globbing in the manual.

bsn=$1
curl -X POST -H "Content-Type: application/json" -d $bsn "http://localhost:3100/remote/vakantieverhuur/bsn"
