import path from 'path';
import fse from 'fs-extra';
import parser from 'git-ignore-parser';
import ignore from 'ignore';
import _ from 'lodash';
import logger from '../common/logger';
import { getIgnoreFileName } from './utils';

export default function ignores(baseDir: string, options?: { ignoreRelativePath?: string }) {
  const toolCachePath = process.env.TOOL_CACHE_PATH || '.s';
  const ignoreFileName = getIgnoreFileName();

  const ignoredFile = ['.git', '.svn', '.env', '.DS_Store', 'node_modules', 's.yaml', 's.yml', ignoreFileName, toolCachePath];
  const ignoreFilePath = path.join(baseDir, ignoreFileName);

  let fileContent = '';
  if (fse.existsSync(ignoreFilePath)) {
    fileContent = fse.readFileSync(ignoreFilePath, 'utf8');

    // 对于和 s.yaml 相同的 ignore 文件，需要将内容转化到指向的目录
    if (!_.isNil(options?.ignoreRelativePath)) {
      fileContent = parser(fileContent).map(fileLine => path.relative(options.ignoreRelativePath, fileLine)).join('\n');
    }
  }

  const ignoredPaths = parser(`${ignoredFile.join('\n')}\n${fileContent}`);
  logger.debug(`ignoredPaths: ${ignoredPaths}`);

  const ig = ignore().add(ignoredPaths);
  const ignoredBaseDir = options?.ignoreRelativePath || baseDir;
  return function (f) {
    const relativePath = path.relative(ignoredBaseDir, f);
    if (relativePath === '') { return false; }
    return ig.ignores(relativePath);
  };
}
