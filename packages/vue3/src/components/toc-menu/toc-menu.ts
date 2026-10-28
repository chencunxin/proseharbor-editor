import { defineComponent, computed, h, watch, onMounted, onUnmounted, ref } from 'vue'
import type { PropType, VNode } from 'vue'
import { prefixClass, t } from '@proseharbor-editor/core'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** 标题在视口中的位置信息 */
interface HeadingViewportInfo {
  isVisible: boolean
  top: number
  id: string | null
}

export default defineComponent({
  name: 'ProseharborEditorToc',
  props: {
    editor: {
      type: Object,
      required: true,
    },
    scrollView: {
      type: Object as PropType<HTMLElement | null>,
      default: null,
    },
  },
  setup(props) {
    const tocItems = computed(() => {
      return props.editor?.storage?.toc?.tocItems || []
    })

    const activeId = ref('')
    let isManualClick = false
    let manualClickTimeout: ReturnType<typeof setTimeout> | null = null
    let scrollHandler: (() => void) | null = null

    // 标题元素缓存：避免每次滚动都执行 N 次 querySelector（每帧强制回流）
    const headingElements = new Map<string, HTMLElement>()
    let headingElementsKey = ''

    const escapeId = (id: string) =>
      typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(id) : id

    /** 查询根节点收敛到编辑器 DOM，避免多实例之间 data-id 互相串接 */
    const getHeadingRoot = (): HTMLElement | null => props.editor?.view?.dom ?? null

    /** 重建 id -> 元素 的映射，仅在 toc 数据变化时执行 */
    const refreshHeadingElements = () => {
      const root = getHeadingRoot()
      const items = getAllHeadingItems(tocItems.value)
      const key = items.map((item) => item.id).join('|')

      // 数据没变则不重建
      if (key === headingElementsKey && headingElements.size) return

      headingElements.clear()
      headingElementsKey = key

      if (!root) return

      items.forEach((item) => {
        const element = root.querySelector<HTMLElement>(`[data-id="${escapeId(item.id)}"]`)
        if (element) headingElements.set(item.id, element)
      })
    }

    // 递归获取所有标题项
    const getAllHeadingItems = (items: AnyRecord[], result: AnyRecord[] = []): AnyRecord[] => {
      items.forEach((item) => {
        result.push(item)
        if (item.children && item.children.length > 0) {
          getAllHeadingItems(item.children, result)
        }
      })
      return result
    }

    // 处理标题高亮
    const handleHeadingVisibility = () => {
      // 如果是手动点击触发的，不处理自动高亮
      if (isManualClick) return

      const editorView = props.scrollView || document.documentElement

      // 元素可能尚未渲染（首帧或内容刚变化），用缓存兜底
      if (!headingElements.size) {
        refreshHeadingElements()
      }

      // 获取所有标题元素（包括子标题）
      const allHeadings = getAllHeadingItems(tocItems.value)

      // 一次性读取所有矩形，避免读写交替引发多次回流
      const editorRect = editorView.getBoundingClientRect()
      const viewportHeight = editorView.clientHeight
      const headingInfos: HeadingViewportInfo[] = []

      allHeadings.forEach((item) => {
        const element = headingElements.get(item.id)
        if (!element) return

        const elementRect = element.getBoundingClientRect()
        const relativeTop = elementRect.top - editorRect.top

        headingInfos.push({
          isVisible: !(elementRect.bottom - editorRect.top < 0 || relativeTop > viewportHeight),
          top: relativeTop,
          id: item.id,
        })
      })

      const visibleHeadings = headingInfos
        .filter((info) => info.isVisible)
        .sort((a, b) => a.top - b.top) // 按照在编辑器视口中的位置从上到下排序

      // 如果有可见的标题，选择最靠上的一个
      const firstHeading = visibleHeadings[0]
      if (firstHeading) {
        activeId.value = firstHeading.id ?? ''
      }
    }

    // 点击滚动到目标位置
    const scrollToTarget = (id: string) => {
      const target =
        headingElements.get(id) ??
        getHeadingRoot()?.querySelector<HTMLElement>(`[data-id="${escapeId(id)}"]`)
      if (target) {
        // 设置手动点击标记并更新激活的 ID
        isManualClick = true
        activeId.value = id

        // 清除之前的定时器
        if (manualClickTimeout) {
          clearTimeout(manualClickTimeout)
        }

        const editorView = props.scrollView || document.documentElement
        const targetRect = target.getBoundingClientRect()
        const editorRect = editorView.getBoundingClientRect()

        // 计算目标位置，将标题放在编辑器视口顶部偏下位置
        const targetPosition = editorView.scrollTop + (targetRect.top - editorRect.top) - 20

        // 执行滚动
        editorView.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        })

        // 在滚动动画完成后重置手动点击状态
        manualClickTimeout = setTimeout(() => {
          isManualClick = false
        }, 1000)
      }
    }

    // 初始化滚动监听
    const initScrollListener = () => {
      const editorView = props.scrollView || document.documentElement

      // 使用 requestAnimationFrame 优化滚动处理
      let ticking = false
      scrollHandler = () => {
        if (!ticking && !isManualClick) {
          requestAnimationFrame(() => {
            handleHeadingVisibility()
            ticking = false
          })
          ticking = true
        }
      }

      // 添加滚动监听
      editorView.addEventListener('scroll', scrollHandler)

      // 初始建立缓存并检查一次
      refreshHeadingElements()
      handleHeadingVisibility()
    }

    // 监听 tocItems 变化
    watch(
      () => tocItems.value,
      () => {
        // 当 tocItems 更新时，先重建元素映射再检查一次
        refreshHeadingElements()
        handleHeadingVisibility()
      },
      { deep: true },
    )

    onMounted(() => {
      initScrollListener()
    })

    onUnmounted(() => {
      const editorView = props.scrollView || document.documentElement
      if (scrollHandler) {
        editorView.removeEventListener('scroll', scrollHandler)
        scrollHandler = null
      }
      if (manualClickTimeout) {
        clearTimeout(manualClickTimeout)
        manualClickTimeout = null
      }
      headingElements.clear()
    })

    const renderTocItem = (item: AnyRecord) => {
      const children: VNode[] = []

      if (item.children && item.children.length > 0) {
        children.push(...item.children.map((child) => renderTocItem(child)))
      }

      return h(
        'div',
        {
          class: `${prefixClass}-toc-box`,
          style: {
            paddingLeft: `${item.level == 1 ? '0' : '1rem'}`,
          },
        },
        [
          h(
            'div',
            {
              class: [
                `${prefixClass}-toc-item`,
                {
                  active: activeId.value === item.id,
                },
              ],
              onClick: () => {
                scrollToTarget(item.id)
              },
            },
            item.text?.trim() || t('empty'),
          ),
          ...children,
        ],
      )
    }

    const renderTocList = () => {
      return tocItems.value.map((item) => renderTocItem(item))
    }

    return () =>
      h(
        'div',
        {
          class: `${prefixClass}-toc`,
        },
        [h('div', { class: `${prefixClass}-toc-title` }, 'TOC'), ...renderTocList()],
      )
  },
})
