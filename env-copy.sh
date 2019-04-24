#!/bin/bash
file="./.env.$1" # $1 can be production/test/acceptance

if [ -f "$file" ] && [ "$1" != "production" ]
then
	mv $file ./.env.production
  echo "$file exists, copy to .env.production"
elif [ "$1" != "production" ]
then
	echo "$file not found, using default .env.production instead"
fi
