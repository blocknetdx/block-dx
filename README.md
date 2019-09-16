![BLOCK DX](BLOCKDX.png)

[Download Block DX](https://github.com/blocknetdx/block-dx/releases/latest) |
-------------|

BLOCK DX is a decentralized exchange dApp built on top of the [Blocknet Protocol](https://api.blocknet.co). This repository is maintained by the Blocknet Core Team. We encourage the community to create dApps on top of Blocknet. Please connect with our community on [Discord](https://discord.gg/2e6s7H8). More information about Blocknet can be found on the [Blocknet website](https://blocknet.co) and [documentation portal](https://docs.blocknet.co).

[Website](https://blocknet.co) | [API](https://api.blocknet.co) | [Documentation](https://docs.blocknet.co) | [Discord](https://discord.gg/2e6s7H8)
-------------|-------------|-------------|-------------

# Dev Instructions

Block DX requires the [Blocknet wallet](https://github.com/blocknetdx/blocknet/releases/latest) and the wallets of the assets you want to view a market for to be setup and synced.

## Build and run locally:

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.1.

1. Install dependencies: `npm install`
1. Start the dev server: `npm start`
    * To start with the Mock (in-memory) API: `npm start -- -e="mock"`.
1. In a new terminal window:
    1. Build app: `npm run build`
    1. Launch app: `npm run start-app`

The app will launch and automatically reload if you change any files within `src/`.

#### Build native packages:
 
`npm run pack-native`

This will build the installer artifacts for the current system (Windows, MacOS, Linux).

## Pull requests

Please branch off of the branch titled after the next release. For example, if the [latest release](https://github.com/blocknetdx/block-dx/releases/latest) is version 1.4.0 then look for a branch titled 1.4.1, 1.5.0, or 2.0.0.

## Running unit tests

Run `npm run test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `npm run e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `npm start`.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

# License

By downloading and using this software, you acknowledge that:
- This is an open source tool and you agree to use this tool in accordance with local laws.
- This software is in beta and can include bugs that may result in irretrievable loss of funds.
- This software is licensed under The MIT License and you agree to the terms of the license below.

[ X ] By using this software you acknowledge the financial and legal risks of using this software and agree to assume all responsibility. If you do not agree to these terms do not use the software.

The MIT License (MIT)

Copyright (c) 2018 The Blocknet Developers

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
