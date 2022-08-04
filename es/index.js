function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import OSS from 'ali-oss';
import fs from 'fs';
const KEY = 'aliyunoss';
const PLUGIN_NAME = 'umi-plugin-aliyunoss';

/**
 * @description: 默认配置
 * @return {*}
 */
export const defaultConfigOptions = {
  oss: {
    accessKeyId: '',
    accessKeySecret: ''
  },
  options: {
    projectPath: '',
    ignoreHtml: true,
    // 不上传html
    exclude: /.DS_Store/ // 排除文件

  }
};
/**
 * @description: 默认配置
 * @param {IApi} api
 * @return {*}
 */

const PluginOptions = api => _objectSpread(_objectSpread({}, defaultConfigOptions.options), api.userConfig[KEY].options || {});
/**
 * @description: 默认oss配置
 * @param {IApi} api
 * @return {*}
 */


const OSSOptions = api => _objectSpread(_objectSpread({}, defaultConfigOptions.oss), api.userConfig[KEY].oss || {});
/**
 * @description: 判断文件是否需要忽略
 * @param {string} filePath
 * @param {IApi} api
 * @return {*}
 */


const filterFile = (filePath, api) => {
  let _PluginOptions = PluginOptions(api),
      _PluginOptions$exclud = _PluginOptions.exclude,
      exclude = _PluginOptions$exclud === void 0 ? defaultConfigOptions.options.exclude : _PluginOptions$exclud,
      _PluginOptions$ignore = _PluginOptions.ignoreHtml,
      ignoreHtml = _PluginOptions$ignore === void 0 ? defaultConfigOptions.options.ignoreHtml : _PluginOptions$ignore;

  let regs = [exclude];

  if (ignoreHtml) {
    regs.push(/\/*.html/);
  }

  return regs.some(item => item.test(filePath));
};
/**
 * @description: 读取构建完成之后的文件夹
 * @param {string} path
 * @param {IApi} api
 * @return {*}
 */


const readBuildFilesSync = (path, api) => {
  let uploadFiles = [];

  if (!path) {
    api.logger.error(`[${PLUGIN_NAME}]: 😞 构建输出路径不能为空！`);
    return [];
  }

  if (!fs.existsSync(path)) {
    api.logger.error(`[${PLUGIN_NAME}]: 😞 没有找到构建输出地址，请检查构建文件输出地址是否正确: ${path} `);
    return [];
  }

  fs.readdirSync(path).forEach(name => {
    let filePath = `${path}/${name}`;

    if (fs.statSync(filePath).isDirectory()) {
      uploadFiles = uploadFiles.concat(readBuildFilesSync(filePath, api));
    } else if (!filterFile(filePath, api)) {
      uploadFiles.push(filePath);
    }
  });
  return uploadFiles;
};
/**
 * @description: 上传文件
 * @param {string} files
 * @param {OSS} oss
 * @param {UmiPluginOptions} options
 * @param {IApi} api
 * @return {*}
 */


const uploadFiles = (files, oss, options, api) => {
  const ossClient = new OSS(oss); //oss客户端

  const start = Date.now(); //开始时间

  const promises = files.map(file => {
    return ossClient.put(file.replace(api.paths.absOutputPath, options.projectPath || defaultConfigOptions.options.projectPath), file);
  });
  return Promise.all(promises).then(results => {
    if (Array.isArray(results)) {
      results.forEach(({
        name,
        url
      }) => {
        api.logger.info(`[${PLUGIN_NAME}]: 🍉 文件上传成功，文件名：${name} ，地址为: ${url}\n`);
      });
    }

    return Date.now() - start;
  });
};

export default (api => {
  api.describe({
    key: KEY,
    config: {
      schema(joi) {
        return joi.object();
      }

    },
    enableBy: api.EnableBy.config
  });
  api.onBuildComplete( /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(function* ({
      err
    }) {
      if (!err) {
        const options = PluginOptions(api);
        const oss = OSSOptions(api);

        if (options.projectPath && (!options.projectPath.startsWith('/') || options.projectPath.endsWith('/'))) {
          api.logger.error(`[${PLUGIN_NAME}]: 😞 projectPath 必须以'/'开头，且不能以'/'结尾！\n`);
          process.exit(-1);
        }

        api.logger.info(`[${PLUGIN_NAME}]: 🤗 构建完成，即将开始上传到阿里云OSS\n`);
        const files = readBuildFilesSync(api.paths.absOutputPath, api);

        if (files.length === 0) {
          api.logger.warn(`[${PLUGIN_NAME}]: 😔 没有需要上传到阿里云OSS的文件\n`);
        } else {
          api.logger.info(`[${PLUGIN_NAME}]: 😁 待上传阿里云OSS文件总数：${files.length}\n`);
        }

        try {
          const res = yield uploadFiles(files, oss, options, api);
          api.logger.info(`[${PLUGIN_NAME}]: 🎉  全部文件上传成功，共耗时：${(res / 1000).toFixed(2)}s \n`);
        } catch (error) {
          api.logger.error(`[${PLUGIN_NAME}]: 😞 上传阿里云OSS失败，请检查错误信息！\n`);
          api.logger.error(error);
        }
      } else {
        api.logger.error(`[${PLUGIN_NAME}]: 😞 构建失败！\n`);
      }
    });

    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());
});