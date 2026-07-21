import * as vscode from 'vscode';
import type { GitApi, GitExtension } from './gitApi';
import { GitRepositoryTracker, type RepositorySnapshot } from './gitRepositoryTracker';
import { ScmGroupNavigator } from './scmGroupNavigator';

const SHOW_STAGED_COMMAND = 'gitCounts.showStaged';
const SHOW_CHANGES_COMMAND = 'gitCounts.showChanges';

// 两个相邻优先级让“暂存”稳定显示在“更改”左侧，同时靠近 VS Code 左侧的仓库状态区域。
const STAGED_STATUS_PRIORITY = 101;
const CHANGES_STATUS_PRIORITY = 100;

/** 激活 Git Counts 扩展。 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const gitApi = await loadGitApi();
  if (!gitApi) {
    return;
  }

  const tracker = new GitRepositoryTracker(gitApi);
  const navigator = new ScmGroupNavigator(gitApi);
  const stagedStatus = createStatusItem(
    'gitCounts.staged',
    'Git Counts: Staged',
    STAGED_STATUS_PRIORITY,
    SHOW_STAGED_COMMAND
  );
  const changesStatus = createStatusItem(
    'gitCounts.changes',
    'Git Counts: Changes',
    CHANGES_STATUS_PRIORITY,
    SHOW_CHANGES_COMMAND
  );

  const updateStatusItems = (snapshot: RepositorySnapshot | undefined): void => {
    if (!snapshot) {
      stagedStatus.hide();
      changesStatus.hide();
      return;
    }

    stagedStatus.text = `$(check) Staged ${snapshot.stagedCount}`;
    stagedStatus.tooltip = `Repository: ${snapshot.repositoryName}\nClick to expand Staged Changes and collapse Changes`;
    stagedStatus.accessibilityInformation = {
      label: `${snapshot.stagedCount} staged changes in repository ${snapshot.repositoryName}`
    };

    changesStatus.text = `$(edit) Changes ${snapshot.changesCount}`;
    changesStatus.tooltip = `Repository: ${snapshot.repositoryName}\nClick to expand Changes and collapse Staged Changes`;
    changesStatus.accessibilityInformation = {
      label: `${snapshot.changesCount} unstaged changes in repository ${snapshot.repositoryName}`
    };

    stagedStatus.show();
    changesStatus.show();
  };

  context.subscriptions.push(
    tracker,
    stagedStatus,
    changesStatus,
    tracker.onDidChange(updateStatusItems),
    vscode.commands.registerCommand(SHOW_STAGED_COMMAND, async () => {
      const snapshot = tracker.getSnapshot();
      if (snapshot) {
        await navigator.showGroup(snapshot.repository, 'index');
      }
    }),
    vscode.commands.registerCommand(SHOW_CHANGES_COMMAND, async () => {
      const snapshot = tracker.getSnapshot();
      if (snapshot) {
        await navigator.showGroup(snapshot.repository, 'workingTree');
      }
    })
  );

  tracker.start();
  updateStatusItems(tracker.getSnapshot());
}

/** 停用时由 VS Code 自动释放 ExtensionContext 中的资源。 */
export function deactivate(): void {}

function createStatusItem(
  id: string,
  name: string,
  priority: number,
  command: string
): vscode.StatusBarItem {
  const item = vscode.window.createStatusBarItem(id, vscode.StatusBarAlignment.Left, priority);
  item.name = name;
  item.command = command;
  return item;
}

async function loadGitApi(): Promise<GitApi | undefined> {
  const extension = vscode.extensions.getExtension<GitExtension>('vscode.git');
  if (!extension) {
    await vscode.window.showErrorMessage("Git Counts could not find VS Code's built-in Git extension.");
    return undefined;
  }

  const gitExtension = extension.isActive ? extension.exports : await extension.activate();
  if (!gitExtension.enabled) {
    await vscode.window.showErrorMessage("Git Counts requires VS Code's built-in Git extension to be enabled.");
    return undefined;
  }

  return gitExtension.getAPI(1);
}
