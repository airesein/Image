# 静态壁纸站（侧边栏导航）

## 数据规则

- 第三方源在 `src/site-data.js` 的 `providers` 配置。
- 分类在 `categories`。
- 每一条图片使用 `id.代称`，例如 `d0c7cb... .cx`、`... .lh`。
- URL 模板支持 `{{id}}`。
- `cover` 为封面，`display` 为展示图，`raw` 为原图。
- `download` 支持：
  - `js`：前端 fetch + blob 下载。
  - `raw`：直接打开原图链接。

## 你的目标目录结构（建议）

如果你想改成“按文件夹 + 0.代称 + readme.md”的纯文件方式，可按如下结构维护，然后写一个构建脚本把它转换为 `site-data.js`：

```txt
data/
  categories/
    动漫/
      0.lh
      readme.md
    风景/
      0.cx
      0.dt
      readme.md
```

当前仓库提供了可直接运行的静态版本（纯前端）。
