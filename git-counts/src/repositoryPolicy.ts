/**
 * 选择状态栏当前展示的仓库。
 *
 * 活动文件所属仓库优先；否则沿用最近一次 SCM 选择，最后退回当前选中或唯一仓库。
 */
export function selectRepository<T>(
  repositories: readonly T[],
  activeRepository: T | null | undefined,
  lastSelectedRepository: T | undefined,
  isSelected: (repository: T) => boolean,
  isSameRepository: (left: T, right: T) => boolean = (left, right) => left === right
): T | undefined {
  if (activeRepository) {
    const repository = repositories.find(candidate => isSameRepository(candidate, activeRepository));
    if (repository) {
      return repository;
    }
  }

  if (lastSelectedRepository) {
    const repository = repositories.find(candidate => isSameRepository(candidate, lastSelectedRepository));
    if (repository) {
      return repository;
    }
  }

  const selectedRepository = repositories.find(isSelected);
  if (selectedRepository) {
    return selectedRepository;
  }

  return repositories.length === 1 ? repositories[0] : undefined;
}
