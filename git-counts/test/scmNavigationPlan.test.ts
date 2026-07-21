import { describe, expect, it } from 'vitest';
import {
  createResourceGroupNavigationPlan,
  findMissingCommands,
  getVisibleResourceGroups
} from '../src/scmNavigationPlan';

describe('getVisibleResourceGroups', () => {
  it('按内置 Git 扩展顺序返回可见分组', () => {
    expect(getVisibleResourceGroups({ merge: 1, index: 2, workingTree: 3, untracked: 4 }, false)).toEqual([
      'merge',
      'index',
      'workingTree',
      'untracked'
    ]);
  });

  it('暂存为空且未要求常显时隐藏暂存分组', () => {
    expect(getVisibleResourceGroups({ merge: 0, index: 0, workingTree: 0, untracked: 0 }, false)).toEqual([
      'workingTree'
    ]);
  });

  it('允许空暂存分组常显', () => {
    expect(getVisibleResourceGroups({ merge: 0, index: 0, workingTree: 0, untracked: 0 }, true)).toEqual([
      'index',
      'workingTree'
    ]);
  });
});

describe('createResourceGroupNavigationPlan', () => {
  it('点击更改时从第一个分组移动一次', () => {
    expect(createResourceGroupNavigationPlan(['index', 'workingTree'], 'workingTree')).toEqual({
      targetExists: true,
      movesToTarget: 1
    });
  });

  it('点击暂存时停留在第一个分组', () => {
    expect(createResourceGroupNavigationPlan(['index', 'workingTree'], 'index')).toEqual({
      targetExists: true,
      movesToTarget: 0
    });
  });

  it('存在合并分组时仍按实际顺序定位', () => {
    expect(createResourceGroupNavigationPlan(['merge', 'index', 'workingTree'], 'workingTree')).toEqual({
      targetExists: true,
      movesToTarget: 2
    });
  });

  it('存在合并和未跟踪分组时定位暂存', () => {
    expect(createResourceGroupNavigationPlan(['merge', 'index', 'workingTree', 'untracked'], 'index')).toEqual({
      targetExists: true,
      movesToTarget: 1
    });
  });

  it('另一个分组不可见时直接定位目标', () => {
    expect(createResourceGroupNavigationPlan(['merge', 'workingTree'], 'workingTree')).toEqual({
      targetExists: true,
      movesToTarget: 1
    });
  });

  it('目标分组不可见时返回不可定位', () => {
    expect(createResourceGroupNavigationPlan(['workingTree'], 'index')).toEqual({
      targetExists: false,
      movesToTarget: 0
    });
  });
});

describe('navigation helpers', () => {
  it('列出缺失的内部命令', () => {
    expect(findMissingCommands(new Set(['a', 'c']), ['a', 'b', 'c'])).toEqual(['b']);
  });
});
