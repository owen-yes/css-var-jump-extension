// src/extension.ts
import * as vscode from "vscode";
import { CssVariableDefinitionProvider } from "./cssVariableDefinitionProvider";
import { TsxVariableDefinitionProvider } from "./tsxVariableDefinitionProvider";

export function activate(context: vscode.ExtensionContext) {
  console.log("CSS Variable Jump extension is now active");

  // 注册定义提供者，用于处理跳转功能
  const cssProvider = vscode.languages.registerDefinitionProvider(
    [{ language: "css" }, { language: "less" }],
    new CssVariableDefinitionProvider()
  );

  // 注册 TSX 文件中的定义提供者
  const tsxProvider = vscode.languages.registerDefinitionProvider(
    [{ language: "typescriptreact" }, { language: "javascriptreact" }],
    new TsxVariableDefinitionProvider()
  );

  context.subscriptions.push(cssProvider);
  context.subscriptions.push(tsxProvider);
}

export function deactivate() {}
