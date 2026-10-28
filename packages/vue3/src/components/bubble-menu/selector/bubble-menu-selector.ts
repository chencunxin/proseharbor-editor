import { defineComponent, h } from 'vue'
import { prefixClass, t } from '@proseharbor-editor/core'
import ButtonLink from '../../special-button/button-link'
import ButtonColor from '../../special-button/button-color'
import ButtonBackground from '../../special-button/button-background'
import ButtonTextAlign from '../../special-button/button-text-align'
import ButtonFontFamily from '../../special-button/button-font-family'
import ButtonFontSize from '../../special-button/button-font-size'
import { ITooltip, IButton, IDivider, IIcon } from '../../ui'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

export default defineComponent({
  name: 'BubbleSelector',
  props: {
    menus: {
      type: Array,
      required: true,
    },
    editor: {
      type: Object,
      required: true,
    },
  },
  setup(props, { slots }) {
    const slotPrefix = slots['prefix']
    const slotSuffix = slots['suffix']

    return () =>
      h('div', { class: `${prefixClass}-bubble-menu` }, [
        slotPrefix && slotPrefix({ editor: props.editor }),
        ...(props.menus as AnyRecord[]).map((menu: AnyRecord) => {
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

          if (menu.name === 'link') {
            return h(ButtonLink, {
              editor: props.editor,
              menu,
            })
          }

          if (menu.name === 'color') {
            return h(ButtonColor, {
              editor: props.editor,
              menu,
            })
          }

          if (menu.name === 'background') {
            return h(ButtonBackground, {
              editor: props.editor,
              menu,
            })
          }

          if (menu.name === 'textAlign') {
            return h(ButtonTextAlign, {
              editor: props.editor,
              menu,
            })
          }

          if (menu.name === 'fontFamily') {
            return h(ButtonFontFamily, {
              editor: props.editor,
              menu,
            })
          }

          if (menu.name === 'fontSize') {
            return h(ButtonFontSize, {
              editor: props.editor,
              menu,
            })
          }

          // 默认渲染逻辑
          return h(
            ITooltip,
            {
              text: t(menu.name),
              shortcutkeys: menu.shortcutkeys,
            },
            {
              default: () =>
                h(
                  IButton,
                  {
                    disabled: menu?.isDisabled && menu?.isDisabled({ editor: props.editor }),
                    active: menu?.isActive({ editor: props.editor }),
                    onClick: () => menu.command({ editor: props.editor }),
                  },
                  {
                    icon: () => h(IIcon, { name: menu.name, size: 14 }),
                  },
                ),
            },
          )
        }),
        slotSuffix && slotSuffix({ editor: props.editor }),
      ])
  },
})
