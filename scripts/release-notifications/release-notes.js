const child_process = require('child_process');
const { getReleaseCardJson } = require('./card');
const { sendTeamsMessage } = require('./teams');

const RELEASE_MERGE_MESSAGE = 'Bump!';

// Small wrapper
function executeCommandSync(command) {
  return child_process.execSync(command).toString();
}

function getDateDiff(date1, date2 = new Date()) {
  if (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  ) {
    return `Sinds vandaag in main`;
  }

  //Set hours, minutes and seconds to zero
  date1.setHours(0, 0, 0, 0);
  date2.setHours(0, 0, 0, 0);

  const t2 = date2.getTime(); //Get time in milliseconds.
  const t1 = date1.getTime();

  //Subtract and divide by 1 day (in milliseconds)
  const diff = parseInt((t2 - t1) / (24 * 3600 * 1000), 10);

  return `Sinds ${diff} ${diff > 1 ? 'dagen' : 'dag'} in main`;
}

function getChangesSinceLastRelease() {
  const tag = executeCommandSync(
    'git tag -l release-* --sort=-"version:refname"'
  ).slice(0, 16);
  console.log(`Latest release tag found: ${tag}`);

  const commitId = executeCommandSync(`git rev-list -n 1 ${tag}`);

  const dateOfLastTag = executeCommandSync(
    `git show -s --format=%ci ${commitId}`
  );
  console.log(`Date of last tag: ${dateOfLastTag}`);

  const lines = executeCommandSync(
    `git log --pretty="%s %cI" --no-merges --since="${dateOfLastTag}"`
  );

  const splitLines = lines.trim().split(/(?:\r\n|\r|\n)/g);
  const jiraTicketRegex =
    /(mijn(-| )\d+|bump!)([\s-]+)([a-zA-Z\s]+)\(#([\d]+)\)/gi;

  return splitLines
    .map((line) => {
      if (line.startsWith(RELEASE_MERGE_MESSAGE)) {
        return; // The release is merged after the release tag is created.
        // So we might (should) encounter the previous release merge commit.
      }

      const match = jiraTicketRegex.exec(line.trim());

      if (!!match) {
        // each line is a commit message since the last release

        return {
          ticket: match[1].trim().replace(' ', '-'),
          description: match[4],
          pr: match[5],
          date: getDateDiff(new Date(line.slice(-25))),
        };
      }
    })
    .filter(Boolean); // Filter empty entries
}

const changes = getChangesSinceLastRelease();
const cardJson = getReleaseCardJson(changes);
sendTeamsMessage(cardJson, process.env.webhook_host, process.env.webhook_path);
