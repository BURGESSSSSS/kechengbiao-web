# 课程表官网

课程表 Android 应用的产品展示网站，使用 React、TypeScript、Vite 和 Tailwind CSS 构建。

## 本地开发

需要 Node.js 24 和 npm。

```sh
npm ci
npm run dev
```

## 生产构建

```sh
npm run build
npm run preview
```

构建输出为 `dist/`。部署到子目录时可指定路径，例如：

```sh
npm run build -- --base /kechengbiao-web/
npm run preview -- --base /kechengbiao-web/
```

## GitHub Pages

在仓库的 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。
`.github/workflows/deploy.yml` 会在推送到 `main` 时自动安装依赖、检查 TypeScript、构建并部署；也可在 Actions 页面手动运行。
构建路径由 GitHub Pages 配置自动提供，支持仓库子目录与自定义域名。

图片使用 Vite 的 `import.meta.env.BASE_URL`，本地开发与线上子目录部署共用同一份代码。

Android 应用源码与下载：[BURGESSSSSS/schedule-app](https://github.com/BURGESSSSSS/schedule-app)。

部署参考：[Vite 静态部署文档](https://vite.dev/guide/static-deploy.html)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。
