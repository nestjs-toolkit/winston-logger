import { Format } from 'logform';
import bare from 'cli-color/bare';
import * as clc from 'cli-color';
import { format } from 'winston';
import safeStringify from 'fast-safe-stringify';
import { detailedDiff, updatedDiff } from 'deep-object-diff';

const nestLikeColorScheme: Record<string, bare.Format> = {
  error: clc.red,
  debug: clc.magentaBright,
  warn: clc.yellow,
  data: clc.magenta,
  http: clc.blueBright,
  info: clc.greenBright,
  verbose: clc.cyanBright,
};

const formatGqlError = ({ metadata }: any): string => {
  const gql =
    metadata.properties && metadata.properties.gql
      ? metadata.properties.gql
      : {};
  return [
    null,
    clc.yellow(`GQL ${gql.operation} ${gql.operationName}:`),
    gql.query,
    `VARIABLES: ${JSON.stringify(gql.variables)}`,
    null,
    clc.red('EXTENSIONS:'),
    JSON.stringify(metadata.error.extensions),
    null,
    clc.red('TRACE:'),
    metadata.error.trace,
  ].join('\n');
};

const nestLikeConsoleFormat = (appName = 'NestWinston'): Format =>
  format.printf(({ context, level, timestamp, message, ...meta }) => {
    const color =
      nestLikeColorScheme[level] || ((text: string): string => text);

    const customMessage =
      message && typeof message === 'object' ? message['message'] : message;

    let strMeta;
    if (meta.metadata && meta.metadata.kind === 'GQL_ERROR') {
      strMeta = formatGqlError(meta);
    } else {
      strMeta = safeStringify(meta);
    }

    return (
      `${color(`[${appName}]`)} ` +
      `${clc.yellow(level.charAt(0).toUpperCase() + level.slice(1))}\t` +
      ('undefined' !== typeof timestamp
        ? `${new Date(timestamp).toLocaleString()} `
        : '') +
      ('undefined' !== typeof context
        ? `${clc.yellow('[' + context + ']')} `
        : '') +
      `${color(customMessage)} - ` +
      `${strMeta}`
    );
  });

export type DetailedDiffOldType = {
  added: Record<string, any>;
  deleted: Record<string, any>;
  updated: Record<string, any>;
  old: Record<string, any>;
};

const detailedDiffOld = (oldData, newData): DetailedDiffOldType => {
  const diff: any = detailedDiff(oldData, newData);
  diff.old = {};

  Object.keys(diff.updated).forEach(k => {
    diff.old[k] = oldData[k];
  });

  return diff;
};

export const nestWinstonUtilities = {
  format: {
    nestLike: nestLikeConsoleFormat,
  },
  diff: {
    updated: updatedDiff,
    detailed: detailedDiffOld,
  },
};
