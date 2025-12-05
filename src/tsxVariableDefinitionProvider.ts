// src/tsxVariableDefinitionProvider.ts
import * as vscode from "vscode";
import { getSearchPaths, isInComment, executeFallbackDefinitionProvider } from "./utils";

export class TsxVariableDefinitionProvider implements vscode.DefinitionProvider {
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

    // 获取配置的搜索路径
    const cssSearchPaths = getSearchPaths("cssSearchPaths", [
      "**/theme/**/*.css",
      "**/theme/**/*.less",
    ]);

    // 存储所有找到的位置
    const locations: vscode.Location[] = [];

    // 遍历每个CSS搜索路径
    for (const searchPattern of cssSearchPaths) {
      // 在CSS/LESS文件中搜索变量定义
      const files = await vscode.workspace.findFiles(
        searchPattern,
        "{**/node_modules/**,**/dist/**,**/build/**}"
      );

      // 扫描CSS/LESS文件寻找变量定义
      for (const file of files) {
        try {
          const content = await vscode.workspace.fs.readFile(file);
          const text = Buffer.from(content).toString("utf8");

          // 查找CSS变量定义
          const lines = text.split("\n");
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // 匹配CSS变量定义，例如: --color-primary:
            const varRegex = new RegExp(`${variableName}\\s*:`, "g");
            if (varRegex.test(line)) {
              if (token.isCancellationRequested) {
                return undefined;
              }

              const definitionUri = vscode.Uri.file(file.fsPath);
              const definitionPosition = new vscode.Position(
                i,
                line.indexOf(variableName)
              );

              // 检查是否在注释中
              const tempDocument = await vscode.workspace.openTextDocument(file);
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