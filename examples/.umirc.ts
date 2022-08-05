import OSSConfig from './oss.json';

// TODO:publicPath
export default {
  npmClient: 'yarn',
  publicPath: 'https://umi-test.oss-cn-hangzhou.aliyuncs.com/umi-test/',
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
