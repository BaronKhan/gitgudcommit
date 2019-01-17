Git Commit Client-Side Hook
===

### Installation

```
$ make
$ sudo make install
```

This will install the hook as a global one, and should apply it to all your
Git repositories.

### Usage

Just run `git commit`. Once finished, the hook will suggest any changes and give
the option to edit your commit message.

### Troubleshooting

If you find that the hook does not run when you commit, then you may need to add
the contents of `~/.gitgudcommit/` to your repository's `.git/hooks/` directory.