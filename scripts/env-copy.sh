#!/bin/bash

#NOTE: This program Needs to be executed in the root of the project

env_file="$(pwd)/.env.$1" # $1 can be production | test | acceptance
prod_file="$(pwd)/.env.production"

if [ -f "$env_file" ] && [ "$1" != "production" ]
then
	mv $env_file $prod_file
  echo "$env_file exists, copy to .env.production"
elif [ "$1" != "production" ]
then
	echo "$env_file not found, using default .env.production instead"
fi
