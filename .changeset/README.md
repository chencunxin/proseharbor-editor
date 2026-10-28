# Changesets

本仓库用 [Changesets](https://github.com/changesets/changesets) 管理版本号与 CHANGELOG。

## 日常流程

1. **改代码**（`packages/*` 下）。
2. **写一条 changeset**（描述这次改动属于哪种语义化版本）：

   ```bash
   yarn changeset
   ```

   交互式选择受影响的包与 `patch` / `minor` / `major`，会在 `.changeset/` 下生成一个
   `xxx-xxx-xxx.md` 文件，**和代码一起提交**。

3. 合并到主干后，CI 会自动开一个 **Version Packages** PR：汇总所有 changeset，
   升版本号、写 CHANGELOG、删掉已消费的 md 文件。
4. 合并该 PR 后，CI 自动 `changeset publish` 发布到 npm。

## 命令

| 命令                    | 说明                                                 |
| ----------------------- | ---------------------------------------------------- |
| `yarn changeset`        | 交互式新增一条 changeset                             |
| `yarn changeset status` | 查看待发布的变更                                     |
| `yarn version:packages` | 消费 changeset：升版本 + 生成 CHANGELOG（CI 里执行） |
| `yarn release`          | 发布到 npm（包内 `prepack` 会先构建）                |

## 说明

- 只有 `packages/*` 会被发布；`playground`、`docs` 是私有包，已在
  `config.json` 的 `ignore` 中排除。
- `@proseharbor-editor/vue3` 依赖 `@proseharbor-editor/core`，
  `updateInternalDependencies: "patch"` 表示 core 发版时 vue3 也会跟着发一个 patch。
- 两个包版本独立演进；如果要锁成同版本，把 `config.json` 的 `linked` 改成
  `[["@proseharbor-editor/core", "@proseharbor-editor/vue3"]]`。
- changelog 由 `@changesets/changelog-git` 生成（只依赖 git 提交）。
  若想生成带 PR / 作者链接的 CHANGELOG，换成 `@changesets/changelog-github`
  并在 `config.json` 里配置 `"changelog": ["@changesets/changelog-github", { "repo": "owner/repo" }]`。
- `baseBranch` 当前是 `main`，如果仓库默认分支是 `master`，记得同步修改
  `.changeset/config.json` 与 `.github/workflows/release.yml`。

## 手动写 changeset

也可以直接新建 `.changeset/<任意名字>.md`：

```md
---
'@proseharbor-editor/core': patch
'@proseharbor-editor/vue3': patch
---

修复 xxx 在 yyy 场景下的问题
```
