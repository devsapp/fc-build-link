declare type ISourceFileType = 'other' | 'file' | 'dir' | 'symbolicLink';
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
    options: {
        [key: string]: any;
    };
    constructor(configDirPath: string, codeUri: string, artifactPath: string, buildFilesListJSONPath: string, excludeFiles?: string[]);
    startGenerateLink(): Promise<void>;
    protected walkDir(sourceDirPath: string, lastBuildFiles: IBuildFile): Promise<IBuildFile>;
    protected filter(source: string): boolean;
    protected initBuildArtifactDir(artifactPath: string): void;
    /**
     * 获取文件类型
     * @param artifactPath 文件路径
     * @returns 找不到返回空，文件返回 file，文件夹返回 dir，软链返回 symbolicLink，剩余类型返回为 other
     */
    protected getFileType(artifactPath: string): ISourceFileType;
    protected readFileJSON(filepath: string): any;
}
export {};
