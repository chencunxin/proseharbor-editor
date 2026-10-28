import { defineComponent, h, ref } from 'vue'
import { prefixClass, t } from '@proseharbor-editor/core'
import { IButton, IIcon, ITooltip } from '../../ui'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

export default defineComponent({
  name: 'BubbleImageSelector',
  props: {
    editor: {
      type: Object,
      required: true,
    },
    menu: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const isEditing = ref(false)
    const urlInputVal = ref('')

    const getAttrs = () => {
      const node = props.editor.state.selection.node
      return node?.attrs || {}
    }

    /**
     * 行内图片的对齐作用于所在段落的文字（textAlign）
     *
     * 行内元素没法单独居中，给容器加 display:block + margin auto 虽然看着是居中了，
     * 但之后在图片旁输入文字时会把图片挤到下一行，而且这段对齐只存在于行内 style、
     * 经过代码预览（HTML 往返）后会丢失。段落的 textAlign 是正规属性，可以稳定往返。
     */
    const alignParagraph = () => !!props.editor.schema.nodes.image?.isInline

    const setAlign = (align: string) => {
      // 行内图片：对齐作用于段落文字
      if (alignParagraph()) {
        const chain = props.editor.chain().focus()
        // 历史内容里可能残留 float/margin 类的自身对齐，先清掉再交给段落对齐
        if (getAttrs().align !== 'left') {
          chain.updateAttributes('image', { align: 'left' })
        }
        chain.setTextAlign(align).run()
        return
      }

      const attrs = getAttrs()
      // 保留现有的 width 和 height，只更新 align
      const updateData: AnyRecord = { align }
      if (attrs.width != null) {
        updateData.width = attrs.width
      }
      if (attrs.height != null) {
        updateData.height = attrs.height
      }
      props.editor.chain().focus().updateAttributes('image', updateData).run()
    }

    const deleteImage = () => {
      props.editor.chain().focus().deleteSelection().run()
    }

    const startEdit = () => {
      urlInputVal.value = getAttrs().src || ''
      isEditing.value = true
    }

    const confirmEdit = () => {
      if (urlInputVal.value.trim()) {
        props.editor
          .chain()
          .focus()
          .updateAttributes('image', { src: urlInputVal.value.trim() })
          .run()
      }
      isEditing.value = false
    }

    // name 用于文字对齐的文案，imageName 用于图片自身对齐的文案
    const alignItems = [
      { name: 'alignLeft', imageName: 'imageAlignLeft', align: 'left' },
      { name: 'alignCenter', imageName: 'imageAlignCenter', align: 'center' },
      { name: 'alignRight', imageName: 'imageAlignRight', align: 'right' },
    ]

    return () => {
      const attrs = getAttrs()
      const useParagraph = alignParagraph()
      // 行内图片按段落对齐状态高亮，块级图片按自身的 align 高亮
      const isAlignActive = (align: string) =>
        useParagraph ? props.editor.isActive({ textAlign: align }) : attrs.align === align

      if (isEditing.value) {
        return h(
          'div',
          {
            class: `${prefixClass}-bubble-menu ${prefixClass}-bubble-menu--image-edit`,
          },
          [
            h('input', {
              class: `${prefixClass}-bubble-menu__image-input`,
              value: urlInputVal.value,
              placeholder: t('imageUrlPlaceholder'),
              onInput: (e) => {
                urlInputVal.value = (e.target as HTMLInputElement).value
              },
              onKeydown: (e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  confirmEdit()
                }
                if (e.key === 'Escape') {
                  isEditing.value = false
                }
              },
            }),
            h(
              ITooltip,
              { text: t('insertImage') },
              {
                default: () =>
                  h(
                    IButton,
                    { onClick: confirmEdit },
                    { icon: () => h(IIcon, { name: 'check', size: 14 }) },
                  ),
              },
            ),
            h(
              ITooltip,
              { text: t('cancel') },
              {
                default: () =>
                  h(
                    IButton,
                    {
                      onClick: () => {
                        isEditing.value = false
                      },
                    },
                    { icon: () => h(IIcon, { name: 'close', size: 14 }) },
                  ),
              },
            ),
          ],
        )
      }

      return h('div', { class: `${prefixClass}-bubble-menu` }, [
        // 编辑链接
        h(
          ITooltip,
          { text: t('edit') },
          {
            default: () =>
              h(
                IButton,
                { onClick: startEdit },
                { icon: () => h(IIcon, { name: 'edit', size: 14 }) },
              ),
          },
        ),
        // 对齐
        ...alignItems.map(({ name, imageName, align }) =>
          h(
            ITooltip,
            { text: t(useParagraph ? name : imageName) },
            {
              default: () =>
                h(
                  IButton,
                  {
                    active: isAlignActive(align),
                    onClick: () => setAlign(align),
                  },
                  { icon: () => h(IIcon, { name, size: 14 }) },
                ),
            },
          ),
        ),
        // 删除
        h(
          ITooltip,
          { text: t('delete') },
          {
            default: () =>
              h(
                IButton,
                { onClick: deleteImage },
                { icon: () => h(IIcon, { name: 'delete', size: 14 }) },
              ),
          },
        ),
      ])
    }
  },
})
