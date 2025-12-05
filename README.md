# css-var-jump-extension README

Typex Pc 项目 css 主题变量跳转插件

## Features

在代码中如果有以 -- 开头的 css 变量可以跳转到定义的位置

## Requirements

适用于 vscode 版本 ^1.96.0

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

**Enjoy!**
