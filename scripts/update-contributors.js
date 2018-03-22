#!/usr/bin/env node

/**
 * This script updates the "contributors" property of the root `package.json`.
 * It modifies `package.json` in place!
 *
 * See `.mailmap` for username/email mappings.
 */

'use strict';

const exec = require('child_process').exec;
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');

// list of authors/emails that should not appear in the contributors list, e.g. bots
const BLACKLIST = [
  'greenkeeperio-bot <support@greenkeeper.io>',
  'greenkeeper[bot] <greenkeeper[bot]@users.noreply.github.com>',
  'TJ Holowaychuk <tj@vision-media.ca>' // author
];

// could use `| sort | uniq` here but didn't want to assume 'nix
exec(
  'git log --format="%aN <%aE>"',
  {
    cwd: ROOT
  },
  (err, res) => {
    if (err) {
      throw err;
    }
    const contributors = Array.from(new Set(res.trim().split(/\r?\n/)))
      .filter(contributor => BLACKLIST.indexOf(contributor) < 0)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    const newCount = contributors.length;
    const pkgFilepath = path.join(ROOT, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgFilepath, 'utf8'));
    const oldCount = pkg.contributors.length;
    if (newCount !== oldCount) {
      pkg.contributors = contributors;
      fs.writeFileSync(pkgFilepath, JSON.stringify(pkg, null, 2));
      if (newCount < oldCount) {
        console.log(
          `WARNING: Reducing contributor count by ${oldCount -
            newCount}! Hopefully it's because you updated .mailmap.`
        );
      } else {
        console.log(
          `Wrote ${newCount - oldCount} new contributors to package.json.`
        );
      }
    } else {
      console.log('No new contributors; nothing to do.');
    }
  }
);
