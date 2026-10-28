import { defineComponent, computed, onBeforeUnmount, ref, watchEffect, h } from 'vue'
import { prefixClass, t } from '@proseharbor-editor/core'
import ButtonLink from '../../special-button/button-link'
import { ITooltip, IDivider, IButton, IIcon } from '../../ui'
import { sanitizeUrl } from '../../../utils/url'

export default defineComponent({
  name: 'BubbleLinkSelector',
  props: {
    editor: {
      type: Object,
      required: true,
    },
    menu: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const href = ref('')
    const target = ref('_blank')

    watchEffect(() => {
      const linkData = props.editor.getAttributes('link')
      href.value = linkData.href
      target.value = linkData.target || ''
    })

    // 打开链接前必须过协议白名单，阻断 javascript: / data: 等可执行地址
    const safeHref = computed(() => sanitizeUrl(href.value))
    const copyTimeout = ref<ReturnType<typeof setTimeout>>()

    const copyOk = ref(false)

    onBeforeUnmount(() => {
      if (copyTimeout.value) clearTimeout(copyTimeout.value)
    })

    function clipboardLink() {
      props.editor.chain().focus().run()
      navigator.clipboard.writeText(href.value)
      copyOk.value = true
      copyTimeout.value = setTimeout(() => {
        copyOk.value = false
      }, 500)
    }

    function unLink() {
      if (!props.editor) return
      props.editor.chain().focus().unsetLink().run()
    }

    function openLink() {
      if (!safeHref.value) return
      window.open(safeHref.value, target.value)
    }

    return () =>
      h('div', { class: `${prefixClass}-bubble-menu` }, [
        h(
          ITooltip,
          { text: t('openInNewTab') },
          {
            default: () =>
              h(
                IButton,
                {
                  onClick: openLink,
                },
                {
                  icon: () => h(IIcon, { name: 'openRight', size: 14 }),
                  default: () =>
                    h('span', { class: `${prefixClass}-bubble-menu__btn-text` }, href.value),
                },
              ),
          },
        ),
        h(IDivider, { type: 'vertical', style: { height: '1.5rem' } }),
        h(ButtonLink, { editor: props.editor, menu: props.menu, isEdit: true }),
        h(
          ITooltip,
          { text: t('copy') },
          {
            default: () =>
              h(
                IButton,
                {
                  success: copyOk.value,
                  onClick: clipboardLink,
                },
                {
                  icon: () =>
                    h(IIcon, {
                      name: copyOk.value ? 'check' : 'copy',
                      size: 13.5,
                    }),
                },
              ),
          },
        ),
        h(IDivider, { type: 'vertical', style: { height: '1.5rem' } }),
        h(
          ITooltip,
          { text: t('unlink') },
          {
            default: () =>
              h(
                IButton,
                {
                  danger: true,
                  onClick: unLink,
                },
                {
                  icon: () => h(IIcon, { name: 'unlink', size: 14 }),
                },
              ),
          },
        ),
      ])
  },
})
