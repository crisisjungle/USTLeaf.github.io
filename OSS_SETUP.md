# OSS 凭证与部署说明

当前部署版本直接读取仓库里的角色配置文件，不再加载 `oss-local-config.js`。

当前会被页面直接加载的文件是：

- `js/oss-public-config.js`
- `js/oss-student-config.js`
- `admin/js/oss-public-config.js`
- `admin/js/oss-admin-config.js`

角色分工：

- `public`：公开页读取 `published/data/` 和 `published/photos/`
- `student`：学生端写入 `submissions/data/` 和 `submissions/photos/`
- `admin`：后台读写 `submissions/`、`published/`、`rejected/`

部署提醒：

- 这些配置属于前端静态文件，部署后浏览器可见
- 如果继续走 `git push -> 自动部署`，那凭证本质上就是公开的
- 真正安全的做法仍然是把上传和审核改到后端

历史数据迁移：

- 打开 `admin/index.html`
- 确认后台能正常读取 OSS
- 点击“迁移历史公开数据”
- 旧的 `data/` 和 `photos/` 会复制到新的 `published/` 目录
- 迁移不会自动删除旧对象
