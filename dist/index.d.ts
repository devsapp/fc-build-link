import { InputProps } from './common/entity';
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
    link(inputs: InputProps): Promise<void>;
    linkWithProps(props: IWithProps): Promise<void>;
    private handlerInputs;
}
export {};
