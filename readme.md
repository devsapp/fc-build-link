## 组件说明

用于生成指定文件夹的软链。

## 具体用法

此组件有两种使用方式：

1. 通过和其他组件相同的调用方式，直接通过 yaml，然后执行 s link 就可以，props 的参数有

```
props:
  codeUri: 代码的路径
  serviceName: 服务名称
  functionName: 函数名称
  excludeFiles:
    - 需要 ignore 的文件或者文件夹
```

2. 第二种方式是获取一个入口函数实例，然后直接调用 linkWithProps 方法，参数是一个对象，具体值为

```
interface IWithProps {
  configDirPath: string; // yaml 配置的路径，也是软链生成的目标地址
  codeUri: string;
  serviceName: string;
  functionName: string;
  excludeFiles?: string[];
}
```

### s cli 方式

```
s link
```

### 应用编排使用方式

查看 example 下 s.yaml
