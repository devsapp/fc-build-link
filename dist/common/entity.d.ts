export interface InputProps {
    props: IProps;
    credentials: any;
    appName: string;
    project: {
        component: string;
        access: string;
        projectName: string;
    };
    command: string;
    args: string;
    argsObj: any;
    path: {
        configPath: string;
    };
}
export interface IProps {
    codeUri: string;
    serviceName: string;
    functionName: string;
    excludeFiles?: string[];
}
