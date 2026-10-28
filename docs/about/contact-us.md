# Contact Us

## Links

| Resource          | URL                                                            |
| ----------------- | -------------------------------------------------------------- |
| GitHub repository | <https://github.com/chencunxin/proseharbor-editor>             |
| Issues            | <https://github.com/chencunxin/proseharbor-editor/issues>      |
| Discussions       | <https://github.com/chencunxin/proseharbor-editor/discussions> |
| Playground        | <https://proseharbor.acnrs.com>                                |
| Documentation     | <https://proseharbor-doc.acnrs.com>                            |
| npm — core        | <https://www.npmjs.com/package/@proseharbor-editor/core>       |
| npm — vue3        | <https://www.npmjs.com/package/@proseharbor-editor/vue3>       |

## Reporting a bug

Please open an issue and include:

1. The version of `@proseharbor-editor/core` and `@proseharbor-editor/vue3`.
2. A minimal reproduction (a playground link is ideal).
3. What you expected and what happened, including any console output.

## Feature requests

Open an issue describing the use case. If you plan to implement it yourself,
please open the issue first so we can agree on the API.

## Security

If you find a security issue, please **do not** open a public issue. Contact the
maintainers privately through GitHub so a fix can be released first.

## Contributing translations

To add a language, build a resource bundle and register it:

```ts
import { addLocale, changeLocale } from '@proseharbor-editor/core'

addLocale('fr', { bold: 'Gras', italic: 'Italique' /* … */ })
changeLocale('fr')
```

Start from `packages/core/src/locales/en.json` for the complete key list, then
open a pull request adding `packages/core/src/locales/<lng>.json` and registering
it in `packages/core/src/locales/index.ts`.

See [Internationalization](../guide/i18n).
