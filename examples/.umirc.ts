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
