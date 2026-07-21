# Git Counts

[Simplified Chinese](https://github.com/acpplife/vscode-extensions/blob/main/git-counts/README.zh-CN.md)

See staged and unstaged Git file counts separately in the VS Code status bar. Click either count to open the corresponding built-in Source Control group.

## Features

- Shows separate **Staged** and **Changes** counts in the status bar.
- Opens Source Control, collapses other groups, and expands the selected group.
- Updates automatically when the built-in Git extension reports a status change.
- Selects the repository from the active editor or the most recently selected SCM repository.
- Supports multi-root workspaces without running additional Git commands.

## Usage

- Click **Staged** to open Source Control and expand **Staged Changes**.
- Click **Changes** to open Source Control and expand **Changes**.
- Run either Git Counts command from the Command Palette if you prefer keyboard navigation.

Counts match the resource groups exposed by VS Code's built-in Git extension. A file with both staged and unstaged edits appears in both counts, just as it does in Source Control.

## Repository Selection

Git Counts uses the repository that contains the active editor. If no active editor belongs to a repository, it uses the most recently selected SCM repository, then the current or only repository as a fallback.

## Commands

| Command | Description |
| --- | --- |
| `Git Counts: Show Staged Changes` | Open and expand **Staged Changes** |
| `Git Counts: Show Changes` | Open and expand **Changes** |

## Requirements and Compatibility

- VS Code 1.125.0 or later.
- VS Code's built-in Git extension must be enabled.
- A local Git repository must be open in the workspace.

Precise group navigation relies on built-in SCM navigation commands that are not part of the public extension API. Git Counts checks that the required commands exist before navigating and displays a clear message when the current VS Code version is incompatible.

## Privacy

Git Counts collects no telemetry, sends no repository information, and makes no network requests. It reads Git state through the built-in Git extension and never modifies repositories or Git configuration.

## Support

Use the **Q & A** section on the Git Counts Marketplace page for troubleshooting and support. The extension package also includes `SUPPORT.md` with the information to provide when requesting help.

## Development

```bash
pnpm install
pnpm run check
pnpm test
pnpm run package
```

The packaged extension is written to `dist/git-counts-0.1.4.vsix`.

## License

Git Counts is available under the MIT License. The complete license text is included in the extension package.
