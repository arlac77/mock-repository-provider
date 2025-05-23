[![npm](https://img.shields.io/npm/v/mock-repository-provider.svg)](https://www.npmjs.com/package/mock-repository-provider)
[![License](https://img.shields.io/badge/License-0BSD-blue.svg)](https://spdx.org/licenses/0BSD.html)
[![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript\&label\&labelColor=blue\&color=555555)](https://typescriptlang.org)
[![bundlejs](https://deno.bundlejs.com/?q=mock-repository-provider\&badge=detailed)](https://bundlejs.com/?q=mock-repository-provider)
[![downloads](http://img.shields.io/npm/dm/mock-repository-provider.svg?style=flat-square)](https://npmjs.org/package/mock-repository-provider)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/mock-repository-provider.svg?style=flat-square)](https://github.com/arlac77/mock-repository-provider/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Farlac77%2Fmock-repository-provider%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/arlac77/mock-repository-provider/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/mock-repository-provider/badge.svg)](https://snyk.io/test/github/arlac77/mock-repository-provider)
[![Coverage Status](https://coveralls.io/repos/arlac77/mock-repository-provider/badge.svg)](https://coveralls.io/github/arlac77/mock-repository-provider)

# mock-repository-provider

mocking repository provider

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

*   [MockRepository](#mockrepository)
    *   [fullName](#fullname)
*   [MockProvider](#mockprovider)
    *   [Parameters](#parameters)
    *   [url](#url)
    *   [name](#name)

## MockRepository

**Extends Repository**

### fullName

Full repository name within the provider.

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** full repo name

## MockProvider

**Extends MultiGroupProvider**

### Parameters

*   `files` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)**&#x20;
*   `options` &#x20;

### url

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** '<http://mock-provider.com>'

### name

We are called mock.

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** mock

# install

With [npm](http://npmjs.org) do:

```shell
npm install {{name}}
```

# license

BSD-2-Clause
