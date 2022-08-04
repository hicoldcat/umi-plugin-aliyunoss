import { IApi } from 'umi';
import OSS, { PutObjectResult } from 'ali-oss';
import fs from 'fs';

const KEY = 'aliyunoss';
const PLUGIN_NAME = 'umi-plugin-aliyunoss'

export interface UmiPluginOptions {
    ignoreHtml?: boolean; // 不上传html
    projectPath?: string;// 项目文件夹地址
    exclude?: RegExp; // 排除的文件
}

export interface UmiPluginAliyunOssOptions {
    oss: OSS.Options;
    options: UmiPluginOptions;
}

/**
 * @description: 默认配置
 * @return {*}
 */
export const defaultConfigOptions: UmiPluginAliyunOssOptions = {
    oss: {
        accessKeyId: '',
        accessKeySecret: '',
    },
    options: {
        projectPath: '',
        ignoreHtml: true,// 不上传html
        exclude: /.DS_Store/, // 排除文件
    }
}

/**
 * @description: 默认配置
 * @param {IApi} api
 * @return {*}
 */
const PluginOptions = (api: IApi): UmiPluginOptions => ({
    ...defaultConfigOptions.options,
    ...(api.userConfig[KEY].options || {})
});

/**
 * @description: 默认oss配置
 * @param {IApi} api
 * @return {*}
 */
const OSSOptions = (api: IApi): OSS.Options => ({ ...defaultConfigOptions.oss, ...(api.userConfig[KEY].oss || {}) });

/**
 * @description: 判断文件是否需要忽略
 * @param {string} filePath
 * @param {IApi} api
 * @return {*}
 */
const filterFile = (filePath: string, api: IApi): boolean => {
    let { exclude = defaultConfigOptions.options.exclude!, ignoreHtml = defaultConfigOptions.options.ignoreHtml! } = PluginOptions(api);
    let regs: RegExp[] = [exclude];
    if (ignoreHtml) {
        regs.push(/\/*.html/);
    }
    return regs.some((item: RegExp) => item.test(filePath));
}

/**
 * @description: 读取构建完成之后的文件夹
 * @param {string} path
 * @param {IApi} api
 * @return {*}
 */
const readBuildFilesSync = (path: string, api: IApi): string[] => {
    let uploadFiles: string[] = [];
    if (!path) {
        api.logger.error(`[${PLUGIN_NAME}]: 😞 构建输出路径不能为空！`);
        return [];
    }
    if (!fs.existsSync(path)) {
        api.logger.error(`[${PLUGIN_NAME}]: 😞 没有找到构建输出地址，请检查构建文件输出地址是否正确: ${path} `);
        return [];
    }
    fs.readdirSync(path).forEach((name: string) => {
        let filePath = `${path}/${name}`;
        if (fs.statSync(filePath).isDirectory()) {
            uploadFiles = uploadFiles.concat(readBuildFilesSync(filePath, api));
        } else if (!filterFile(filePath, api)) {
            uploadFiles.push(filePath);
        }
    })
    return uploadFiles;
}


/**
 * @description: 上传文件
 * @param {string} files
 * @param {OSS} oss
 * @param {UmiPluginOptions} options
 * @param {IApi} api
 * @return {*}
 */
const uploadFiles = (files: string[], oss: OSS.Options, options: UmiPluginOptions, api: IApi): Promise<number> => {
    const ossClient = new OSS(oss);//oss客户端
    const start = Date.now();//开始时间
    const promises = files.map((file: string) => {
        return ossClient.put(file.replace(api.paths.absOutputPath, options.projectPath || defaultConfigOptions.options.projectPath!), file);
    });
    return Promise.all(promises).then((results) => {
        if (Array.isArray(results)) {
            results.forEach(({ name, url }: PutObjectResult) => {
                api.logger.info(`[${PLUGIN_NAME}]: 🍉 文件上传成功，文件名：${name} ，地址为: ${url}\n`);
            });
        }
        return Date.now() - start;
    });
}

export default (api: IApi) => {
    api.describe({
        key: KEY,
        config: {
            schema(joi) {
                return joi.object();
            },
        },
        enableBy: api.EnableBy.config
    });
    api.onBuildComplete(async ({ err }) => {
        if (!err) {
            const options = PluginOptions(api);
            const oss = OSSOptions(api);
            if (options.projectPath && (!options.projectPath.startsWith('/') || options.projectPath.endsWith('/'))) {
                api.logger.error(`[${PLUGIN_NAME}]: 😞 projectPath 必须以'/'开头，且不能以'/'结尾！\n`);
                return process.exit(-1);
            }

            api.logger.info(`[${PLUGIN_NAME}]: 🤗 构建完成，即将开始上传到阿里云OSS\n`);

            const files = readBuildFilesSync(api.paths.absOutputPath, api);

            if (files.length === 0) {
                api.logger.warn(`[${PLUGIN_NAME}]: 😔 没有需要上传到阿里云OSS的文件\n`);
            } else {
                api.logger.info(`[${PLUGIN_NAME}]: 😁 待上传阿里云OSS文件总数：${files.length}\n`);
            }

            try {
                const res: number = await uploadFiles(files, oss, options, api);
                api.logger.info(`[${PLUGIN_NAME}]: 🎉  全部文件上传成功，共耗时：${(res / 1000).toFixed(2)}s \n`);
            } catch (error) {
                api.logger.error(`[${PLUGIN_NAME}]: 😞 上传阿里云OSS失败，请检查错误信息！\n`);
                api.logger.error(error);
            }
        } else {
            api.logger.error(`[${PLUGIN_NAME}]: 😞 构建失败！\n`);
        }
    });
};