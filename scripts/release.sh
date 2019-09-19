#!/bin/bash

git fetch origin && \
git fetch origin -t && \
git checkout -b release-branch origin/master && \

echo "Fetched origin, created release-branch."

for cmd in "$@"
do
	case $cmd in
		"--major")
			echo "Incrementing Major Version#"
      npm --no-git-tag-version --allow-same-version version major
			;;
		"--minor")
			echo "Incrementing Minor Version#"
      npm --no-git-tag-version --allow-same-version version minor
			;;
		"--bug")
			echo "Incrementing Bug Version#"
      npm --no-git-tag-version --allow-same-version version patch
			;;
	esac
done

NEWVERSION=$(grep '"version"' package.json | cut -d '"' -f 4)

NEWTAG="release-v$NEWVERSION"
BRANCH="production-${NEWTAG}"

echo "Adding Tag: $NEWTAG";

git branch -m "$BRANCH" && \

git add package.json package-lock.json && \
git commit -m "Bump! $NEWTAG" && \
# git tag -a "$NEWTAG" -m "Production ${NEWTAG}" && \
git push origin --follow-tags "$BRANCH" && \

echo "Don't forget to Approve the deploy to the production environment!"

