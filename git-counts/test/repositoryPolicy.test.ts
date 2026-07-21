import { describe, expect, it } from 'vitest';
import { selectRepository } from '../src/repositoryPolicy';

describe('selectRepository', () => {
  const first = { name: 'first', selected: true };
  const second = { name: 'second', selected: false };
  const repositories = [first, second];

  it('优先使用活动文件所属仓库', () => {
    expect(selectRepository(repositories, second, first, repository => repository.selected)).toBe(second);
  });

  it('没有活动文件时沿用最近选择的仓库', () => {
    expect(selectRepository(repositories, undefined, second, repository => repository.selected)).toBe(second);
  });

  it('没有历史选择时使用 SCM 选中的仓库', () => {
    expect(selectRepository(repositories, undefined, undefined, repository => repository.selected)).toBe(first);
  });

  it('只有一个仓库时自动使用该仓库', () => {
    expect(selectRepository([second], undefined, undefined, repository => repository.selected)).toBe(second);
  });

  it('多仓库且没有可判定目标时返回 undefined', () => {
    expect(selectRepository(repositories, undefined, undefined, () => false)).toBeUndefined();
  });

  it('按仓库标识匹配不同包装实例', () => {
    const activeRepository = { name: 'second', selected: false };
    expect(
      selectRepository(
        repositories,
        activeRepository,
        undefined,
        repository => repository.selected,
        (left, right) => left.name === right.name
      )
    ).toBe(second);
  });
});
