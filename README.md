# bootstrap-tool.mjs

adapted from https://github.com/simonplend/node-shell-scripting-with-zx/blob/main/bootstrap-tool/bootstrap-tool.mjs

## usage
```shell
Usage: bootstrap-tool [options]

Bootstrap a node project

Options:
  -V, --version              output the version number
  -d, --dir [directory]      directory (default: ".")
  -n, --name [package-name]  package-name (defaults to directory name)
  -v, --verion [version]     version (defaults to 1.0.0)
  --packages [packages...]   specify packages
  --type [module-system]     module or commonjs (default: "module")
  --no-editorconfig          no editorconfig
  --no-eslint                no eslint
  --no-readme                no README.md
  --no-git                   no git
  --no-gitignore             no gitignore
  --no-prettier              no prettier
  -h, --help                 display help for command

Commands:
  help [command]             display help for command
```
