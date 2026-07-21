/** VS Code 内置 Git 扩展的资源分组标识。 */
export type GitResourceGroupId = 'merge' | 'index' | 'workingTree' | 'untracked';

/** 可见分组计算所需的 Git 状态数量。 */
export interface GitGroupCounts {
  readonly merge: number;
  readonly index: number;
  readonly workingTree: number;
  readonly untracked: number;
}

/** 从第一个分组开始执行折叠、展开所需的导航计划。 */
export interface ResourceGroupNavigationPlan {
  readonly targetExists: boolean;
  readonly movesToTarget: number;
}

/** 按 VS Code 内置 Git 扩展的顺序计算当前可见资源分组。 */
export function getVisibleResourceGroups(
  counts: GitGroupCounts,
  alwaysShowStaged: boolean
): GitResourceGroupId[] {
  const groups: GitResourceGroupId[] = [];
  if (counts.merge > 0) {
    groups.push('merge');
  }
  if (counts.index > 0 || alwaysShowStaged) {
    groups.push('index');
  }
  groups.push('workingTree');
  if (counts.untracked > 0) {
    groups.push('untracked');
  }
  return groups;
}

/** 计算从第一个可见分组移动到目标分组所需的次数。 */
export function createResourceGroupNavigationPlan(
  groups: readonly GitResourceGroupId[],
  target: 'index' | 'workingTree'
): ResourceGroupNavigationPlan {
  const targetIndex = groups.indexOf(target);
  if (targetIndex === -1) {
    return {
      targetExists: false,
      movesToTarget: 0
    };
  }

  return {
    targetExists: true,
    movesToTarget: targetIndex
  };
}

/** 返回当前 VS Code 缺失的 SCM 导航命令。 */
export function findMissingCommands(
  availableCommands: ReadonlySet<string>,
  requiredCommands: readonly string[]
): string[] {
  return requiredCommands.filter(command => !availableCommands.has(command));
}
