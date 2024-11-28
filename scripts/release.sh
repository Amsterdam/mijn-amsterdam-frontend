#!/bin/bash

set -e

BRANCH="production-release"

git fetch origin && \
git fetch origin -t && \
git checkout -b "$BRANCH" origin/main && \

echo "Fetched origin, created release-branch."

NEW_TAG_D="-1"
NEW_TAG=$NEW_TAG_D

if [ $# -eq 0 ]; then
    echo "No arguments provided"
    exit 1
fi

for cmd in "$@"
do
	case $cmd in
		"--major")
			echo "Incrementing Major Version"
      NEW_TAG=$(./scripts/semver.sh -v major)
			;;
		"--minor")
			echo "Incrementing Minor Version"
      NEW_TAG=$(./scripts/semver.sh -v minor)
			;;
		"--patch")
			echo "Incrementing Patch Version"
      NEW_TAG=$(./scripts/semver.sh -v patch)
			;;
        *)
            echo "No version specified"
            ;;
	esac
done

if [ $NEW_TAG == $NEW_TAG_D ]; then
exit 1
fi

RELEASE_BRANCH="${BRANCH}-v${NEW_TAG}" && \

echo "Creating branch $RELEASE_BRANCH" && \
git branch -m "$RELEASE_BRANCH" && \

echo "New tag: release-v${NEW_TAG}" && \
git tag -a "release-v${NEW_TAG}" -m "Production ${NEW_TAG}" && \

echo "Pushing branch $RELEASE_BRANCH" && \
git push origin --follow-tags "$RELEASE_BRANCH" && \

exit 0
