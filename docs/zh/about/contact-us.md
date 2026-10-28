# 联系我们

## 相关链接

| 资源        | 地址                                                           |
| ----------- | -------------------------------------------------------------- |
| GitHub 仓库 | <https://github.com/chencunxin/proseharbor-editor>             |
| Issues      | <https://github.com/chencunxin/proseharbor-editor/issues>      |
| Discussions | <https://github.com/chencunxin/proseharbor-editor/discussions> |
| 演示        | <https://proseharbor.acnrs.com>                                |
| 文档        | <https://proseharbor-doc.acnrs.com>                            |
| npm — core  | <https://www.npmjs.com/package/@proseharbor-editor/core>       |
| npm — vue3  | <https://www.npmjs.com/package/@proseharbor-editor/vue3>       |

## 反馈问题

请提交 issue，并包含以下内容：

1. `@proseharbor-editor/core` 与 `@proseharbor-editor/vue3` 的版本号。
2. 最小复现（能提供 playground 链接最好）。
3. 期望结果与实际结果，以及控制台输出。

## 功能建议

请提交 issue 描述你的使用场景。如果你打算自己实现，也请先开 issue，以便我们先对齐 API。

## 安全问题

如果发现安全漏洞，请**不要**提交公开 issue，请通过 GitHub 私下联系维护者，以便先发布修复版本。

## 贡献翻译

新增语言只需构造资源包并注册：

```ts
import { addLocale, changeLocale } from '@proseharbor-editor/core'

addLocale('fr', { bold: 'Gras', italic: 'Italique' /* … */ })
changeLocale('fr')
```

可以参考 `packages/core/src/locales/en.json` 获取完整 key 列表，然后提交 PR：新增
`packages/core/src/locales/<lng>.json`，并在
`packages/core/src/locales/index.ts` 中注册。

详见[国际化](../guide/i18n)。
