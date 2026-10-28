import { BubbleMenuPlugin, isNodeSelection, isTextSelection } from '@proseharbor-editor/core'
import { isString, isObject } from '../../utils'
import BubbleSelector from './selector/bubble-menu-selector'
import BubbleLinkSelector from './selector/bubble-menu-link-selector'
import BubbleTableSelector from './selector/bubble-menu-table-selector'
import BubbleImageSelector from './selector/bubble-menu-image-selector'

import { defineComponent, h, onBeforeUnmount, onMounted, ref, watch, computed } from 'vue'
import type { Editor } from '@proseharbor-editor/core'

const BUBBLE_MENU_SORT = [
  'fontFamily',
  'fontSize',
  '|',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'color',
  'background',
  'link',
  'textAlign',
  '|',
  'textClear',
]

export default defineComponent({
  name: 'ProseharborEditorBubble',
  props: {
    pluginKey: {
      type: [String, Object],
      default: 'proseharborEditorBubble',
    },

    sort: {
      type: Array,
      default: () => BUBBLE_MENU_SORT,
    },

    editor: {
      type: Object,
      required: true,
    },

    updateDelay: {
      type: Number,
      default: 60,
    },

    appendTo: {
      type: [Function, Object],
      default: () => () => document.body,
    },

    floatingOptions: {
      type: Object,
      default: () => ({}),
    },

    shouldShow: {
      type: [Function, null],
      default: null,
    },
  },
  setup(props, { slots }) {
    const root = ref<HTMLElement | null>(null)
    const registered = ref(false)

    // Determine whether the current selection is link
    const isLink = computed(() => (!props.editor ? false : props.editor.isActive('link')))
    // Determine whether the current selection is table
    const isTable = computed(() => (!props.editor ? false : props.editor.isActive('table')))
    // Determine whether the current selection is image
    const isImage = computed(() => (!props.editor ? false : props.editor.isActive('image')))
    // Determine whether the current selection is text
    // Why not use the TextSelection or AllSelection classes to determine if a selection instance belongs to that class?
    // Because the TextSelection and AllSelection classes were prefixed with module private prefixes during the rollup packaging,
    // it is not possible to correctly determine the
    const isText = computed(() =>
      !props.editor
        ? false
        : /TextSelection$/.test(props.editor.state.selection.constructor.name) ||
          /AllSelection$/.test(props.editor.state.selection.constructor.name) ||
          (typeof props.editor.state.selection.$cursor !== 'undefined' &&
            typeof props.editor.state.selection.empty !== 'undefined' &&
            typeof props.editor.state.selection.from === 'number' &&
            typeof props.editor.state.selection.to === 'number'),
    )

    const shouldShowDefault = ({ state, from, to, editor }) => {
      const { doc, selection } = state
      const { empty } = selection
      const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(state.selection)

      // Empty content or empty text blocks do not show bubble menus
      if (empty || isEmptyTextBlock) return false

      // 如果出现以下情况，则不显示气泡菜单：
      // 代码块 / 图片 / 该选择是一个节点选择（对于拖动控制柄）
      // 图片也是节点选择之一
      // if (editor.isActive('image')) {
      //   console.log(selection.node)
      //   return !!node.attrs?.src
      // }
      if (
        editor.isActive('codeBlock') ||
        (isNodeSelection(selection) && !editor.isActive('image'))
      ) {
        return false
      }

      // console.log("isText", isText.value);
      // console.log("isLink", isLink.value);
      // console.log("isTable", isTable.value);
      return isText.value || isLink.value || isTable.value || isImage.value
    }

    const registerPlugin = () => {
      if (registered.value || !root.value) return
      const { updateDelay, editor, pluginKey, shouldShow, appendTo, floatingOptions } = props

      editor.registerPlugin(
        BubbleMenuPlugin({
          updateDelay,
          editor: editor as unknown as Editor,
          element: root.value,
          pluginKey,
          shouldShow: shouldShow || shouldShowDefault,
          appendTo,
          options: floatingOptions,
        } as unknown as Parameters<typeof BubbleMenuPlugin>[0]),
      )

      registered.value = true
    }

    // 修复：窗口 resize 时 tiptap BubbleMenuPlugin 直接调用 updatePosition()
    // 绕过了 shouldShow 检查，导致气泡菜单在没有选中文字时也会显示
    // 解决方案：resize 后延迟检查，不满足 shouldShow 则强制隐藏
    let resizeTimer: ReturnType<typeof setTimeout> | null = null
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (!props.editor?.view || !root.value) return
        const { state, view } = props.editor
        const { selection } = state
        const shouldShowFn = props.shouldShow || shouldShowDefault
        const result = shouldShowFn({
          editor: props.editor,
          element: root.value,
          view,
          state,
          oldState: undefined,
          from: selection.from,
          to: selection.to,
        })
        if (!result) {
          // 只隐藏，不用 remove() 摘除节点：该节点由 Vue 渲染并托管，
          // 移除后插件与 patch 均找不到宿主，气泡菜单将无法再次显示
          root.value.style.visibility = 'hidden'
          root.value.style.opacity = '0'
        }
      }, 100)
    }

    onMounted(() => {
      window.addEventListener('resize', handleResize)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimer) clearTimeout(resizeTimer)
    })

    const bubbleMenus = computed(() => {
      return props.sort
        .map((menu) => {
          if (isString(menu)) {
            if (menu === '|') return { name: '|' }
            if (menu === 'textClear') {
              return {
                name: 'textClear',
                command: ({ editor }) => editor.chain().focus().unsetAllMarks().run(),
                isActive: () => null,
              }
            }
            const extension = props.editor.extensionManager.extensions.find(
              (ext) => ext.name === menu,
            )
            if (extension) {
              return {
                name: menu,
                ...extension?.options,
              }
            }

            return null
          }
          if (isObject(menu)) {
            return menu
          }
          return null
        })
        .filter(Boolean)
    })

    const init = () => {
      if (!props?.editor) return
      registerPlugin()
    }

    watch(
      () => props.editor,
      () => {
        init()
      },
    )
    onMounted(() => {
      init()
    })

    onBeforeUnmount(() => {
      const { pluginKey, editor } = props
      editor.unregisterPlugin(pluginKey)
      registered.value = false
    })

    return () =>
      h('div', { ref: root, style: { visibility: 'hidden', position: 'absolute' } }, [
        // 渲染基础气泡菜单
        bubbleMenus.value.length > 0 &&
          isText.value &&
          !isLink.value &&
          h(
            BubbleSelector,
            {
              editor: props.editor,
              menus: bubbleMenus.value,
            },
            slots,
          ),
        isLink.value &&
          h(BubbleLinkSelector, {
            editor: props.editor,
            menu: props.editor.extensionManager.extensions.find((menu) => menu.name === 'link')
              ?.options,
          }),
        isTable.value &&
          h(BubbleTableSelector, {
            editor: props.editor,
            menu: props.editor.extensionManager.extensions.find((menu) => menu.name === 'table')
              ?.options,
          }),
        isImage.value &&
          h(BubbleImageSelector, {
            editor: props.editor,
            menu: props.editor.extensionManager.extensions.find((menu) => menu.name === 'image')
              ?.options,
          }),
      ])
  },
})
