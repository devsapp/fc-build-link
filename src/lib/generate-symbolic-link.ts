import fse from 'fs-extra';
import rimraf from 'rimraf';
import _ from 'lodash';
import path from 'path';
import ignore from './ignore';
import logger from '../common/logger';
import { getIgnoreFileName } from './utils';

type ISourceFileType = 'other' | 'file' | 'dir' | 'symbolicLink';

interface IBuildFile {
  [key: string]: IFileAttributes;
}

interface IFileAttributes {
  sourceFileType: ISourceFileType;
  buildFileType: 'dir' | 'symbolicLink';
  sourcePath?: string;
  children?: IBuildFile;
}

export default class SymbolicLinkGenerator {
  sourceDir: string;
  buildDir: string;
  buildFilesListJSONPath: string;
  excludeFiles: string[];
  ign: (f: any) => boolean;
  options: { [key: string]: any; };

  constructor(configDirPath: string, codeUri: string, artifactPath: string, buildFilesListJSONPath: string, excludeFiles?: string[]) {
    this.sourceDir = path.resolve(codeUri);
    this.buildDir = artifactPath;
    this.excludeFiles = excludeFiles;
    this.buildFilesListJSONPath = buildFilesListJSONPath;
    this.initBuildArtifactDir(artifactPath);
    const ignoreFileInCodeUri: string = path.join(this.sourceDir, getIgnoreFileName());
    if (this.getFileType(ignoreFileInCodeUri) === 'file') {
      logger.debug(`CodeUri has ignore file: ${ignoreFileInCodeUri}`);
      this.ign = ignore(this.sourceDir);
    } else {
      const ignoreRelativePath = path.resolve(configDirPath, codeUri);
      logger.debug(`ignore path: ${ignoreRelativePath}`);
      this.ign = ignore(path.resolve(configDirPath), { ignoreRelativePath });
    }
  }

  async startGenerateLink() {
    const sourceStat = await this.getFileType(this.sourceDir);
    if (!sourceStat) {
      throw new Error(`Error: ENOENT: no such file or directory, lstat '${this.sourceDir}'`);
    } else if (sourceStat !== 'dir') {
      logger.error(`The code path ${this.sourceDir} does not point to a folder, skip generating soft links`);
    } else {
      const lastBuildDocument = this.readFileJSON(this.buildFilesListJSONPath);

      const currentBuildDirFiles = await this.walkDir(this.sourceDir, lastBuildDocument);

      fse.outputFileSync(this.buildFilesListJSONPath, JSON.stringify(currentBuildDirFiles, null, 2));
    }
  }

  protected async walkDir(sourceDirPath: string, lastBuildFiles: IBuildFile): Promise<IBuildFile> {
    // 记录 build 的目录结构
    const currentBuildDirFiles: IBuildFile = {};

    // 遍历代码目录，并忽略需要忽略的文件
    const sourceFilenames = await fse.readdir(sourceDirPath);
    const sourceFilterFilenames = sourceFilenames.filter(sourceFile => this.filter(path.join(sourceDirPath, sourceFile)));
    logger.debug(`readdir '${sourceDirPath}': ${sourceFilterFilenames}`);

    // build 目录映射路径
    const buildDirPath = sourceDirPath.replace(this.sourceDir, this.buildDir);

    // 确保是文件夹并且存在，包括空文件夹
    if (this.getFileType(buildDirPath) !== 'dir') {
      rimraf.sync(buildDirPath);
      fse.mkdirpSync(buildDirPath);
    }

    // 遍历需要生成软链的文件列表
    for (const filename of sourceFilterFilenames) {
      // 获取到源代码路径，以及源代码文件类型
      const sourceFilePath = path.join(sourceDirPath, filename);
      const sourceFileType = this.getFileType(sourceFilePath);

      // 读取上次 build 记录的文件属性，然后从源数据删除
      const filenameLastBuild = lastBuildFiles?.[filename];
      filenameLastBuild && delete lastBuildFiles[filename];

      // 记录本次 build 的文件属性
      const currentDeliveryFile: IFileAttributes = {
        sourceFileType,
        buildFileType: 'symbolicLink',
        sourcePath: sourceFilePath,
      };

      // 如果是文件夹，递归遍历
      if (sourceFileType === 'dir') {
        currentDeliveryFile.buildFileType = 'dir';
        currentDeliveryFile.children = await this.walkDir(sourceFilePath, filenameLastBuild?.children || {});

        // 判断之前是否生成过软链，如果没有生成过软链，则尝试删除之前遗留的文件，然后创建一个软链
      } else if (_.isEmpty(filenameLastBuild) || filenameLastBuild.buildFileType !== 'symbolicLink') {
        const buildFilePath = path.join(buildDirPath, filename);
        rimraf.sync(buildFilePath);
        fse.symlinkSync(sourceFilePath, buildFilePath, 'junction');
      }
      currentBuildDirFiles[filename] = currentDeliveryFile;
    }

    // 经过上面的遍历， lastBuildDocument 剩下的属性是多余的软链，需要删除
    Object.keys(lastBuildFiles).forEach(buildFilename => rimraf.sync(path.join(buildDirPath, buildFilename)));

    // 将数据返回
    return currentBuildDirFiles;
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
  }

  /**
   * 获取文件类型
   * @param artifactPath 文件路径
   * @returns 找不到返回空，文件返回 file，文件夹返回 dir，软链返回 symbolicLink，剩余类型返回为 other
   */
  protected getFileType(artifactPath: string): ISourceFileType {
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
      return 'other';
    } catch (ex) {
      if (ex.code !== 'ENOENT') {
        throw ex;
      }
    }
  }

  protected readFileJSON(filepath: string) {
    try {
      return fse.readJSONSync(filepath);
    } catch (ex) {
      logger.debug(`${ex.code}, ${ex.message}`);
    }
    return {};
  }
}
