mirror-manager
=================

Manage mirroring repositories from GitLab to GitHub


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/mirror-manager.svg)](https://npmjs.org/package/mirror-manager)
[![Downloads/week](https://img.shields.io/npm/dw/mirror-manager.svg)](https://npmjs.org/package/mirror-manager)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g mirror-manager
$ mirror-manager COMMAND
running command...
$ mirror-manager (--version)
mirror-manager/0.0.0 linux-x64 node-v24.15.0
$ mirror-manager --help [COMMAND]
USAGE
  $ mirror-manager COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`mirror-manager hello PERSON`](#mirror-manager-hello-person)
* [`mirror-manager hello world`](#mirror-manager-hello-world)
* [`mirror-manager help [COMMAND]`](#mirror-manager-help-command)
* [`mirror-manager plugins`](#mirror-manager-plugins)
* [`mirror-manager plugins add PLUGIN`](#mirror-manager-plugins-add-plugin)
* [`mirror-manager plugins:inspect PLUGIN...`](#mirror-manager-pluginsinspect-plugin)
* [`mirror-manager plugins install PLUGIN`](#mirror-manager-plugins-install-plugin)
* [`mirror-manager plugins link PATH`](#mirror-manager-plugins-link-path)
* [`mirror-manager plugins remove [PLUGIN]`](#mirror-manager-plugins-remove-plugin)
* [`mirror-manager plugins reset`](#mirror-manager-plugins-reset)
* [`mirror-manager plugins uninstall [PLUGIN]`](#mirror-manager-plugins-uninstall-plugin)
* [`mirror-manager plugins unlink [PLUGIN]`](#mirror-manager-plugins-unlink-plugin)
* [`mirror-manager plugins update`](#mirror-manager-plugins-update)

## `mirror-manager hello PERSON`

Say hello

```
USAGE
  $ mirror-manager hello PERSON -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Who is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ mirror-manager hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [src/commands/hello/index.ts](https://github.com/sip-vis-cit-apps/mirror-manager/blob/v0.0.0/src/commands/hello/index.ts)_

## `mirror-manager hello world`

Say hello world

```
USAGE
  $ mirror-manager hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ mirror-manager hello world
  hello world! (./src/commands/hello/world.ts)
```

_See code: [src/commands/hello/world.ts](https://github.com/sip-vis-cit-apps/mirror-manager/blob/v0.0.0/src/commands/hello/world.ts)_

## `mirror-manager help [COMMAND]`

Display help for mirror-manager.

```
USAGE
  $ mirror-manager help [COMMAND...] [-n]

ARGUMENTS
  [COMMAND...]  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for mirror-manager.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/6.2.53/src/commands/help.ts)_

## `mirror-manager plugins`

List installed plugins.

```
USAGE
  $ mirror-manager plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ mirror-manager plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.84/src/commands/plugins/index.ts)_

## `mirror-manager plugins add PLUGIN`

Installs a plugin into mirror-manager.

```
USAGE
  $ mirror-manager plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into mirror-manager.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the MIRROR_MANAGER_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the MIRROR_MANAGER_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ mirror-manager plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ mirror-manager plugins add myplugin

  Install a plugin from a github url.

    $ mirror-manager plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ mirror-manager plugins add someuser/someplugin
```

## `mirror-manager plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ mirror-manager plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ mirror-manager plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.84/src/commands/plugins/inspect.ts)_

## `mirror-manager plugins install PLUGIN`

Installs a plugin into mirror-manager.

```
USAGE
  $ mirror-manager plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into mirror-manager.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the MIRROR_MANAGER_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the MIRROR_MANAGER_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ mirror-manager plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ mirror-manager plugins install myplugin

  Install a plugin from a github url.

    $ mirror-manager plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ mirror-manager plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.84/src/commands/plugins/install.ts)_

## `mirror-manager plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ mirror-manager plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ mirror-manager plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.84/src/commands/plugins/link.ts)_

## `mirror-manager plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ mirror-manager plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mirror-manager plugins unlink
  $ mirror-manager plugins remove

EXAMPLES
  $ mirror-manager plugins remove myplugin
```

## `mirror-manager plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ mirror-manager plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.84/src/commands/plugins/reset.ts)_

## `mirror-manager plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ mirror-manager plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mirror-manager plugins unlink
  $ mirror-manager plugins remove

EXAMPLES
  $ mirror-manager plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.84/src/commands/plugins/uninstall.ts)_

## `mirror-manager plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ mirror-manager plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  [PLUGIN...]  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ mirror-manager plugins unlink
  $ mirror-manager plugins remove

EXAMPLES
  $ mirror-manager plugins unlink myplugin
```

## `mirror-manager plugins update`

Update installed plugins.

```
USAGE
  $ mirror-manager plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/5.4.84/src/commands/plugins/update.ts)_
<!-- commandsstop -->
