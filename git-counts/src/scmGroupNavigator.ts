import * as path from 'node:path';
import * as vscode from 'vscode';
import type { GitApi, GitRepository } from './gitApi';
import {
  createResourceGroupNavigationPlan,
  findMissingCommands,
  getVisibleResourceGroups,
  type GitResourceGroupId
} from './scmNavigationPlan';

export type NavigableGroup = 'index' | 'workingTree';

const COMMANDS = {
  openScm: 'workbench.view.scm',
  collapseAll: 'list.collapseAll',
  focusFirst: 'list.focusFirst',
  focusNextRepository: 'list.focusDown',
  focusNextResourceGroup: 'workbench.scm.action.focusNextResourceGroup',
  expandFocused: 'list.expand',
  clearFocus: 'list.clear'
} as const;

const SINGLE_REPOSITORY_COMMANDS = [
  COMMANDS.openScm,
  COMMANDS.collapseAll,
  COMMANDS.focusFirst,
  COMMANDS.focusNextResourceGroup,
  COMMANDS.expandFocused,
  COMMANDS.clearFocus
];

const MULTI_REPOSITORY_COMMANDS = [
  ...SINGLE_REPOSITORY_COMMANDS,
  COMMANDS.focusNextRepository
];

// 打开 SCM 视图后预留时间完成首次树渲染，避免后续列表命令落到先前获得焦点的视图。
const SCM_VIEW_OPEN_SETTLE_MS = 80;

// SCM 分组导航由 VS Code 内部队列异步执行；等待一个渲染帧后再展开最终目标，避免逐步等待产生选中闪烁。
const SCM_NAVIGATION_SETTLE_MS = 16;

/** 使用 VS Code 内部导航命令切换内置 Git 资源分组。 */
export class ScmGroupNavigator {
  constructor(private readonly gitApi: GitApi) {}

  /** 打开 SCM 视图，折叠全部资源分组并只展开目标分组。 */
  async showGroup(repository: GitRepository, target: NavigableGroup): Promise<void> {
    const visibleGroups = this.getVisibleGroups(repository);
    const navigationPlan = createResourceGroupNavigationPlan(visibleGroups, target);

    await vscode.commands.executeCommand(COMMANDS.openScm);
    await settle(SCM_VIEW_OPEN_SETTLE_MS);

    if (!navigationPlan.targetExists) {
      const label = target === 'index' ? 'staged changes' : 'unstaged changes';
      await vscode.window.showInformationMessage(`The current repository has no ${label}.`);
      return;
    }

    const repositoryCount = this.getVisibleRepositories().length;
    const requiredCommands = repositoryCount > 1 ? MULTI_REPOSITORY_COMMANDS : SINGLE_REPOSITORY_COMMANDS;
    const availableCommands = new Set(await vscode.commands.getCommands(true));
    const missingCommands = findMissingCommands(availableCommands, requiredCommands);
    if (missingCommands.length > 0) {
      await vscode.window.showErrorMessage(
        `This VS Code version does not support Git Counts group navigation. Missing commands: ${missingCommands.join(', ')}`
      );
      return;
    }

    try {
      // 先让 SCM 树成为 VS Code 的当前列表，避免通用列表命令作用到此前获得焦点的其他视图。
      await executeCommand(COMMANDS.focusFirst);
      await executeCommand(COMMANDS.collapseAll);
      await executeCommand(COMMANDS.clearFocus);
      await this.focusRepository(repository);
      await executeCommand(COMMANDS.focusNextResourceGroup);
      await moveResourceGroups(navigationPlan.movesToTarget);
      await settle(SCM_NAVIGATION_SETTLE_MS);
      await executeCommand(COMMANDS.expandFocused);
      await executeCommand(COMMANDS.clearFocus);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await vscode.window.showErrorMessage(`Git Counts could not locate the Source Control group: ${message}`);
    }
  }

  private getVisibleGroups(repository: GitRepository): GitResourceGroupId[] {
    const alwaysShowStaged = vscode.workspace
      .getConfiguration('git', repository.rootUri)
      .get<boolean>('alwaysShowStagedChangesResourceGroup', false);

    return getVisibleResourceGroups(
      {
        merge: repository.state.mergeChanges.length,
        index: repository.state.indexChanges.length,
        workingTree: repository.state.workingTreeChanges.length,
        untracked: repository.state.untrackedChanges.length
      },
      alwaysShowStaged
    );
  }

  /**
   * 将 SCM 树焦点放到目标仓库。
   *
   * 所有节点已在调用前折叠，多仓库时可按仓库顺序稳定移动，不会进入仓库子节点。
   * 展开目标仓库后立即清除临时选中状态，再等待其资源分组完成渲染。
   */
  private async focusRepository(repository: GitRepository): Promise<void> {
    const repositories = this.getVisibleRepositories();

    const repositoryInView = repositories.find(candidate => isSameRepository(candidate, repository));
    if (!repositoryInView) {
      throw new Error(`Repository ${path.basename(repository.rootUri.fsPath)} is not visible in Source Control`);
    }

    if (repositories.length === 1) {
      await executeCommand(COMMANDS.focusFirst);
      await executeCommand(COMMANDS.clearFocus);
      return;
    }

    const sortedRepositories = sortRepositories(repositories);
    const repositoryIndex = sortedRepositories.findIndex(candidate => isSameRepository(candidate, repositoryInView));
    await executeCommand(COMMANDS.focusFirst);
    for (let index = 0; index < repositoryIndex; index += 1) {
      await executeCommand(COMMANDS.focusNextRepository);
    }
    await executeCommand(COMMANDS.expandFocused);
    await executeCommand(COMMANDS.clearFocus);
    await settle(SCM_NAVIGATION_SETTLE_MS);
  }

  private getVisibleRepositories(): GitRepository[] {
    const visibleRepositories = this.gitApi.repositories.filter(candidate => candidate.ui.selected);
    return visibleRepositories.length > 0 ? visibleRepositories : [...this.gitApi.repositories];
  }
}

function isSameRepository(left: GitRepository, right: GitRepository): boolean {
  return left.rootUri.toString() === right.rootUri.toString();
}

function sortRepositories(repositories: readonly GitRepository[]): GitRepository[] {
  const sortOrder = vscode.workspace
    .getConfiguration('scm')
    .get<'discovery time' | 'name' | 'path'>('repositories.sortOrder', 'discovery time');
  const result = [...repositories];

  if (sortOrder === 'name') {
    result.sort((left, right) => path.basename(left.rootUri.fsPath).localeCompare(path.basename(right.rootUri.fsPath)));
  } else if (sortOrder === 'path') {
    result.sort((left, right) => left.rootUri.fsPath.localeCompare(right.rootUri.fsPath));
  }

  return result;
}

async function moveResourceGroups(count: number): Promise<void> {
  for (let index = 0; index < count; index += 1) {
    await executeCommand(COMMANDS.focusNextResourceGroup);
  }
}

async function executeCommand(command: string): Promise<void> {
  await vscode.commands.executeCommand(command);
}

async function settle(milliseconds: number): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, milliseconds));
}
