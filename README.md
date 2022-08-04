# umi-plugin-aliyunoss

[![NPM version](https://img.shields.io/npm/v/umi-plugin-aliyunoss.svg?style=flat)](https://npmjs.org/package/umi-plugin-aliyunoss)
[![NPM downloads](http://img.shields.io/npm/dm/umi-plugin-aliyunoss.svg?style=flat)](https://npmjs.org/package/umi-plugin-aliyunoss)
[![Build Status](https://img.shields.io/travis/imhele/umi-plugin-aliyunoss.svg?style=flat)](https://travis-ci.org/imhele/umi-plugin-aliyunoss)
[![Coverage Status](https://coveralls.io/repos/github/imhele/umi-plugin-aliyunoss/badge.svg?branch=master)](https://coveralls.io/github/imhele/umi-plugin-aliyunoss?branch=master)
[![License](https://img.shields.io/npm/l/umi-plugin-aliyunoss.svg)](https://npmjs.org/package/umi-plugin-aliyunoss)


>基于 Umi 4.0 开发

一个自动上传[Umi](https://github.com/umijs/umi)项目打包构建完成后的文件到[阿里云OSS](https://www.alibabacloud.com/product/oss)的插件。

## 使用


```sh
$ npm install umi-plugin-aliyunoss --save-dev

or

$ yarn add umi-plugin-aliyunoss --dev

```

在你的umi配置文件 `.umirc.js`或者 `.umirc.ts`或者`config/config.ts`文件中增加如下配置：


```js
import OSSConfig from './oss.json';

export default {
  npmClient: 'yarn',
  aliyunoss: {
    oss: {
      accessKeyId: OSSConfig.accessKeyId,
      accessKeySecret: OSSConfig.accessKeySecret,
      region: OSSConfig.region,
      bucket: OSSConfig.bucket,
      endpoint: OSSConfig.endpoint
    },
    options: {
      ignoreHtml: true,
      projectPath: '/umi-test'
      // exclude: /.css/,
    }
  }
};
```

其中OSSConfig大致如下：

```
{
    "accessKeyId": "******",
    "accessKeySecret": "******",
    "region": "oss-cn-hangzhou",
    "bucket": "umi-test",
    "endpoint": "https://oss-cn-hangzhou.aliyuncs.com"
}
```

具体支持参数可参考下方配置文档。

## 配置项

### aliyunoss

入口配置对象

- 类型：UmiPluginAliyunOssOptions


```ts
interface UmiPluginAliyunOssOptions {
    oss: OSS.Options;
    options: UmiPluginOptions;
}
```

#### aliyunoss.oss

阿里云OSS配置项，可以参考[https://github.com/ali-sdk/ali-oss](https://github.com/ali-sdk/ali-oss)

- 类型：OSS.Options

```ts
interface Options {
    /** access secret you create */
    accessKeyId: string;
    /** access secret you create */
    accessKeySecret: string;
    /** used by temporary authorization */
    stsToken?: string | undefined;
    /** the default bucket you want to access If you don't have any bucket, please use putBucket() create one first. */
    bucket?: string | undefined;
    /** oss region domain. It takes priority over region. */
    endpoint?: string | undefined;
    /** the bucket data region location, please see Data Regions, default is oss-cn-hangzhou. */
    region?: string | undefined;
    /** access OSS with aliyun internal network or not, default is false. If your servers are running on aliyun too, you can set true to save lot of money. */
    internal?: boolean | undefined;
    /** instruct OSS client to use HTTPS (secure: true) or HTTP (secure: false) protocol. */
    secure?: boolean | undefined;
    /** instance level timeout for all operations, default is 60s */
    timeout?: string | number | undefined;
    /** use custom domain name */
    cname?: boolean | undefined;
    /** use time (ms) of refresh STSToken interval it should be less than sts info expire interval, default is 300000ms(5min) when sts info expires. */
    refreshSTSTokenInterval?: number;
    /** used by auto set stsToken、accessKeyId、accessKeySecret when sts info expires. return value must be object contains stsToken、accessKeyId、accessKeySecret */
    refreshSTSToken?: () => Promise<{ accessKeyId: string, accessKeySecret: string, stsToken: string }>;
}
```

注意：`OSS.Options`来自`ali-oss`包。


#### options

插件配置项

- 类型：UmiPluginOptions

```ts
interface UmiPluginOptions {
    // 是否忽略文件中的html文件，默认为: true 。
    ignoreHtml?: boolean; 
    // oss上传的项目文件夹，默认: ""。会上传到bucket根目录下面。如果填写如"/umi-test"，请一定要以"/"开头
    projectPath?: string; 
    // 要上传的文件中，需要忽略上传的文件正则表达式。默认为：/.DS_Store/
    exclude?: RegExp;
}
```
## 示例

进入[examples](https://github.com/hicoldcat/umi-plugin-aliyunoss/tree/master/examples/)目录下，运行项目并通过`npm run build`测试。
