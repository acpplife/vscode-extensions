import type * as vscode from 'vscode';

/** VS Code 内置 Git 扩展公开的变更记录。 */
export interface GitChange {
  readonly uri: vscode.Uri;
}

/** VS Code 内置 Git 扩展公开的仓库状态。 */
export interface GitRepositoryState {
  readonly mergeChanges: readonly GitChange[];
  readonly indexChanges: readonly GitChange[];
  readonly workingTreeChanges: readonly GitChange[];
  readonly untrackedChanges: readonly GitChange[];
  readonly onDidChange: vscode.Event<void>;
}

/** VS Code 内置 Git 扩展公开的仓库界面状态。 */
export interface GitRepositoryUiState {
  readonly selected: boolean;
  readonly onDidChange: vscode.Event<void>;
}

/** 本扩展使用的最小 Git 仓库接口。 */
export interface GitRepository {
  readonly rootUri: vscode.Uri;
  readonly state: GitRepositoryState;
  readonly ui: GitRepositoryUiState;
}

/** VS Code 内置 Git 扩展 API。 */
export interface GitApi {
  readonly repositories: readonly GitRepository[];
  readonly onDidOpenRepository: vscode.Event<GitRepository>;
  readonly onDidCloseRepository: vscode.Event<GitRepository>;
  getRepository(uri: vscode.Uri): GitRepository | null;
}

/** VS Code 内置 Git 扩展导出的入口。 */
export interface GitExtension {
  readonly enabled: boolean;
  getAPI(version: 1): GitApi;
}
