import path from "path";

const BUILDARTIFACTS = path.join('.s', 'build', 'artifacts');

export function getArtifactPath(baseDir: string, serviceName: string, functionName: string) {
  const rootArtifact = path.join(baseDir, BUILDARTIFACTS);
  return path.join(rootArtifact, serviceName, functionName);
}
