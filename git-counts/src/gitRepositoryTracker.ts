import * as path from 'node:path';
import * as vscode from 'vscode';
import type { GitApi, GitRepository } from './gitApi';
import { selectRepository } from './repositoryPolicy';

/** 状态栏展示所需的当前仓库快照。 */
export interface RepositorySnapshot {
  readonly repository: GitRepository;
  readonly repositoryName: string;
  readonly stagedCount: number;
  readonly changesCount: number;
}

/** 跟踪活动 Git 仓库以及暂存、未暂存文件数量。 */
export class GitRepositoryTracker implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];
  private readonly repositoryDisposables = new Map<GitRepository, vscode.Disposable>();
  private readonly changeEmitter = new vscode.EventEmitter<RepositorySnapshot | undefined>();
  private lastSelectedRepository: GitRepository | undefined;

  /** 当前仓库快照变化事件。 */
  readonly onDidChange = this.changeEmitter.event;

  constructor(private readonly gitApi: GitApi) {}

  /** 开始监听仓库、编辑器和 Git 状态变化。 */
  start(): void {
    for (const repository of this.gitApi.repositories) {
      this.bindRepository(repository);
      if (repository.ui.selected && !this.lastSelectedRepository) {
        this.lastSelectedRepository = repository;
      }
    }

    this.disposables.push(
      vscode.window.onDidChangeActiveTextEditor(() => this.emitSnapshot()),
      this.gitApi.onDidOpenRepository(repository => {
        this.bindRepository(repository);
        this.emitSnapshot();
      }),
      this.gitApi.onDidCloseRepository(repository => {
        this.repositoryDisposables.get(repository)?.dispose();
        this.repositoryDisposables.delete(repository);
        if (this.lastSelectedRepository === repository) {
          this.lastSelectedRepository = undefined;
        }
        this.emitSnapshot();
      })
    );

    this.emitSnapshot();
  }

  /** 返回当前活动仓库及其两个分组计数。 */
  getSnapshot(): RepositorySnapshot | undefined {
    const repository = this.resolveRepository();
    if (!repository) {
      return undefined;
    }

    return {
      repository,
      repositoryName: path.basename(repository.rootUri.fsPath),
      stagedCount: repository.state.indexChanges.length,
      changesCount: repository.state.workingTreeChanges.length
    };
  }

  dispose(): void {
    for (const disposable of this.repositoryDisposables.values()) {
      disposable.dispose();
    }
    this.repositoryDisposables.clear();
    vscode.Disposable.from(...this.disposables).dispose();
    this.changeEmitter.dispose();
  }

  private bindRepository(repository: GitRepository): void {
    if (this.repositoryDisposables.has(repository)) {
      return;
    }

    const disposable = vscode.Disposable.from(
      repository.state.onDidChange(() => this.emitSnapshot()),
      repository.ui.onDidChange(() => {
        if (repository.ui.selected) {
          this.lastSelectedRepository = repository;
        }
        this.emitSnapshot();
      })
    );
    this.repositoryDisposables.set(repository, disposable);
  }

  private resolveRepository(): GitRepository | undefined {
    const activeUri = vscode.window.activeTextEditor?.document.uri;
    const activeRepository = activeUri ? this.gitApi.getRepository(activeUri) : undefined;

    return selectRepository(
      this.gitApi.repositories,
      activeRepository,
      this.lastSelectedRepository,
      repository => repository.ui.selected,
      (left, right) => left.rootUri.toString() === right.rootUri.toString()
    );
  }

  private emitSnapshot(): void {
    this.changeEmitter.fire(this.getSnapshot());
  }
}
