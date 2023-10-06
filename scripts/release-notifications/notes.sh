#!/bin/bash

list=$(git tag -l release-* --sort=-"version:refname")

tag=${list:0:16}

commitid=$(git rev-list -n 1 $tag)

date=$(git show -s --format=%ci $commitid)

commits=$(git log --pretty="%s %cI" --no-merges --since="$date")

echo $commits

echo $(node -v)