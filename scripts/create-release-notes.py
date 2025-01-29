import sys
import re
from functools import reduce
import argparse

parser = argparse.ArgumentParser(
    description="Create release notes for a github workflow."
)

parser.add_argument("previous_release_tag")
parser.add_argument("latest_release_tag")

args = parser.parse_args()
    
release_notes = sys.stdin.read()
if not release_notes:
    raise Exception("Release notes read from the stdin are empty")

categories = {
    "features": {
        "pattern": re.compile(r'MIJN-[0-9]+-FEATURE', flags=re.IGNORECASE),
        "commits": []
    },
    "chores": {
        "pattern": re.compile(r'MIJN-[0-9]+-CHORE', flags=re.IGNORECASE),
        "commits": []
    },
    "bugs": {
        "pattern": re.compile(r'MIJN-[0-9]+-BUG', flags=re.IGNORECASE),
        "commits": []
    },
}

other = {
    # Must start with a commit hash
    "pattern": re.compile(r'^[a-z\d]+\b'),
    "commits": []
}

# Sort release notes
# ==================
for line in release_notes.split('\n'):
    def identify(acc, category):
        if categories[category]["pattern"].search(line):
            return category
        return acc

    category = reduce(identify, categories, None)

    try:
        categories[category]["commits"].append(line)
    except KeyError:
        if other["pattern"].match(line):
            other["commits"].append(line)

# Format
# ================================
categories["other"] = other

RELEASE_SUFFIX = 'release-'
previous_version = args.previous_release_tag.removeprefix(RELEASE_SUFFIX)
latest_version = args.latest_release_tag.removeprefix(RELEASE_SUFFIX)

# Lines entered here are at the top of the release notes.
release_notes = [
    f"Here are the updates between the {previous_version} and {latest_version} releases.\n",
]

release_notes_size = len(release_notes)

def format_category(acc, category):
    commits = categories[category]["commits"]
    if not commits:
        return acc

    # Add title in markdown.
    acc.append(f"## {category.title()}\n")

    for commit in commits:
        acc.append(commit)

    # Make sure a newline is added after the block of commits.
    acc.append("")

    return acc

release_notes = reduce(format_category, categories, release_notes)
if release_notes_size == len(release_notes):
    raise Exception("Not a single line added to the release notes.")

print('\n'.join(release_notes))

