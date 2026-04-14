# OSS 凭证与部署说明

这个仓库现在按角色拆分了 OSS 配置。当前仓库内已经放回了可直接部署的前端配置，但它本质上仍然是浏览器可见的静态凭证。

上线前有两种方式：

- 方式 A：直接改仓库里的占位符文件
- 方式 B：推荐，本地新建被忽略的覆盖文件

推荐使用方式 B，这样仓库可以安全 push。

主站本地覆盖文件：

- `js/oss-local-config.js`

后台本地覆盖文件：

- `admin/js/oss-local-config.js`

这两个文件已经被 `.gitignore` 忽略。

仓库内的基础配置文件分别是：

- `js/oss-public-config.js`
  - 主站公开读取 `published/` 内容
- `js/oss-student-config.js`
  - 学生端只允许写入 `submissions/`
- `admin/js/oss-admin-config.js`
  - 审核后台可读写 `submissions/`、`published/`、`rejected/`

建议的权限边界：

- `public`：只读 `published/data/` 和 `published/photos/`
- `student`：只写 `submissions/data/` 和 `submissions/photos/`
- `admin`：读写 `submissions/`、`published/`、`rejected/`

部署建议：

- 主站继续部署静态页面
- `admin/` 单独部署为另一个静态站点
- 在 CDN / hosting 层为 `admin/` 增加密码保护或访问白名单

历史数据迁移：

- 部署后台后，打开 `admin/index.html`
- 配好 `admin` 与 `public` 配置
- 点击“迁移历史公开数据”
- 旧的 `data/` / `photos/` 会复制到新的 `published/` 目录，不会自动删除旧对象

本地覆盖文件示例：

```js
(function () {
    window.USTLeafOSSConfigs = window.USTLeafOSSConfigs || {};

    window.USTLeafOSSConfigs.public = {
        region: 'your-region',
        bucket: 'your-bucket',
        accessKeyId: 'your-key-id',
        accessKeySecret: 'your-key-secret',
        secure: true
    };

    window.USTLeafOSSConfigs.student = {
        region: 'your-region',
        bucket: 'your-bucket',
        accessKeyId: 'your-key-id',
        accessKeySecret: 'your-key-secret',
        secure: true
    };
})();
```
