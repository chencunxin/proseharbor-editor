import { mergeAttributes, Node } from '@tiptap/core'
import type { Editor } from '@tiptap/core'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import { Plugin, PluginKey, NodeSelection } from '@tiptap/pm/state'
import type { EditorView } from '@tiptap/pm/view'
import { prefixClass } from '../utils/prefix'
import type { ExtensionCommandContext } from '../types/tiptap'

const IMAGE_RESIZE_KEY = new PluginKey('imageResize')

/** 图片节点属性 */
export interface ImageAttributes {
  src?: string | null
  alt?: string | null
  title?: string | null
  width?: string | null
  height?: string | null
  align?: 'left' | 'center' | 'right'
}

/** 图片扩展配置 */
export interface ImageOptions {
  inline: boolean
  allowBase64: boolean
  HTMLAttributes: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  /** 自定义上传函数，未提供时降级为 base64 */
  uploadImage: ((file: File) => Promise<string>) | null
  slash?: boolean
  name?: string
  desc?: string
  command?: (context: ExtensionCommandContext) => void
  isActive?: (context: { editor: Editor }) => boolean
}

type AnyEditor = any // eslint-disable-line @typescript-eslint/no-explicit-any

/** 节点属性字典（属性类型由 schema 决定，这里统一放宽） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ImageAttrsRecord = Record<string, any>

// 用于 slash command 上传图片的隐藏 input
let hiddenImageInput: HTMLInputElement | null = null

function getHiddenImageInput(): HTMLInputElement | null {
  if (typeof document === 'undefined') return null
  if (!hiddenImageInput) {
    hiddenImageInput = document.createElement('input')
    hiddenImageInput.type = 'file'
    hiddenImageInput.accept = 'image/*'
    hiddenImageInput.style.cssText = 'position:fixed;top:-9999px;left:-9999px;visibility:hidden;'
    document.body.appendChild(hiddenImageInput)
  }
  return hiddenImageInput
}

/**
 * 对齐样式
 *
 * 只处理块级图片：行内图片的对齐由所在段落的 textAlign 表达
 * （行内元素没法单独居中，给容器加 display:block + margin auto 虽然能居中，
 * 但之后在图片旁输入文字时会把图片挤到下一行）。
 */
const getAlignStyle = (align?: string | null, inline?: boolean) => {
  if (inline) return ''
  if (!align || align === 'left') return ''
  return align === 'right' ? 'margin: 0 0 0 auto;' : 'margin: 0 auto;'
}

const ALIGN_VALUES = ['left', 'center', 'right'] as const

type AlignValue = (typeof ALIGN_VALUES)[number]

/** 兼容内容：从 margin / float 推断对齐方式 */
const parseAlignFromStyle = (style: string): AlignValue => {
  const normalized = style.toLowerCase()

  if (/float\s*:\s*right/.test(normalized)) return 'right'

  const shorthand = /(?:^|;|\s)margin\s*:\s*([^;]+)/.exec(normalized)?.[1]?.trim()
  if (shorthand) {
    const parts = shorthand.split(/\s+/)
    // margin: 上下 左右
    if (parts.length === 2 || parts.length === 3) {
      return parts[1] === 'auto' ? 'center' : 'left'
    }
    // margin: 上 右 下 左
    if (parts.length >= 4) {
      if (parts[3] === 'auto') return 'right'
      if (parts[1] === 'auto') return 'center'
    }
  }

  const marginLeftAuto = /margin-left\s*:\s*auto/.test(normalized)
  const marginRightAuto = /margin-right\s*:\s*auto/.test(normalized)
  if (marginLeftAuto && marginRightAuto) return 'center'
  if (marginLeftAuto) return 'right'

  return 'left'
}

const source = {
  slash: true,
  name: 'image',
  desc: '![image](url)',
  command: ({ editor, range }: ExtensionCommandContext) => {
    // 打开文件选择器
    const input = getHiddenImageInput()
    if (!input) return

    // 重置 input 以允许选择相同文件
    input.value = ''

    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files
      const file = files?.[0]
      if (!file) return

      const uploadFn = (editor as AnyEditor).extensionStorage?.image?.uploadImage
      if (typeof uploadFn === 'function') {
        // 自定义上传函数
        uploadFn(file).then((url: string) => {
          if (url) {
            if (range) {
              editor
                .chain()
                .focus()
                .deleteRange(range as never)
                .setImage({ src: url, alt: file.name })
                .run()
            } else {
              editor.chain().focus().setImage({ src: url, alt: file.name }).run()
            }
          }
        })
      } else {
        // 默认降级：转为 base64
        const reader = new FileReader()
        reader.onload = (ev: ProgressEvent<FileReader>) => {
          const src = ev.target?.result
          if (src) {
            if (range) {
              editor
                .chain()
                .focus()
                .deleteRange(range as never)
                .setImage({ src: src as string, alt: file.name })
                .run()
            } else {
              editor
                .chain()
                .focus()
                .setImage({ src: src as string, alt: file.name })
                .run()
            }
          }
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  },
  isActive: ({ editor }: { editor: AnyEditor }) => editor.isActive('image'),
  HTMLAttributes: {
    class: `${prefixClass}__image`,
  },
}

export default Node.create<ImageOptions>({
  name: 'image',

  addOptions() {
    return {
      // 默认行内：插入后光标停在图片右侧，左右都能继续输入文字
      inline: true,
      allowBase64: true,
      uploadImage: null, // (file: File) => Promise<string>
      ...source,
    }
  },

  inline() {
    return this.options.inline
  },

  group() {
    return this.options.inline ? 'inline' : 'block'
  },

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        renderHTML: (attributes: ImageAttrsRecord) => {
          if (!attributes.width) return {}
          return { width: attributes.width }
        },
      },
      height: {
        default: null,
        renderHTML: (attributes: ImageAttrsRecord) => {
          if (!attributes.height) return {}
          return { height: attributes.height }
        },
      },
      align: {
        default: 'left',
        parseHTML: (element: HTMLElement) => {
          // 对齐可能写在 img 上，也可能写在外层 wrapper 上
          const wrapper = element.closest?.(`.${prefixClass}__image-wrapper`)
          const raw =
            element.getAttribute('data-align') || wrapper?.getAttribute('data-align') || ''

          if (ALIGN_VALUES.includes(raw as AlignValue)) return raw

          // 兼容内容：从 img / wrapper 的样式推断
          return parseAlignFromStyle(
            `${element.getAttribute('style') || ''} ${wrapper?.getAttribute('style') || ''}`,
          )
        },
        renderHTML: (attributes: ImageAttrsRecord) => {
          const align = attributes.align
          if (!align || align === 'left') return {}

          // 行内图片的对齐由所在段落的 textAlign 表达，图片自身不带对齐样式
          if (this.options.inline) return {}

          return {
            // data-align 保证经过代码预览 / HTML 落库再回来时仍能解析出对齐
            'data-align': align,
            style: `display: block; margin: ${
              align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0'
            }`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: this.options.allowBase64 ? 'img[src]' : 'img[src]:not([src^="data:"])',
      },
      // 支持解析 wrapper 结构
      {
        tag: `div.${prefixClass}__image-wrapper img`,
      },
      // 行内图片的 wrapper 是 span
      {
        tag: `span.${prefixClass}__image-wrapper img`,
      },
    ]
  },

  renderHTML({ HTMLAttributes, node }) {
    const attrs = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes) as Record<
      string,
      any // eslint-disable-line @typescript-eslint/no-explicit-any
    >
    const width = node?.attrs?.width
    const height = node?.attrs?.height
    const align = node?.attrs?.align

    // 构建 img 的 style：保留 HTMLAttributes 中已有的 style（如 align 设置的），并添加 width/height
    const styleParts: string[] = []
    if (attrs.style) {
      styleParts.push(attrs.style)
    }
    // 添加 vertical-align: bottom 避免图片底部留白问题
    styleParts.push('vertical-align: bottom')
    if (width) styleParts.push(`width: ${width}`)
    if (height) styleParts.push(`height: ${height}`)
    if (styleParts.length > 0) {
      attrs.style = styleParts.join('; ')
    }

    // 行内图片必须用行内容器（span），否则 <div> 会撑断段落、无法左右输入文字
    const inline = this.options.inline
    const alignStyle = getAlignStyle(align, inline)

    const wrapperAttrs: Record<string, string> = {
      class: `${prefixClass}__image-wrapper${
        inline ? ` ${prefixClass}__image-wrapper--inline` : ''
      }`,
    }
    if (alignStyle) {
      wrapperAttrs.style = alignStyle
    }

    // 返回 wrapper 包含 img 和四个 resize handles
    return [
      inline ? 'span' : 'div',
      wrapperAttrs,
      ['img', attrs],
      [
        'span',
        {
          class: `${prefixClass}__image-resize-handle ${prefixClass}__image-resize-handle--nw`,
          'data-position': 'nw',
        },
      ],
      [
        'span',
        {
          class: `${prefixClass}__image-resize-handle ${prefixClass}__image-resize-handle--ne`,
          'data-position': 'ne',
        },
      ],
      [
        'span',
        {
          class: `${prefixClass}__image-resize-handle ${prefixClass}__image-resize-handle--sw`,
          'data-position': 'sw',
        },
      ],
      [
        'span',
        {
          class: `${prefixClass}__image-resize-handle ${prefixClass}__image-resize-handle--se`,
          'data-position': 'se',
        },
      ],
    ]
  },

  addCommands() {
    return {
      setImage:
        (options: ImageAttributes) =>
        ({ commands }: { commands: AnyEditor }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },

      updateImage:
        (options: ImageAttributes) =>
        ({ commands }: { commands: AnyEditor }) => {
          return commands.updateAttributes(this.name, options)
        },
    }
  },

  addProseMirrorPlugins() {
    return [
      // 选中状态插件 - 添加/移除 is-selected class
      new Plugin({
        key: new PluginKey('imageSelectedState'),
        view: () => ({
          update: (view: EditorView, prevState) => {
            const { selection } = view.state
            const selectionChanged = !prevState || !prevState.selection.eq(selection)
            const docChanged = !prevState || !prevState.doc.eq(view.state.doc)

            // 如果选择和文档都没变化，不更新
            if (!selectionChanged && !docChanged) {
              return
            }

            // 移除所有 wrapper 的 is-selected class
            view.dom.querySelectorAll(`.${prefixClass}__image-wrapper`).forEach((el) => {
              el.classList.remove('is-selected')
            })

            // 如果选中了图片节点，添加 is-selected class
            // NodeSelection 时 selection.node 存在
            const selectedNode = (selection as NodeSelection).node
            if (selectedNode && selectedNode.type.name === 'image') {
              try {
                // 使用 nodeDOM 直接获取节点对应的 DOM 元素
                const dom = view.nodeDOM(selection.from)
                if (dom) {
                  // nodeDOM 返回的是 wrapper (div.proseharbor-editor__image-wrapper)
                  // 因为它对应的是整个 image 节点的渲染结果
                  const element =
                    dom.nodeType === 1 ? (dom as HTMLElement) : (dom.parentElement as HTMLElement)
                  if (element && element.classList?.contains(`${prefixClass}__image-wrapper`)) {
                    element.classList.add('is-selected')
                  } else if (element) {
                    // 如果返回的不是 wrapper，尝试向上查找
                    const wrapper = element.closest?.(`.${prefixClass}__image-wrapper`)
                    if (wrapper) {
                      wrapper.classList.add('is-selected')
                    }
                  }
                }
              } catch (e) {
                // ignore
              }
            }
          },
        }),
      }),

      // 调整大小插件
      new Plugin({
        key: IMAGE_RESIZE_KEY,
        props: {
          handleDOMEvents: {
            mousedown: (view: EditorView, event: MouseEvent) => {
              const target = event.target as HTMLElement
              // 检查是否点击了 resize handle
              if (!target.classList?.contains(`${prefixClass}__image-resize-handle`)) {
                return false
              }

              event.preventDefault()
              event.stopPropagation()

              const wrapper = target.closest(`.${prefixClass}__image-wrapper`)
              const img = wrapper?.querySelector('img')
              if (!img) return false

              const handlePosition = target.dataset.position ?? '' // 'nw', 'ne', 'sw', 'se'
              const startX = event.clientX
              const startY = event.clientY
              const startWidth = img.offsetWidth
              const startHeight = img.offsetHeight
              const aspectRatio = startWidth / startHeight

              const onMouseMove = (moveEvent: MouseEvent) => {
                moveEvent.preventDefault()

                const deltaX = moveEvent.clientX - startX
                const deltaY = moveEvent.clientY - startY

                let newWidth = startWidth
                let newHeight = startHeight

                // 根据 handle 位置计算新的尺寸
                if (handlePosition.includes('e')) {
                  newWidth = startWidth + deltaX
                } else if (handlePosition.includes('w')) {
                  newWidth = startWidth - deltaX
                }

                if (handlePosition.includes('s')) {
                  newHeight = startHeight + deltaY
                } else if (handlePosition.includes('n')) {
                  newHeight = startHeight - deltaY
                }

                // 保持宽高比
                if (newWidth / aspectRatio < newHeight) {
                  newHeight = newWidth / aspectRatio
                } else {
                  newWidth = newHeight * aspectRatio
                }

                // 最小尺寸限制
                newWidth = Math.max(50, newWidth)
                newHeight = Math.max(50, newHeight)

                // 更新图片尺寸
                img.style.width = `${newWidth}px`
                img.style.height = `${newHeight}px`
              }

              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove)
                document.removeEventListener('mouseup', onMouseUp)

                // 更新节点属性，同时保持选中状态
                const pos = view.posAtDOM(img, 0)
                if (pos !== null) {
                  const node: ProseMirrorNode | null = view.state.doc.nodeAt(pos)
                  if (node && node.type.name === 'image') {
                    const tr = view.state.tr.setNodeMarkup(pos, null, {
                      ...node.attrs,
                      width: img.style.width,
                      height: img.style.height,
                    })
                    // 重新创建 NodeSelection 指向更新后的节点
                    tr.setSelection(NodeSelection.create(tr.doc, pos))
                    view.dispatch(tr)
                  }
                }
              }

              document.addEventListener('mousemove', onMouseMove)
              document.addEventListener('mouseup', onMouseUp)

              return true
            },
          },
        },
      }),
    ]
  },
})
