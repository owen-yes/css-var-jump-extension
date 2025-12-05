// src/utils.ts
import * as vscode from "vscode";

/**
 * 获取配置中的搜索路径
 */
export function getSearchPaths(
  configKey: string,
  defaultPaths: string[]
): string[] {
  const config = vscode.workspace.getConfiguration("cssVarJump");
  return config.get<string[]>(configKey, defaultPaths);
}

/**
 * 检查匹配到的变量是否在注释中
 */
export function isInComment(
  document: vscode.TextDocument,
  position: vscode.Position
): boolean {
  const lineText = document.lineAt(position.line).text;
  const lineBeforePosition = lineText.substring(0, position.character);

  // 简单检查JavaScript/TypeScript注释
  // 检查单行注释 //
  const singleLineCommentIndex = lineBeforePosition.lastIndexOf("//");
  const multiLineCommentStartIndex = lineBeforePosition.lastIndexOf("/*");
  const multiLineCommentEndIndex = lineBeforePosition.lastIndexOf("*/");

  // 如果在单行注释之后
  if (
    singleLineCommentIndex !== -1 &&
    (multiLineCommentEndIndex === -1 ||
      singleLineCommentIndex > multiLineCommentEndIndex)
  ) {
    return true;
  }

  // 检查多行注释 /* */
  if (
    multiLineCommentStartIndex !== -1 &&
    (multiLineCommentEndIndex === -1 ||
      multiLineCommentStartIndex > multiLineCommentEndIndex)
  ) {
    return true;
  }

  return false;
}

/**
 * CSS变量名转驼峰命名
 */
export function cssVarToCamelCase(variableName: string): string {
  return variableName
    .replace("--", "")
    .replace(/(-)([a-zA-Z0-9-_])/g, (str, $1, $2) => {
      return $2.toUpperCase();
    });
}

/**
 * 调用其他插件的定义提供者
 */
export async function executeFallbackDefinitionProvider(
  document: vscode.TextDocument,
  position: vscode.Position
): Promise<vscode.Definition | undefined> {
  try {
    const otherDefinitions = await vscode.commands.executeCommand<
      vscode.Location[]
    >("vscode.executeDefinitionProvider", document.uri, position);

    if (otherDefinitions && otherDefinitions.length > 0) {
      return otherDefinitions;
    }
  } catch (error) {
    console.error("Error executing other definition providers:", error);
  }

  return undefined;
}
