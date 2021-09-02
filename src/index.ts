import path from 'path';
import logger from './common/logger';
import { InputProps } from './common/entity';
import { getArtifactPath } from './lib/utils';
import GenerateSymbolicLink from './lib/generate-symbolic-link';

export default class BuildLink {
  /**
   * demo 实例
   * @param inputs
   * @returns
   */
  async link(inputs: InputProps) {
    logger.debug(`input: ${JSON.stringify({ props: inputs.props, args: inputs.args, path: inputs.path })}`);

    const {
      configDirPath,
      codeUri,
      serviceName,
      functionName,
      excludeFiles,
    } = this.handlerInputs(inputs);

    const artifactPath = getArtifactPath(configDirPath, serviceName, functionName);
    const generateSymbolicLink = new GenerateSymbolicLink(codeUri, artifactPath, excludeFiles);
    await generateSymbolicLink.startGenerateLink();

    return { codeUri, artifactPath };
  }

  private handlerInputs(inputs: InputProps) {
    const { configPath } = inputs.path || {};
    const configDirPath = configPath ? path.dirname(configPath) : process.cwd();
    const {
      codeUri,
      serviceName,
      functionName,
      excludeFiles,
    } = inputs.props || {};

    if (!codeUri) throw new Error('The required parameter codeUri was not found');
    if (!serviceName) throw new Error('The required parameter serviceName was not found');
    if (!functionName) throw new Error('The required parameter functionName was not found');

    return {
      configDirPath,
      codeUri,
      serviceName,
      functionName,
      excludeFiles,
    }
  }
}
