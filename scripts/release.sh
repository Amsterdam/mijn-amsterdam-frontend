#!/bin/bash

CURBRANCH=`git branch | grep \* | cut -d ' ' -f2`;

if [ $CURBRANCH != "master" ]
then
  echo "You are not on master. The current branch is '$CURBRANCH' make sure you are on 'master'";
  exit 1;
fi

git pull origin master;

CURTAG=`git describe --abbrev=0 --tags`;
CURTAG="${CURTAG/v/}"

IFS='.' read -a vers <<< "$CURTAG"

MAJ=${vers[0]}
MIN=${vers[1]}

BUG=$([ "${vers[2]}" == "" ] && echo 0 || echo "$d")

echo "Current Tag: v$MAJ.$MIN.$BUG"

for cmd in "$@"
do
	case $cmd in
		"--major")
			# $((MAJ+1))
			((MAJ+=1))
			MIN=0
			BUG=0
			echo "Incrementing Major Version#"
			;;
		"--minor")
			((MIN+=1))
			BUG=0
			echo "Incrementing Minor Version#"
			;;
		"--bug")
			((BUG+=1))
			echo "Incrementing Bug Version#"
			;;
	esac
done

NEWTAG="release-v$MAJ.$MIN.$BUG"

echo "Adding Tag: $NEWTAG";

git tag -a $NEWTAG -m $NEWTAG
git push origin $NEWTAG
