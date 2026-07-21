# VS Code 扩展

[English](README.md)

这是一个专注于 Visual Studio Code 扩展的集合。每个扩展都是独立的软件包，拥有自己的源代码、测试、文档、版本和 Marketplace 发布流程。

## 扩展列表

| 扩展 | 说明 | Marketplace |
| --- | --- | --- |
| [Git Counts](git-counts) | 分别显示 Git 已暂存和未暂存文件数量，并快速跳转到对应的源代码管理分组。 | [安装 Git Counts](https://marketplace.visualstudio.com/items?itemName=ssisl.git-counts) |

## 开发

每个扩展目录都包含独立的开发和发布说明。开发某个扩展时，请进入对应目录，并使用其 `package.json` 中定义的脚本。

例如：

```bash
cd git-counts
pnpm install
pnpm run check
pnpm test
pnpm run package
```

## 仓库结构

```text
vscode-extensions/
└── git-counts/
```

后续可以继续添加独立的扩展目录，各扩展的版本和 Marketplace 发布流程互不耦合。

## 许可证

每个扩展独立授权，具体请查看对应扩展目录中的 `LICENSE` 文件。
