export default function ignores(baseDir: string, options?: {
    ignoreRelativePath?: string;
}): (f: any) => boolean;
