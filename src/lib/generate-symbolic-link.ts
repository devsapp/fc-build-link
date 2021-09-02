import fse from 'fs-extra';
import rimraf from 'rimraf';
import _ from 'lodash';
import logger from '../common/logger';
import ignore from './ignore';
import path from 'path';

export default class GenerateSymbolicLink {
  sourceDir: string;
  targetDir: string;
  excludeFiles: string[];
  ign: (f: any) => boolean;
  options: { [key: string]: any; };

  constructor(codeUri: string, artifactPath: string, excludeFiles?: string[]) {
    this.sourceDir = path.resolve(codeUri);
    this.targetDir = artifactPath;
    this.excludeFiles = excludeFiles;
    this.initBuildArtifactDir(artifactPath);
    this.ign = ignore(this.sourceDir);
  }

  async startGenerateLink() {
    const sourceStat = await this.getFileType(this.sourceDir);
    if (!sourceStat) {
      throw new Error(`Error: ENOENT: no such file or directory, lstat '${this.sourceDir}'`);
    } else if (sourceStat === 'file') {
      logger.error(`The code path ${this.sourceDir} points to the file, skip generating the soft link`);
    } else if (sourceStat === 'dir') {
      await this.onDir(this.sourceDir);
    } else if (sourceStat === 'symbolicLink') {
      console.log('is link');
    }
    // await this.generateLink(this.sourceDir);
  }

  protected async onDir(sourceDirPath: string) {
    const sourceFilenames = await fse.readdir(sourceDirPath);
    const sourceFilterFilenames = sourceFilenames.filter(sourceFile => this.filter(path.join(sourceDirPath, sourceFile)));
    logger.debug(`readdir '${sourceDirPath}': ${sourceFilterFilenames}`);

    const targetDirPath = sourceDirPath.replace(this.sourceDir, this.targetDir);

    // 确保文件夹存在
    const targetType = this.getFileType(targetDirPath);
    if (!targetType || targetType !== 'dir') {
      rimraf.sync(targetDirPath);
      fse.mkdirpSync(targetDirPath);
    }

    // 处理代码，重新生成软链或者移除空的软链
    for (const filename of sourceFilterFilenames) {
      const sourceFilePath = path.join(sourceDirPath, filename);
      const targetFilePath = path.join(targetDirPath, filename);

      const sourceFileType = this.getFileType(sourceFilePath);
      if (sourceFileType === 'dir') {
        await this.onDir(sourceFilePath);
      } else {
        rimraf.sync(targetFilePath);
        fse.symlinkSync(sourceFilePath, targetFilePath);
      }
    }

    // 清理已经删除的文件
    const targetFiles = await fse.readdir(targetDirPath);
    const deletedTargetFiles = targetFiles.filter(targetFilename => !sourceFilterFilenames.includes(targetFilename));
    deletedTargetFiles.forEach(targetFilename => rimraf.sync(path.join(targetDirPath, targetFilename)));
  }

  protected filter(source: string) {
    // skip copying any ignored files in sourceDir 
    if (this.ign && this.ign(source)) return false;

    if (this.excludeFiles) {
      if (_.some(this.excludeFiles, (rule) => source.endsWith(rule))) return false;
    }

    return true;
  }

  protected initBuildArtifactDir(artifactPath: string): void {
    logger.debug(`Build save url: ${artifactPath}`);

    const artifactPathType = this.getFileType(artifactPath);
    if (!artifactPathType) {
      return fse.mkdirpSync(artifactPath);
    }

    if (artifactPathType === 'dir') {
      fse.removeSync(artifactPath);
      fse.mkdirpSync(artifactPath);
    }
  }

  protected getFileType(artifactPath: string): undefined | 'file' | 'dir' | 'symbolicLink' {
    // 如果存在的是软链接，fse.pathExists 返回也是 false，但是创建这个目录也是失败的
    try {
      const stat = fse.lstatSync(artifactPath);
      if (stat.isFile()) {
        return 'file';
      } else if (stat.isDirectory()) {
        return 'dir';
      } else if (stat.isSymbolicLink()) {
        return 'symbolicLink';
      }
    } catch (ex) {
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
    }
  }
}
