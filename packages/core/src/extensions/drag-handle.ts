// more info: https://github.com/vueditor/tiptap-extension-handle
import { Extension, isMacOS, createStyleTag } from '@tiptap/core'
import { NodeSelection, Plugin, PluginKey } from '@tiptap/pm/state'
import type { Transaction } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { computePosition, offset } from '@floating-ui/dom'
import debounce from 'lodash/debounce.js'

export const dragHandlePluginKey = new PluginKey<DragHandleState>('dragHandle')

/** 拖拽句柄插件状态 */
export interface DragHandleState {
  minX: number
  maxX: number
  x: number | null
  y: number | null
  pos: number | null
}

export interface DragHandleOptions {
  handleId: string
  handleBarId: string
}

interface HandleViewOptions extends DragHandleOptions {
  editorView: EditorView
  dragHandlePluginKey: PluginKey<DragHandleState>
}

// 生成样式
export function getStyle(handleId: string, handleBarId: string): string {
  return `
    #${handleId} {
      position: fixed;
      left: 0;
      top: 0;
      font-size: 16px;
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: transform 0.3s ease;
    }

    #${handleBarId} {
      cursor: pointer;
      padding: 0.3rem;
      border-radius: 0.375rem;
      transition: background-color 0.3s ease;
    }

    #${handleBarId}::after {
      display: inline-block;
      width: 1em;
      height: 1em;
      vertical-align: -0.125em;
      content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Cpath fill='%23000' fill-rule='evenodd' d='M19 10a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-4 18a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 14a4 4 0 1 0 0-8a4 4 0 0 0 0 8m22-32a4 4 0 1 1-8 0a4 4 0 0 1 8 0m-4 18a4 4 0 1 0 0-8a4 4 0 0 0 0 8m0 14a4 4 0 1 0 0-8a4 4 0 0 0 0 8' clip-rule='evenodd'/%3E%3C/svg%3E");
    }

    #${handleBarId}:hover {
      background-color:  rgba(var(--proseharbor-editor-color-border-val), 0.5);
    }

    #${handleBarId}:active {
      background-color:  rgba(var(--proseharbor-editor-color-border-val), 1);
    }
    `
}

// 鼠标进入编辑器
const onMouseenterDebounce = debounce((view: EditorView) => {
  const editorDom = view.dom
  const { x, width } = editorDom.getBoundingClientRect()
  view.dispatch(
    view.state.tr.setMeta(dragHandlePluginKey, {
      minX: x,
      maxX: x + width,
      pos: null,
    }),
  )
}, 10)

// 鼠标在编辑器中移动
const onMousemoveDebounce = debounce((view: EditorView, e: MouseEvent) => {
  view.dispatch(
    view.state.tr.setMeta(dragHandlePluginKey, {
      x: e.clientX,
      y: e.clientY,
      pos: null,
    }),
  )
}, 10)

// 鼠标离开编辑器
const onMouseleaveDebounce = debounce(
  (view: EditorView, e: MouseEvent, options: DragHandleOptions) => {
    const toDom = e.relatedTarget as Node | null
    const handleDom = document.getElementById(options.handleId)
    if (handleDom?.isEqualNode(toDom ?? null) || handleDom?.contains(toDom ?? null)) {
      return
    }

    view.dispatch(
      view.state.tr.setMeta(dragHandlePluginKey, {
        x: null,
        y: null,
        pos: null,
      }),
    )
  },
  10,
)

// 拖拽句柄视图类
export class HandleView {
  editorView: EditorView

  handleElement: HTMLElement

  handleBarElement: HTMLElement | null

  dragHandlePluginKey: PluginKey<DragHandleState>

  onDragStart = (e: DragEvent) => {
    const targetDom = this.getTargetDom()
    const targetPos = this.getTargetPos()
    if (!targetDom || !targetPos) {
      return
    }

    const nodeBox = (targetDom as Element).getBoundingClientRect()
    const handleBox = this.handleElement.getBoundingClientRect()

    const x = handleBox.x - nodeBox.x + e.offsetX
    const y = handleBox.y - nodeBox.y + e.offsetY
    e.dataTransfer?.setDragImage(targetDom as Element, x, y)

    const selection = NodeSelection.create(this.editorView.state.doc, targetPos - 1)
    const transaction = this.editorView.state.tr.setSelection(selection)
    this.editorView.dispatch(transaction)

    // dragging 为 ProseMirror 内部字段
    ;(this.editorView as unknown as { dragging: unknown }).dragging = {
      slice: selection.content(),
      move: !e[isMacOS() ? 'altKey' : 'ctrlKey'],
    }
  }

  constructor(options: HandleViewOptions) {
    // 初始化拖拽句柄视图
    this.editorView = options.editorView
    this.handleElement = document.getElementById(options.handleId) as HTMLElement
    this.handleBarElement = this.handleElement.querySelector<HTMLElement>(`#${options.handleBarId}`)
    this.dragHandlePluginKey = options.dragHandlePluginKey

    this.handleElement?.addEventListener('dragstart', this.onDragStart)
  }

  // 获取目标位置
  getTargetPos(): number | null | undefined {
    if (!this.editorView.editable) {
      return undefined
    }

    const state = this.dragHandlePluginKey.getState(this.editorView.state)
    if (!state) {
      return null
    }

    if (state.pos) {
      const { node } = this.editorView.domAtPos(state.pos)
      if (node.nodeType === 3) return null
      const { x, y } = (node as Element).getBoundingClientRect()

      this.editorView.dispatch(
        this.editorView.state.tr.setMeta(dragHandlePluginKey, {
          x,
          y,
          pos: null,
        }),
      )

      return state.pos
    }

    const { x, y, minX, maxX } = state
    if (x === null || y === null) {
      return null
    }

    const left = Math.min(Math.max(x, minX), maxX)
    const top = y
    if (Number.isNaN(left) || Number.isNaN(top)) {
      return null
    }

    const posInfo = this.editorView.posAtCoords({
      left,
      top,
    })
    if (!posInfo) {
      return null
    }

    const { pos } = posInfo

    return this.editorView.state.doc.resolve(pos).start(1)
  }

  // 获取目标DOM元素
  getTargetDom(): Node | null {
    const pos = this.getTargetPos()
    if (!pos) {
      return null
    }

    return this.editorView.nodeDOM(pos - 1)
  }

  // 更新拖拽句柄位置
  updatePosition(targetDom: Node): void {
    computePosition(targetDom as Element, this.handleElement, {
      placement: 'left-start',
      strategy: 'fixed',
      middleware: [offset(8)],
    }).then(({ x, y }) => {
      Object.assign(this.handleElement.style, {
        transform: `translateX(${x}px) translateY(${y}px)`,
        opacity: 1,
      })
    })
  }

  // 更新视图
  update(): void {
    const targetDom = this.getTargetDom()

    if (targetDom) {
      this.updatePosition(targetDom)
    } else if (this.handleElement) {
      let transform = this.handleElement.style.transform
      let opacity = this.handleElement.style.opacity
      if (transform) {
        transform = transform.replace(/translateY\(.+\)/, 'translateY(-128px)')
        opacity = '0'
      } else {
        transform = 'translateY(-128px)'
        opacity = '0'
      }

      Object.assign(this.handleElement.style, {
        // transform,
        opacity,
      })
    }
  }

  // 销毁视图
  destroy(): void {
    this.handleElement.removeEventListener('dragstart', this.onDragStart)
  }
}

// 创建拖拽句柄插件
export function handlePlugin(options: DragHandleOptions): Plugin<DragHandleState> {
  const plugin = new Plugin<DragHandleState>({
    key: dragHandlePluginKey,
    state: {
      init(): DragHandleState {
        return {
          minX: 0,
          maxX: Number.MAX_SAFE_INTEGER,
          x: null,
          y: null,
          pos: null,
        }
      },
      apply(tr: Transaction, value: DragHandleState): DragHandleState {
        const newState = Object.assign({}, value, tr.getMeta(dragHandlePluginKey))
        const isDrop = tr.getMeta('uiEvent') === 'drop'

        if (isDrop) {
          const nodeSelection = tr.selection
          newState.pos = nodeSelection.anchor + 1
        }

        return newState
      },
    },
    props: {
      handleDOMEvents: {
        mouseenter(view: EditorView) {
          onMouseenterDebounce(view)
        },

        mousemove(view: EditorView, e: MouseEvent) {
          onMousemoveDebounce(view, e)
        },
        mouseleave(view: EditorView, e: MouseEvent) {
          onMouseleaveDebounce(view, e, options)
        },
      },
    },
    view(view: EditorView) {
      return new HandleView({
        editorView: view,
        dragHandlePluginKey,
        ...options,
      } as HandleViewOptions)
    },
  })

  return plugin
}

export const DragHandle = Extension.create<DragHandleOptions>({
  name: 'dragHandle',

  addOptions() {
    return {
      handleId: 'editor-handle',
      handleBarId: 'editor-handle-bar',
    }
  },

  addProseMirrorPlugins() {
    return [
      handlePlugin({
        handleId: this.options.handleId,
        handleBarId: this.options.handleBarId,
      }),
    ]
  },

  onBeforeCreate() {
    if (document.getElementById(this.options.handleId)) {
      return
    }

    const handleElement = document.createElement('div')
    handleElement.setAttribute('id', this.options.handleId)
    handleElement.setAttribute('data-editor', 'true')

    const handleBarElement = document.createElement('div')
    handleBarElement.setAttribute('id', this.options.handleBarId)
    handleBarElement.classList.add('icon-park-outline--drag')
    handleBarElement.setAttribute('draggable', 'true')

    handleElement.appendChild(handleBarElement)
    createStyleTag(
      getStyle(this.options.handleId, this.options.handleBarId),
      undefined,
      this.options.handleId,
    )
    document.body.appendChild(handleElement)
  },

  onDestroy() {
    // disable in development, for StrictMode in React dev
    if (!import.meta.env.PROD) {
      return
    }

    const handleElement = document.getElementById(this.options.handleId)

    if (handleElement?.getAttribute('data-editor') === 'true') {
      handleElement.remove()
    }
  },
})

export default DragHandle
