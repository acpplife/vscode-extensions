# VS Code Extensions

A collection of focused Visual Studio Code extensions. Each extension is maintained as a self-contained package with its own source code, tests, documentation, version, and Marketplace release.

## Extensions

| Extension | Description | Marketplace |
| --- | --- | --- |
| [Git Counts](git-counts) | Shows staged and unstaged Git file counts separately and jumps to either Source Control group. | [Install Git Counts](https://marketplace.visualstudio.com/items?itemName=ssisl.git-counts) |

## Development

Each extension directory contains its own development and release instructions. To work on an extension, enter its directory and use the package scripts defined in its `package.json`.

For example:

```bash
cd git-counts
pnpm install
pnpm run check
pnpm test
pnpm run package
```

## Repository Structure

```text
vscode-extensions/
└── git-counts/
```

Additional extensions can be added as independent directories without coupling their versions or Marketplace releases.

## License

Each extension is licensed independently. See the `LICENSE` file in the corresponding extension directory.
