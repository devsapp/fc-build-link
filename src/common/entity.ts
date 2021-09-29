export interface InputProps {
  props: IProps; // 用户自定义输入
  credentials: any; // 用户秘钥
  appName: string; // 
  project: {
    component: string; // 组件名（支持本地绝对路径）
    access: string; // 访问秘钥名
    projectName: string; // 项目名
  };
  command: string; // 执行指令
  args: string; // 命令行 扩展参数
  argsObj: any;
  path: {
    configPath: string // 配置路径
  }
}

export interface IProps {
  codeUri: string;
  serviceName: string;
  functionName: string;
  excludeFiles?: string[];
}
