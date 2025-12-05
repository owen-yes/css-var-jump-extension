# css-var-jump-extension README

Typex Pc 项目 css 主题变量跳转插件

## Features

在代码中如果有以 -- 开头的 css 变量可以跳转到定义的位置

## Requirements

适用于 vscode 版本 ^1.106.1

## Extension Settings

可以在 vscode 中配置文件扫描目录

```json
{
  "cssVarJump.searchPaths": [
    "**/theme/**/*.{js,jsx,ts,tsx}",
    "**/styles/variables/*.{js,ts}"
  ],
  "cssVarJump.cssSearchPaths": [
    "**/theme/**/*.css",
    "**/theme/**/*.less",
    "**/styles/**/*.css"
  ]
}
```

## Package

修改后运行 `pnpm vscode:package` 生成 `css-var-jump-extension-xxx.vsix`

## CI

触发条件：
当推送代码到 main 分支时自动触发（忽略 Markdown 文件、LICENSE 等文档类文件的更改）
也可手动触发（workflow_dispatch）

### 执行步骤：

- 检出代码
- 设置 Node.js 环境
- 安装 pnpm
- 安装项目依赖
- 编译扩展
- 打包扩展为 .vsix 文件
- 从 package.json 中提取版本号和包名
- 创建 GitHub Release
- 将打包好的 .vsix 文件上传为 Release Assets

### 输出结果：

自动生成带有版本号的 Git Tag  
在 GitHub Releases 页面创建新版本  
将打包的 .vsix 文件附加到 Release 中

## 版本管理

```json
# 升级主版本号 (1.0.0 -> 2.0.0)
pnpm run release:major

# 升级次版本号 (1.0.0 -> 1.1.0)
pnpm run release:minor

# 升级补丁版本号 (1.0.0 -> 1.0.1)
pnpm run release:patch
```

每次更新 main 分支时都会自动打包最新的扩展版本并发布到 GitHub Releases 页面
