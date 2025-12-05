// src/tsxVariableDefinitionProvider.ts
import * as vscode from "vscode";
import {
  getSearchPaths,
  isInComment,
  cssVarToCamelCase,
  executeFallbackDefinitionProvider,
} from "./utils";

export class TsxVariableDefinitionProvider
  implements vscode.DefinitionProvider
{
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken
  ): Promise<vscode.Definition | undefined> {
    // 获取当前光标下的单词
    const wordRange = document.getWordRangeAtPosition(
      position,
      /['"`][\w\-_]+['"`]|[\w\-_]+/
    );

    if (!wordRange) {
      return undefined;
    }

    let variableName = document.getText(wordRange);

    // 清理引号
    variableName = variableName.replace(/^['"`]|['"`]$/g, "");

    // 验证是否为CSS变量
    if (!variableName.startsWith("--")) {
      return undefined;
    }

    // CSS变量转驼峰命名
    const variableHumpName = cssVarToCamelCase(variableName);

    // 获取配置的搜索路径
    // const searchPaths = getSearchPaths("searchPaths", [
    //   "**/theme/**/*.{ts}",
    // ]);
    const searchPaths = [
      "**/theme/**/*.{js,jsx,ts,tsx}",
    ];

    // 存储所有找到的位置
    const locations: vscode.Location[] = [];

    // 遍历每个搜索路径
    for (const searchPattern of searchPaths) {
      const files = await vscode.workspace.findFiles(
        searchPattern,
        "{**/node_modules/**,**/dist/**,**/build/**}"
      );

      // 扫描JS/TS文件寻找变量定义
      for (const file of files) {
        try {
          const content = await vscode.workspace.fs.readFile(file);
          const text = Buffer.from(content).toString("utf8");

          // 使用正则表达式查找可能的变量定义（使用驼峰命名）
          const regexPatterns = [
            // JavaScript/TypeScript 对象属性形式
            new RegExp(`['"]${variableHumpName}['"]\\s*[:,]`, "g"),
            // 模板字符串形式
            new RegExp(`\`${variableHumpName}\\b`, "g"),
            // 字符串形式
            new RegExp(`${variableHumpName}\\b`, "g"),
          ];

          for (const pattern of regexPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
              if (token.isCancellationRequested) {
                return undefined;
              }

              // 计算行列位置
              const lines = text.substring(0, match.index).split("\n");
              const line = lines.length - 1;
              const character = lines[lines.length - 1].length;

              const definitionUri = vscode.Uri.file(file.fsPath);
              const definitionPosition = new vscode.Position(line, character);

              // 检查是否在注释中
              const tempDocument = await vscode.workspace.openTextDocument(
                file
              );
              if (!isInComment(tempDocument, definitionPosition)) {
                locations.push(
                  new vscode.Location(definitionUri, definitionPosition)
                );
              }
            }
          }
        } catch (error) {
          console.error(`Error reading file ${file.fsPath}:`, error);
        }
      }
    }

    // 如果找到了匹配项，直接返回
    if (locations.length > 0) {
      return locations.length > 1 ? locations : locations[0];
    }

    // 如果没有找到匹配项，调用其他插件的定义提供者
    return executeFallbackDefinitionProvider(document, position);
  }
}
