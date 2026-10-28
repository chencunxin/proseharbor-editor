import { defineComponent, onBeforeUnmount, ref, h } from 'vue'
import { prefixClass, t } from '@proseharbor-editor/core'
import { ITooltip, IButton, ITrigger, IIcon } from '../ui'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** 未配置 uploadImage 时走 base64 内联，超过该体积直接拒绝，避免大字符串灌入文档 */
const MAX_INLINE_IMAGE_SIZE = 2 * 1024 * 1024

export default defineComponent({
  name: 'ButtonImage',
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
  },
  setup(props) {
    const triggerRef = ref<AnyRecord | null>(null)
    const isShown = ref(false)
    const imageUrl = ref('')
    const imageAlt = ref('')
    const urlInputRef = ref<AnyRecord | null>(null)
    const focusTimer = ref<ReturnType<typeof setTimeout> | null>(null)

    onBeforeUnmount(() => {
      if (focusTimer.value) {
        clearTimeout(focusTimer.value)
        focusTimer.value = null
      }
    })

    // 通过 URL 插入图片
    const insertImageByUrl = () => {
      if (!imageUrl.value.trim()) return
      props.editor
        .chain()
        .focus()
        .setImage({ src: imageUrl.value.trim(), alt: imageAlt.value.trim() })
        .run()
      imageUrl.value = ''
      imageAlt.value = ''
      triggerRef.value?.hide()
    }

    // 通过上传插入图片
    const handleUpload = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const uploadFn = props.menu?.uploadImage
      if (typeof uploadFn === 'function') {
        // 用户提供了自定义上传函数
        uploadFn(file)
          .then((url) => {
            if (url) {
              props.editor.chain().focus().setImage({ src: url, alt: file.name }).run()
            }
          })
          .catch((error) => {
            console.error('[proseharbor-editor] 图片上传失败：', error)
          })
          .finally(() => {
            triggerRef.value?.hide()
          })
      } else {
        // 默认降级：转为 base64
        if (file.size > MAX_INLINE_IMAGE_SIZE) {
          console.warn(
            `[proseharbor-editor] 图片超过 ${MAX_INLINE_IMAGE_SIZE / 1024 / 1024}MB，请先配置 menu.uploadImage`,
          )
          ;(e.target as HTMLInputElement).value = ''
          return
        }

        const reader = new FileReader()
        reader.onload = (ev) => {
          const src = ev.target?.result
          if (src) {
            props.editor.chain().focus().setImage({ src, alt: file.name }).run()
          }
          triggerRef.value?.hide()
        }
        reader.onerror = () => {
          console.error('[proseharbor-editor] 图片读取失败')
        }
        reader.readAsDataURL(file)
      }
      // reset input
      ;(e.target as HTMLInputElement).value = ''
    }

    // 渲染弹窗内容
    const renderPanel = () => {
      return h('div', { class: `${prefixClass}-special-button__image` }, [
        // URL 输入区域
        h('div', { class: `${prefixClass}-special-button__image-section` }, [
          h('div', { class: `${prefixClass}-special-button__image-label` }, t('imageUrl')),
          h('input', {
            ref: urlInputRef,
            class: `${prefixClass}-special-button__image-input`,
            placeholder: t('imageUrlPlaceholder'),
            value: imageUrl.value,
            onInput: (e) => {
              imageUrl.value = (e.target as HTMLInputElement).value
            },
            onKeydown: (e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                insertImageByUrl()
              }
            },
          }),
        ]),
        // Alt 文本区域
        h('div', { class: `${prefixClass}-special-button__image-section` }, [
          h('div', { class: `${prefixClass}-special-button__image-label` }, t('imageAlt')),
          h('input', {
            class: `${prefixClass}-special-button__image-input`,
            placeholder: t('imageAlt'),
            value: imageAlt.value,
            onInput: (e) => {
              imageAlt.value = (e.target as HTMLInputElement).value
            },
            onKeydown: (e) => {
              if (e.key === 'Enter') {
                // 阻止表单内回车触发隐式提交
                e.preventDefault()
                insertImageByUrl()
              }
            },
          }),
        ]),
        // 操作按钮行
        h('div', { class: `${prefixClass}-special-button__image-actions` }, [
          // 确认插入按钮
          h(
            'button',
            {
              // 显式声明 type，避免表单内点击被当作提交按钮导致页面刷新
              type: 'button',
              class: `${prefixClass}-special-button__image-btn ${prefixClass}-special-button__image-btn--primary`,
              onClick: insertImageByUrl,
            },
            t('insertImage'),
          ),
          // 上传按钮（label 包裹 input）
          h(
            'label',
            {
              class: `${prefixClass}-special-button__image-btn`,
            },
            [
              t('uploadImage'),
              h('input', {
                type: 'file',
                accept: 'image/*',
                style: { display: 'none' },
                onChange: handleUpload,
              }),
            ],
          ),
        ]),
      ])
    }

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
              // 弹出后自动聚焦 URL 输入框
              if (focusTimer.value) clearTimeout(focusTimer.value)
              focusTimer.value = setTimeout(() => urlInputRef.value?.focus(), 50)
            },
            onHide: () => {
              isShown.value = false
            },
          },
        },
        {
          default: () =>
            h(
              ITooltip,
              { text: t(props.menu.name) },
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
                        props.menu?.isActive && props.menu?.isActive({ editor: props.editor }),
                    },
                    {
                      icon: () =>
                        h(IIcon, {
                          name: props.menu.name,
                          size: 14,
                        }),
                    },
                  ),
              },
            ),
          content: () => renderPanel(),
        },
      )
  },
})
