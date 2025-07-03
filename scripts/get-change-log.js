#!/usr/bin/env node
// Script to create an html file of all the commits between two git tags
// First step: get first commit hash of the year ($first)
// Second step: get last commit hash of the year ($last)
// Third step: node get-change-log.js --from=$first --to=$last
// A file called changelog-$year.html is created

import process from "node:process";
const { exec } = require('child_process');
const fs = require('fs');
const { parseArgs } = require('node:util');

const args = process.argv;
const options = {
  from: {
    type: 'string',
  },
  to: {
    type: 'string',
  },
};
const { values } = parseArgs({
  args,
  options,
  allowPositionals: true,
});

let year = new Date().getFullYear();

function parseGitLog(log) {
  let table = `<table><thead><tr><th>Commit</th><th>Datum</th><th>Issue</th><th>Ticket</th><th>PR</th></tr></thead><tbody>`;
  const prReg = /\(#(\d+)\)/g;
  const ticketReg = /MIJN-(\d{4,})/gi; // Mijn-9064
  const logs = log.split('\n');

  logs.forEach((log, index) => {
    const [commitHash, date, commit] = log.split('|');
    const prMatches = commit?.match(prReg);
    const ticketMatches = commit?.match(ticketReg);

    if (index === 0) {
      year = new Date(date).getFullYear();
    }

    table += `<tr>`;
    table += `<td><a href="https://github.com/Amsterdam/mijn-amsterdam-frontend/commit/${commitHash}">${commitHash}</a></td>`;
    table += `<td>${date}</td>`;
    table += `<td>${commit?.replace(prReg, '')}</td>`;

    table += `<td>`;
    if (ticketMatches?.length) {
      ticketMatches.forEach((ticket) => {
        table += `<a href="https://gemeente-amsterdam.atlassian.net/browse/${ticket.toUpperCase()}">${ticket.toUpperCase()}</a>\n`;
      });
    }
    table += `</td>`;

    table += `<td>`;
    if (prMatches?.length) {
      prMatches.forEach((pr) => {
        table += `<a href="https://github.com/Amsterdam/mijn-amsterdam-frontend/pull/${pr.replace(/[^\d]/g, '')}">${pr}</a>\n`;
      });
    }
    table += `</td>`;
  });

  table += `</table>`;
  return table;
}

exec(
  `git log --date=iso --pretty=format:"%h | %ad | %s" ${values.from}..${values.to} --reverse --date-order | cat; echo`,
  (error, stdout, stderr) => {
    const table = parseGitLog(stdout);

    fs.writeFile(`changelog-${year}.html`, table, function (err) {
      if (err) return console.log(err);
      console.log(`changelog-${year}.html created`);
    });
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  }
);
