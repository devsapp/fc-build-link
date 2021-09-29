import path from "path";

const BUILDARTIFACTS = path.join('.s', 'build', 'artifacts');

export function getArtifactPath(baseDir: string, serviceName: string, functionName: string) {
  const rootArtifact = path.join(baseDir, BUILDARTIFACTS);
  return path.join(rootArtifact, serviceName, functionName);
}

export function getBuildFilesListJSONPath(baseDir: string, serviceName: string, functionName: string) {
  return path.join(baseDir, '.s', 'fc-build-link', `${serviceName}-${functionName}-files_list.json`);
}

export function getIgnoreFileName() {
  return process.env.IGNORE_FILE_NAME || '.fcignore';
}
