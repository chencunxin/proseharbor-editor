import ProseharborEditorSlash from './slash-menu'
import { VueRenderer } from '../../utils/render'
import { createTippy } from '../../utils/tippy'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** 斜杠菜单项 */
export interface SlashSuggestionItem extends AnyRecord {
  name: string
  desc?: string
  icon?: string
  command?: (context: AnyRecord) => void
}

export function createSlashSuggestion(options: AnyRecord = {}) {
  return {
    suggestion: {
      char: '/',
      command: ({ editor, range, props }: AnyRecord) => {
        props.command({ editor, range })
      },
      ...createSlashSuggestionItems(),
      ...createSlashSuggestionRender(),
      ...options,
    },
  }
}

/**
 * 候选项来源
 *
 * items 返回空数组不会影响菜单弹出：@tiptap/suggestion 在 started 状态下先调用
 * renderer.onStart 才异步取 items，真正的候选列表由 ProseharborEditorSlash
 * 组件自行按 extensions 计算，因此这里保持空实现即可。
 */
export function createSlashSuggestionItems() {
  return {
    // editor / query 由使用方按需实现（历史实现已注释保留）
    items: ({ editor: _editor, query: _query }: AnyRecord): SlashSuggestionItem[] => {
      // ({ editor, query }) => {
      // const nodes = editor.extensionManager.extensions
      //   .filter((item) => item?.options?.slash)
      return []
    },
  }
}

export function createSlashSuggestionRender(options: AnyRecord = {}) {
  const { component = ProseharborEditorSlash, tippyOptions = {}, handleKeyDown } = options

  return {
    render: () => {
      let renderer
      let popup

      return {
        onStart: (props) => {
          const { selection } = props.editor.state
          const parentNode = selection.$from.node(selection.$from.depth)

          if (parentNode.type.name === 'codeBlock') {
            return false
          }

          renderer = new VueRenderer(component, {
            props,
            editor: props.editor,
          })

          popup = createTippy(document.body, {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: renderer.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
            hideOnClick: true,
            ...tippyOptions,
          })
        },

        onUpdate: (props) => {
          renderer?.updateProps(props)
          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect,
          })
        },

        onKeyDown: (props) => {
          if (handleKeyDown) {
            return handleKeyDown(props, { popup, renderer })
          }

          // 默认键盘处理逻辑
          if (props.event.key === 'Escape') {
            popup?.[0]?.hide()
            return true
          }

          if (props.event.key === 'Enter') {
            popup?.[0]?.hide()
          }

          return renderer.ref?.onKeyDown && renderer.ref?.onKeyDown(props)
        },

        onExit: () => {
          popup?.[0]?.destroy()
          renderer?.destroy()
        },
      }
    },
  }
}
