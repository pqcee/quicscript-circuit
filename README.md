<h1 align="center">
  <p>QuICScript Circuit</p>
</h1>

<div align="center">
  Browser-native quantum emulator
  <br />
  <br />
  <a href="https://www.pqcee.com/product/quicscript">Link to product page</a>
</div>

<div align="center">
<br />

[![License: CC](https://img.shields.io/badge/License-CC-yellow.svg)](./LICENSE)

[![React](https://img.shields.io/badge/React-%2320232a.svg?logo=react&logoColor=%2361DAFB)](#)
[![made with hearth by dec0dOS](https://img.shields.io/badge/made%20with%20%E2%99%A5%20by-pqcee-979a82.svg?style=flat-square)](https://www.pqcee.com/)

</div>

<details open="open">
<summary>Table of Contents</summary>

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [Development](#development)
  - [Building the Project](#building-the-project)
- [License](#license)

</details>

## Getting Started

### Prerequisites

Node version: >=20.15.1

NPM version: >=10.9.1

### Installation

1. Clone the repo

```bash
git clone https://github.com/pqcee/quicscript-circuit/
```

2. Change directory

```bash
cd quicscript-circuit
```

3. Install dependencies manually

```bash
npm install
```

3. **(Recommended)** Alternatively, you can use [![VS Code Container](https://img.shields.io/static/v1?label=VS+Code&message=Dev%20Containers&logo=visualstudiocode&color=007ACC&logoColor=007ACC&labelColor=2C2C32)](https://open.vscode.dev/microsoft/vscode)

   - Installation guide: [VS Code Dev Containers](https://code.visualstudio.com/docs/devcontainers/containers)
   - Reopening the repo in Dev Container: [Open in Dev Container](https://vscode.dev/github/pqcee/quicscript-dev-react?devcontainer_path=.devcontainer/devcontainer.json)
   - Use the **Dev Containers: Reopen in Container** command from the Command Palette (`F1`, `Ctrl+Shift+P`).

## Usage

### Development

1. Start the development server

```bash
npm run dev
```

### Building the Project

1. Build Command

```bash
npm run build
```

> [!Note]
> The build command will generate the `./dist` folder with the following files:

```bash
./dist
├──index.html
└──assets/
    ├──QuICScript.js
    ├──QuICScript.wasm
    ├──index.js
    └──index.css
```

2. Run Preview Server (optional)

```bash
npm run preview
```

> [!Note]
> The preview server will run on `http://localhost:5173` by default. This is useful to view the production build of the project in your browser.

## License

See [LICENSE](./LICENSE) for more information.
