# When to File a Bug

> Part of the [Troubleshooting](./index.md) page

## Before Filing a Bug Report

Before filing a bug report, please check:

!!! note "Pre-Flight Checklist"
    1. **Review the FAQ and GUIDE** - Your issue may be a known behavior or already documented
    2. **Run with `--debug`** - Gather diagnostic information
    3. **Test with a minimal example** - Simplify your reproduction case

!!! warning "Common Non-Bugs"
    Check if your issue matches these common scenarios:

    - **Pattern starting with `-`** → Use `rg -- -pattern` or `rg -e -pattern`
    - **Old Rust version for building** → Use latest stable Rust
    - **Package manager issues** → Contact package maintainer
    - **Snap package permission issues** → Use GitHub binary releases instead

## Preparing a Good Bug Report

!!! tip "Essential Information"
    A good bug report includes:

    1. **Output of `rg --version`**
    2. **How you installed ripgrep** (cargo, apt, homebrew, etc.)
    3. **Operating system and version**
    4. **Command run with `--debug` flag**
    5. **Complete `--debug` output**
    6. **Minimal reproduction case** (pattern and sample file if possible)
    7. **Expected vs. actual behavior**

    See the [bug report template](https://github.com/BurntSushi/ripgrep/blob/master/.github/ISSUE_TEMPLATE/bug_report.yml) for the complete format.

## Additional Resources

- **FAQ**: Common questions and answers - [FAQ.md](../../FAQ.md)
- **User Guide**: Comprehensive documentation - [GUIDE.md](../../GUIDE.md)
- **GitHub Issues**: Search for known issues and solutions
- **Configuration**: See the [configuration file chapter](../configuration-file.md) for persistent settings
- **File Encoding**: See the [file encoding chapter](../file-encoding.md) for encoding details
- **Common Options**: See the [common options chapter](../common-options/index.md) for flag reference
