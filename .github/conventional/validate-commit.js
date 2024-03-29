/* eslint-disable no-console */
/*
 * mrm-preset
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Copied from https://github.com/vuejs/vue-cli/blob/dev/scripts/verifyCommitMsg.js
 */
/* eslint-disable-next-line */
const chalk = require('chalk');

const msgPath = process.env.HUSKY_GIT_PARAMS;

const msg = require('fs')
  .readFileSync(msgPath, 'utf-8')
  .trim();

console.log(`VALIDATE MSN GIT: ${msg}`);

const versionRE = /^(\d+\.)?(\d+\.)?(\*|\d+)$/;
const commitRE = /^(revert: )?(feat|fix|docs|style|refactor|perf|test|workflow|ci|chore|types|build)(\(.+\))?: .{1,50}/;

if (versionRE.test(msg)) {
  return;
}

if (!commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
      'invalid commit message format.',
    )}\n\nMESSAGE: ${msg}\n\n${chalk.red(
      '  Proper commit message format is required for automated changelog generation. Examples:\n\n',
    )}    ${chalk.green('feat(route): add support for prefix')}\n` +
    `    ${chalk.green(
      'fix(model): make primaryKey getter camelcase (close #28)',
    )}\n\n${chalk.red(
      '  See .github/COMMIT_CONVENTION.md for more details.\n',
    )}${chalk.red(
      `  You can also use ${chalk.cyan(
        'npm run commit',
      )} to interactively generate a commit message.\n`,
    )}`,
  );
  process.exit(1);
}
