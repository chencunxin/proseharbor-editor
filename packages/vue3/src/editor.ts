import { Editor as CoreEditor } from '@proseharbor-editor/core'
import type { EditorOptions } from '@proseharbor-editor/core'
import type { EditorState, Plugin, PluginKey } from '@tiptap/pm/state'
import { customRef, markRaw } from 'vue'
import type { Ref } from 'vue'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * 带节流的响应式引用：状态变化后在下一帧统一触发更新
 *
 * - 同一帧内的多次写入合并为一次 trigger，避免每笔 transaction 都排队动画帧
 * - 通过 cancelHandlers 暴露取消能力，destroy() 后可彻底停止更新
 */
function useDebouncedRef<T>(value: T, cancelHandlers: Set<() => void>): Ref<T> {
  return customRef<T>((track, trigger) => {
    let frameId = 0

    const cancel = () => {
      if (!frameId) return
      cancelAnimationFrame(frameId)
      frameId = 0
    }

    cancelHandlers.add(cancel)

    return {
      get() {
        track()
        return value
      },
      set(newValue: T) {
        // update state
        value = newValue

        // 已有 pending 帧，等它一起触发即可
        if (frameId) return

        // update view as soon as possible
        frameId = requestAnimationFrame(() => {
          frameId = requestAnimationFrame(() => {
            frameId = 0
            trigger()
          })
        })
      },
    }
  })
}

/** 扩展自内核 Editor，提供 Vue 响应式状态与应用上下文 */
export class Editor extends CoreEditor {
  /** <EditorContent> 组件实例 */
  contentComponent: AnyRecord | null = null

  /** 应用上下文（含 provides），用于节点视图内渲染组件 */
  appContext: AnyRecord | null = null

  /** 响应式的编辑器状态 */
  reactiveState!: Ref<EditorState>

  /** 响应式的扩展 storage */
  reactiveExtensionStorage!: Ref<AnyRecord>

  /** 待处理的动画帧取消器，编辑器销毁时统一清理 */
  private pendingRefUpdates = new Set<() => void>()

  constructor(options: Partial<EditorOptions> = {}) {
    super(options)

    this.reactiveState = useDebouncedRef(this.view.state, this.pendingRefUpdates)
    this.reactiveExtensionStorage = useDebouncedRef(
      this.extensionStorage as AnyRecord,
      this.pendingRefUpdates,
    )

    this.on('beforeTransaction', ({ nextState }) => {
      this.reactiveState.value = nextState
      this.reactiveExtensionStorage.value = this.extensionStorage as AnyRecord
    })

    return markRaw(this)
  }

  /** 销毁编辑器，并取消所有尚未触发的响应式更新 */
  override destroy(): void {
    this.pendingRefUpdates.forEach((cancel) => cancel())
    this.pendingRefUpdates.clear()

    super.destroy()
  }

  override get state(): EditorState {
    return this.reactiveState ? this.reactiveState.value : this.view.state
  }

  override get storage(): CoreEditor['storage'] {
    return (
      this.reactiveExtensionStorage ? this.reactiveExtensionStorage.value : super.storage
    ) as CoreEditor['storage']
  }

  /**
   * 注册 ProseMirror 插件
   */
  override registerPlugin(
    plugin: Plugin,
    handlePlugins?: (newPlugin: Plugin, plugins: Plugin[]) => Plugin[],
  ): EditorState {
    const nextState = super.registerPlugin(plugin, handlePlugins)

    if (this.reactiveState) {
      this.reactiveState.value = nextState
    }

    return nextState
  }

  /**
   * 注销 ProseMirror 插件
   */
  override unregisterPlugin(nameOrPluginKey: string | PluginKey): EditorState | undefined {
    const nextState = super.unregisterPlugin(nameOrPluginKey)

    if (this.reactiveState && nextState) {
      this.reactiveState.value = nextState
    }

    return nextState
  }
}
