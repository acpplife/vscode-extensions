# Git Counts

[English](https://github.com/acpplife/vscode-extensions/blob/main/git-counts/README.md)

在 VS Code 状态栏中分别查看 Git 已暂存和未暂存文件数量。点击任一计数即可打开对应的内置源代码管理分组。

## 功能

- 在状态栏中分别显示 **已暂存** 和 **更改** 数量。
- 打开源代码管理面板，折叠其他分组并展开选中的分组。
- 内置 Git 扩展报告状态变化时自动更新。
- 根据活动编辑器或最近选择的 SCM 仓库确定当前仓库。
- 支持多根工作区，不会执行额外的 Git 命令。

## 使用方式

- 点击 **已暂存**，打开源代码管理面板并展开 **暂存的更改**。
- 点击 **更改**，打开源代码管理面板并展开 **更改**。
- 如果偏好键盘操作，也可以通过命令面板运行 Git Counts 命令。

计数与 VS Code 内置 Git 扩展暴露的资源分组保持一致。同一个文件同时存在已暂存和未暂存修改时，会像源代码管理面板一样分别计入两个数字。

## 仓库选择

Git Counts 优先使用活动编辑器所属的仓库。如果活动编辑器不属于任何仓库，则依次使用最近选择的 SCM 仓库、当前选中的仓库或工作区中的唯一仓库。

## 命令

| 命令 | 说明 |
| --- | --- |
| `Git Counts: Show Staged Changes` | 打开并展开 **暂存的更改** |
| `Git Counts: Show Changes` | 打开并展开 **更改** |

## 要求与兼容性

- VS Code 1.125.0 或更高版本。
- 必须启用 VS Code 内置 Git 扩展。
- 工作区中必须打开本地 Git 仓库。

精确的分组定位依赖不属于公开扩展 API 的内置 SCM 导航命令。Git Counts 会在导航前检查所需命令是否存在；当前 VS Code 版本不兼容时，会显示明确的错误信息。

## 隐私

Git Counts 不收集遥测数据，不发送仓库信息，也不会发起网络请求。扩展仅通过内置 Git 扩展读取 Git 状态，不会修改仓库或 Git 配置。

## 支持

请使用 Git Counts Marketplace 页面中的 **Q & A** 区域获取排查和支持信息。扩展包中也包含 `SUPPORT.md`，其中说明了请求帮助时需要提供的信息。

## 开发

```bash
pnpm install
pnpm run check
pnpm test
pnpm run package
```

生成的扩展包位于 `dist/git-counts-0.1.4.vsix`。

## 许可证

Git Counts 使用 MIT 许可证。完整许可证文本包含在扩展包中。
