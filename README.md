# VSScope

An extension providing a similar experience to the `telescope-nvim` plugin for Neovim

## Basic Use

Press `Ctrl+Shift+J` to invoke the menu when you have a folder open.

Select which file you wish to open

## Configuration

The command that invokes the menu is `vsscope.telescopeMenu`. Use it to change the keybinding

You can control whether or not the file is opened in a new editor with the `vsscope.openInNewEditor` setting. By default it is set to `true`

You can control what files/folder are ignored by VSScope with the `vsscope.ignore` setting. It supports the format used by .gitignore

## License

VSScope is licensed under the MIT License
