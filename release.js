const child_process = require('child_process');

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

console.log(lines);
