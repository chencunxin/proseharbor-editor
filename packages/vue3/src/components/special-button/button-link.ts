import { defineComponent, nextTick, h, ref } from 'vue'
import { prefixClass, t } from '@proseharbor-editor/core'
import { ITooltip, IButton, ITrigger, IIcon } from '../ui'
import { sanitizeUrl } from '../../utils/url'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

export default defineComponent({
  name: 'ButtonLink',
  props: {
    editor: {
      type: Object,
      required: true,
    },
    menu: {
      type: Object,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
    toolbar: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const triggerRef = ref<AnyRecord | null>(null)
    const linkInputRef = ref<AnyRecord | null>(null)
    const linkUrl = ref('')
    const isShown = ref(false)
    const openInNewTab = ref(true)

    /** 只在弹层展示时同步一次：避免每次 transaction 都重跑 + 手动改写 DOM */
    const syncLinkUrl = () => {
      linkUrl.value = props.editor.getAttributes('link').href || ''
    }

    // getReferenceClientRect: () => {
    //   Get the coordinates of the selection so that the bubble menu follows the selection.
    //   const { view } = props.editor
    //   const { from, to } = props.editor.state.selection
    //   if (from === to) return null
    //   const domRect = view.coordsAtPos(from)
    //   const domRectEnd = view.coordsAtPos(to)
    //   return {
    //     top: domRect.top,
    //     bottom: domRect.bottom,
    //     left: domRect.left,
    //     right: domRectEnd.right,
    //     width: domRectEnd.right - domRect.left,
    //     height: domRect.bottom - domRect.top,
    //   }
    // },

    return () =>
      h(
        ITrigger,
        {
          ref: triggerRef,
          disabled:
            props.disabled ||
            (props.menu?.isDisabled && props.menu?.isDisabled({ editor: props.editor })),
          tippyOptions: {
            onShown: () => {
              isShown.value = true
              syncLinkUrl()

              nextTick(() => {
                linkInputRef.value?.focus()
              })
            },
            onHide: () => {
              isShown.value = false
              linkUrl.value = ''

              nextTick(() => {
                props.editor.commands.focus()
              })
            },
          },
        },
        {
          default: () =>
            h(
              ITooltip,
              {
                text: props.isEdit ? t('edit') : t(props.menu.name),
              },
              {
                default: () =>
                  h(
                    IButton,
                    {
                      disabled:
                        props.disabled ||
                        (props.menu?.isDisabled &&
                          props.menu?.isDisabled({ editor: props.editor })),
                      semiActive: isShown.value,
                      active:
                        props.toolbar &&
                        props.menu?.isActive &&
                        props.menu?.isActive({
                          editor: props.editor,
                        }),
                    },
                    {
                      icon: () =>
                        props.isEdit
                          ? h(IIcon, {
                              name: 'edit',
                              size: 13,
                            })
                          : h(IIcon, {
                              name: props.menu.name,
                              size: 13,
                            }),
                    },
                  ),
              },
            ),
          content: () =>
            h('div', { class: `${prefixClass}-special-button__link` }, [
              h('div', { class: `${prefixClass}-special-button__link-input` }, [
                h(IIcon, {
                  name: props.menu.name || 'link',
                  class: `${prefixClass}-special-button__link-input-icon`,
                  size: 13,
                }),
                h('input', {
                  ref: linkInputRef,
                  class: `${prefixClass}-special-button__link-input-inner`,
                  placeholder: t('linkPlaceholder'),
                  value: linkUrl.value,
                  onInput: (event: Event) => {
                    linkUrl.value = (event.target as HTMLInputElement).value
                  },
                  onKeydown: (event) => {
                    if (event.key === 'Enter') {
                      // 阻止表单内回车触发隐式提交
                      event.preventDefault()
                      // 协议白名单校验：阻断 javascript: / data: 等可执行链接
                      const url = sanitizeUrl(linkUrl.value)
                      if (url) {
                        props.menu.command({
                          editor: props.editor,
                          href: url,
                          target: openInNewTab.value ? '_blank' : null,
                        })
                        triggerRef.value?.hide()
                      }
                    }
                  },
                }),
              ]),
            ]),
        },
      )
  },
})
