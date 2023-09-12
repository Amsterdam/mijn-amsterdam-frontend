const child_process = require('child_process');

const RELEASE_MERGE_MESSAGE = 'Bump!';

function executeCommandSync(command) {
  return child_process.execSync(command).toString();
}

const tag = executeCommandSync(
  'git tag -l release-* --sort=-"version:refname"'
).slice(0, 16);
console.log(`Tag ${tag}`);

const commitId = executeCommandSync(`git rev-list -n 1 ${tag}`);
console.log(`commitId ${commitId}`);

const dateOfLastTag = executeCommandSync(
  `git show -s --format=%ci ${commitId}`
);
console.log(`Date of last tag ${dateOfLastTag}`);

const lines = executeCommandSync(
  `git log --pretty="%s %cI" --no-merges --since="${dateOfLastTag}"`
);

const splitLines = lines.trim().split(/(?:\r\n|\r|\n)/g);
const jiraTicketRegex = /(mijn(-| )\d+|bump!)/gi;

splitLines.map((line) => {
  if (line.startsWith(RELEASE_MERGE_MESSAGE)) {
    return; // The release is merged after the release tag is created.
    // So we might (should) encounter the previous release merge commit.
  }

  const match = jiraTicketRegex.exec(line.trim());

  if (!!match) {
    // each line is a commit message since the last release
    console.log(line, match[0]);
  }
});
