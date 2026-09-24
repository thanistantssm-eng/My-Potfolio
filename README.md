# Thanistan Roy — VS Code Portfolio V3

A static portfolio that behaves like a Visual Studio Code workspace while rendering the actual portfolio UI inside the editor area.

## Profile used in this build

- Thanistan Roy
- Software Engineer
- Founder, X10 THINK

## Run

Open `index.html` directly in a browser, or serve the folder with any static server.

## Main interactions

- Explorer files navigate Home, About, Skills, Projects, Experience and Contact.
- Every page has its own typing/reveal sequence.
- Home uses Thanistan's original portrait asset with a subtle CSS glitch effect.
- The top navigation is portfolio-specific: Overview, Work, Journey, Connect and Terminal.
- The theme button switches between Gold Night and VS Code Blue accents.
- `Ctrl+P` opens the command palette.
- `Ctrl+B` toggles the sidebar.
- `Ctrl+Shift+E` opens Explorer.
- `Ctrl+Shift+F` opens Search.
- `Ctrl+\`` toggles the integrated terminal.

## Interactive terminal

Open Terminal from the top navigation, editor action or Status Bar. Supported commands include:

- `help`
- `ls` / `dir`
- `pwd`
- `cd home`
- `cd about`
- `cd skills`
- `cd projects`
- `cd experience`
- `cd contact`
- `open <page>`
- `whoami`
- `run`
- `theme`
- `clear` / `cls`

Arrow Up/Down recalls command history. Tab autocompletes `cd` page names.

## Contact form validation

Submitting with missing or invalid data shows an inline warning below the relevant field. Correcting the field clears the warning; a valid submission removes all warnings and displays a success state.

## VS Code UI references

The interface is inspired by the Visual Studio Code workbench structure. Product icon geometry is based on Microsoft's open-source VS Code Codicons project (MIT licensed).

- https://code.visualstudio.com/docs/getstarted/userinterface
- https://github.com/microsoft/vscode-codicons
"# My-Potfolio" 
