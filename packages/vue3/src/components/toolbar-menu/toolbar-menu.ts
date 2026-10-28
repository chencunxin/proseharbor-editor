import { defineComponent, computed, h } from 'vue'
import { prefixClass, t, isNodeSelection } from '@proseharbor-editor/core'
import { IButton, IDivider, ITooltip, IIcon } from '../ui'
import { isString, isObject } from '../../utils'
import ButtonLink from '../special-button/button-link'
import ButtonTextAlign from '../special-button/button-text-align'
import ButtonColor from '../special-button/button-color'
import ButtonBackground from '../special-button/button-background'
import ButtonFontFamily from '../special-button/button-font-family'
import ButtonFontSize from '../special-button/button-font-size'
import ButtonTable from '../special-button/button-table'
import ButtonImage from '../special-button/button-image'

const TOOLBAR_MENU_SORT = [
  'history',
  '|',
  'textClear',
  '|',
  'fontFamily',
  'fontSize',
  '|',
  'bold',
  'italic',
  'underline',
  'strike',
  'code',
  'subscript',
  'superscript',
  '|',
  'color',
  'background',
  'textAlign',
  'table',
  'link',
  'image',
  'codeBlock',
  '|',
  'bulletList',
  'orderedList',
  'taskList',
  '|',
  'blockquote',
  'hardBreak',
  'indent',
  'outdent',
  '|',
  'divider',
  '|',
  'codeView',
]

// 选中图片（节点选区）时无法生效的功能，需要置灰
// 这些命令在该选区下 can() 均为 false，点击后不会有任何效果
const IMAGE_SELECTION_DISABLED_MENUS = new Set([
  'textClear',
  'table',
  'hardBreak',
  'divider',
  'bulletList',
  'orderedList',
  'taskList',
  'textAlign',
])

export default defineComponent({
  name: 'ProseharborEditorToolbar',
  props: {
    editor: {
      type: Object,
      required: true,
    },
    sort: {
      type: Array,
      default: () => TOOLBAR_MENU_SORT,
    },
    codeView: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots }) {
    const slotPrefix = slots['prefix']
    const slotSuffix = slots['suffix']

    // 获取 codeView 状态（支持 ref 或普通 boolean）
    const codeViewValue = computed(() => {
      const cv = props.codeView
      if (cv && typeof cv === 'object' && 'value' in cv) {
        return (cv as { value: boolean }).value
      }
      return cv
    })

    // 光标是否位于代码块内（每次渲染实时计算）
    const isInCodeBlock = () => !!props.editor?.isActive?.('codeBlock')

    // 是否选中了图片（节点选区）；读取 editor.state 以建立响应式依赖，
    // 选区变化后工具栏会重新渲染
    const isImageSelected = () => {
      const selection = props.editor?.state?.selection
      if (!isNodeSelection(selection)) return false
      return selection.node?.type?.name === 'image'
    }

    // 图片节点选区下的禁用态：部分命令在该选区下无任何效果，需置灰
    const isDisabledByImage = (name) =>
      isImageSelected() && IMAGE_SELECTION_DISABLED_MENUS.has(name)

    // 通用禁用态：代码预览模式或光标位于代码块内时生效。
    // 仅作用于除撤销/重做（history）与代码预览（codeView）之外的按钮
    const isGloballyDisabled = () => codeViewValue.value || isInCodeBlock()

    const toolbarMenus = computed(() => {
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
            if (menu === 'codeView') {
              return {
                name: 'codeView',
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
        })
        .filter(Boolean)
    })

    return () =>
      h('div', { class: `${prefixClass}-toolbar-menu` }, [
        slotPrefix && slotPrefix({ editor: props.editor }),
        toolbarMenus.value.map((menu) => {
          // 检查是否存在对应的具名插槽
          const slotName = slots[menu.name]

          if (slotName) {
            // 如果存在具名插槽，使用插槽内容
            return slotName({
              editor: props.editor,
              ...menu,
            })
          }

          if (menu.name === '|') {
            return h(IDivider, {
              type: 'vertical',
              style: { height: '1.5rem' },
            })
          }

          // codeView 按钮特殊处理
          if (menu.name === 'codeView') {
            return h(
              ITooltip,
              { text: t('codeView'), shortcutkeys: menu.shortcutkeys },
              {
                default: () =>
                  h(
                    IButton,
                    {
                      active: codeViewValue.value,
                      onClick: () => props.editor?.toggleCodeView?.(),
                    },
                    {
                      icon: () =>
                        h(IIcon, {
                          name: 'codeView',
                          size: 14,
                        }),
                    },
                  ),
              },
            )
          }

          if (menu.name === 'history' || menu.name === 'indent') {
            // 撤销/重做在代码块内保持可用，缩进仍受通用禁用态约束
            const baseDisabled =
              menu.name === 'history' ? codeViewValue.value : isGloballyDisabled()
            return menu.list.map((item) =>
              h(
                ITooltip,
                { text: t(item.name), shortcutkeys: item.shortcutkeys },
                {
                  default: () =>
                    h(
                      IButton,
                      {
                        active: item?.isActive && item?.isActive({ editor: props.editor }),
                        disabled:
                          baseDisabled ||
                          (item?.isDisabled && item?.isDisabled({ editor: props.editor })),
                        onClick: () => item.command({ editor: props.editor }),
                      },
                      {
                        icon: () =>
                          h(IIcon, {
                            name: item.name,
                            size: 14,
                          }),
                      },
                    ),
                },
              ),
            )
          }

          if (menu.name === 'link') {
            return h(ButtonLink, {
              editor: props.editor,
              menu,
              toolbar: true,
              disabled: isGloballyDisabled(),
            })
          }

          if (menu.name === 'textAlign') {
            return h(ButtonTextAlign, {
              editor: props.editor,
              menu,
              disabled: isGloballyDisabled() || isDisabledByImage('textAlign'),
            })
          }

          if (menu.name === 'color') {
            return h(ButtonColor, {
              editor: props.editor,
              menu,
              disabled: isGloballyDisabled(),
            })
          }

          if (menu.name === 'background') {
            return h(ButtonBackground, {
              editor: props.editor,
              menu,
              disabled: isGloballyDisabled(),
            })
          }

          if (menu.name === 'fontFamily') {
            return h(ButtonFontFamily, {
              editor: props.editor,
              menu,
              disabled: isGloballyDisabled(),
            })
          }

          if (menu.name === 'fontSize') {
            return h(ButtonFontSize, {
              editor: props.editor,
              menu,
              disabled: isGloballyDisabled(),
            })
          }

          if (menu.name === 'table') {
            return h(ButtonTable, {
              editor: props.editor,
              menu,
              disabled: isGloballyDisabled() || isDisabledByImage('table'),
            })
          }

          if (menu.name === 'image') {
            return h(ButtonImage, {
              editor: props.editor,
              menu,
              disabled: isGloballyDisabled(),
            })
          }

          return h(
            ITooltip,
            { text: t(menu.name), shortcutkeys: menu.shortcutkeys },
            {
              default: () =>
                h(
                  IButton,
                  {
                    active: menu?.isActive && menu?.isActive({ editor: props.editor }),
                    disabled:
                      isGloballyDisabled() ||
                      isDisabledByImage(menu.name) ||
                      (menu?.isDisabled && menu?.isDisabled({ editor: props.editor })),
                    onClick: () => menu.command({ editor: props.editor }),
                  },
                  {
                    icon: () =>
                      h(IIcon, {
                        name: menu.name,
                        size: 14,
                      }),
                  },
                ),
            },
          )
        }),
        slotSuffix && slotSuffix({ editor: props.editor }),
      ])
  },
})
