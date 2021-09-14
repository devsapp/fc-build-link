import path from 'path';
import * as core from '@serverless-devs/core';
import logger from './common/logger';
import { InputProps } from './common/entity';
import { getArtifactPath, getBuildFilesListJSONPath } from './lib/utils';
import GenerateSymbolicLink from './lib/generate-symbolic-link';

interface IWithProps {
  configDirPath: string;
  codeUri: string;
  serviceName: string;
  functionName: string;
  excludeFiles?: string[];
}

export default class BuildLink {
  /**
   * demo 实例
   * @param inputs
   * @returns
   */
  async link(inputs: InputProps) {
    logger.debug(`input: ${JSON.stringify({ props: inputs.props, args: inputs.args, path: inputs.path })}`);
    return await this.linkWithProps(this.handlerInputs(inputs));
  }

  async linkWithProps(props: IWithProps) {
    const {
      configDirPath,
      codeUri,
      serviceName,
      functionName,
      excludeFiles,
    } = props || {};

    if (!codeUri) throw new Error('The required parameter codeUri was not found');
    if (!serviceName) throw new Error('The required parameter serviceName was not found');
    if (!functionName) throw new Error('The required parameter functionName was not found');

    const vm = core.spinner('Generate symbolic link...');
    try {
      const baseDir = configDirPath || process.cwd();
      const artifactPath = getArtifactPath(baseDir, serviceName, functionName);
      const buildFilesListJSONPath = getBuildFilesListJSONPath(baseDir, serviceName, functionName);
      const generateSymbolicLink = new GenerateSymbolicLink(baseDir, codeUri, artifactPath, buildFilesListJSONPath, excludeFiles);
      await generateSymbolicLink.startGenerateLink();
      vm.stop();
    } catch (ex) {
      vm.fail();
      throw ex;
    }
  }

  private handlerInputs(inputs: InputProps): IWithProps {
    const { configPath } = inputs.path || {};
    const configDirPath = configPath ? path.dirname(configPath) : process.cwd();
    const {
      codeUri,
      serviceName,
      functionName,
      excludeFiles,
    } = inputs.props || {};

    return {
      configDirPath,
      codeUri,
      serviceName,
      functionName,
      excludeFiles,
    }
  }
}
