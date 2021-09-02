import path from 'path';
import fse from 'fs-extra';
import parser from 'git-ignore-parser';
import ignore from 'ignore';

export default function (baseDir: string) {
  const toolCachePath = process.env.TOOL_CACHE_PATH || '.s';
  const ignoreFileName = process.env.IGNORE_FILE_NAME || '.fcignore';
  const ignoredFile = ['.git', '.svn', '.env', '.DS_Store', 'node_modules', toolCachePath];
  const ignoreFilePath = path.join(baseDir, ignoreFileName);

  let fileContent = '';
  if (fse.existsSync(ignoreFilePath)) {
    fileContent = fse.readFileSync(`${baseDir}/.funignore`, 'utf8');
  }
  const ignoredPaths = parser(`${ignoredFile.join('\n')}\n${fileContent}`);
  const ig = ignore().add(ignoredPaths);
  return function (f) {
    const relativePath = path.relative(baseDir, f);
    if (relativePath === '') { return false; }
    return ig.ignores(relativePath);
  };
}
