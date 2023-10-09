#!/bin/bash    


list=$(git tag -l "release-*" --sort=-"version:refname")

echo $list

tag=${list:0:16}

echo tag
echo $tag

commitid=$(git rev-list -n 1 $tag)

date=$(git show -s --format=%ci $commitid)

commits=$(git log --pretty="%s %cI" --no-merges --since="$date")

echo commits
echo $commits