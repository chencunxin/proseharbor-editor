import { h, markRaw, reactive, render, defineComponent, provide, ref } from 'vue'
import type { AppContext, Component, Ref, VNode } from 'vue'
import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import type { Decoration, DecorationSource, EditorView } from '@tiptap/pm/view'
import { NodeView } from '@proseharbor-editor/core'
import type {
  Editor,
  NodeViewRendererOptions,
  NodeViewRendererProps,
} from '@proseharbor-editor/core'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/** 传给节点视图组件的 props */
export interface VueNodeViewProps extends AnyRecord {
  editor: Editor
  node: ProseMirrorNode
  decorations: readonly Decoration[]
  innerDecorations: DecorationSource
  view: EditorView
  selected: boolean
  extension: AnyRecord
  HTMLAttributes: AnyRecord
  getPos: () => number | undefined
  updateAttributes: (attributes?: AnyRecord) => void
  deleteNode: () => void
}

interface VueRendererOptions {
  editor: Editor
  props?: AnyRecord
}

/**
 * 在编辑器内部渲染 Vue 组件（气泡菜单、斜杠菜单等）
 */
export class VueRenderer {
  editor: Editor

  component: Component

  el: HTMLElement | null

  props: AnyRecord

  renderedComponent: {
    vNode: VNode | null
    destroy: () => void
    el: Element | null
  }

  constructor(component: Component, { props = {}, editor }: VueRendererOptions) {
    this.editor = editor
    this.component = markRaw(component)
    this.el = document.createElement('div')
    this.props = reactive(props)
    this.renderedComponent = this.renderComponent()
  }

  get element(): Element | null {
    return this.renderedComponent.el
  }

  get ref(): AnyRecord | undefined {
    const component = this.renderedComponent.vNode?.component

    // Composition API
    if (component?.exposed) {
      return component.exposed as AnyRecord
    }

    // Option API
    return component?.proxy as AnyRecord | undefined
  }

  renderComponent(): { vNode: VNode | null; destroy: () => void; el: Element | null } {
    let vNode: VNode | null = h(this.component, this.props)

    const appContext = (this.editor as unknown as { appContext?: AppContext }).appContext
    if (appContext) {
      vNode.appContext = appContext
    }

    if (typeof document !== 'undefined' && this.el) {
      render(vNode, this.el)
    }

    const destroy = () => {
      if (this.el) {
        render(null, this.el)
      }
      this.el = null
      vNode = null
    }

    return { vNode, destroy, el: this.el ? this.el.firstElementChild : null }
  }

  updateProps(props: AnyRecord = {}): void {
    Object.entries(props).forEach(([key, value]) => {
      this.props[key] = value
    })
    this.renderComponent()
  }

  destroy(): void {
    this.renderedComponent.destroy()
  }
}

/** 节点视图配置，额外允许扩展自带的 update 钩子 */
export type VueNodeViewOptions = NodeViewRendererOptions & AnyRecord

class VueNodeView extends NodeView<Component, Editor, VueNodeViewOptions> {
  renderer!: VueRenderer

  decorationClasses!: Ref<string>

  override mount(): void {
    const props: VueNodeViewProps = {
      editor: this.editor,
      node: this.node,
      decorations: this.decorations,
      innerDecorations: this.innerDecorations,
      view: this.view,
      selected: false,
      extension: this.extension,
      HTMLAttributes: this.HTMLAttributes,
      getPos: () => this.getPos(),
      updateAttributes: (attributes: AnyRecord = {}) => this.updateAttributes(attributes),
      deleteNode: () => this.deleteNode(),
    }

    const onDragStart = (
      this as unknown as { onDragStart: (...args: unknown[]) => void }
    ).onDragStart.bind(this)

    this.decorationClasses = ref(this.getDecorationClasses())

    const component = this.component as unknown as AnyRecord

    const extendedComponent = defineComponent({
      extends: { ...component },
      props: Object.keys(props),
      template: component.template,
      setup: (reactiveProps: AnyRecord) => {
        provide('onDragStart', onDragStart)
        provide('decorationClasses', this.decorationClasses)

        return component.setup?.(reactiveProps, {
          expose: () => undefined,
        })
      },
      // 支持 scoped 样式 / CSS Modules / devtools
      ...(component.__scopeId ? { __scopeId: component.__scopeId } : {}),
      ...(component.__cssModules ? { __cssModules: component.__cssModules } : {}),
      ...(component.__name ? { __name: component.__name } : {}),
      ...(component.__file ? { __file: component.__file } : {}),
    })

    this.handleSelectionUpdate = this.handleSelectionUpdate.bind(this)
    this.editor.on('selectionUpdate', this.handleSelectionUpdate)

    this.renderer = new VueRenderer(extendedComponent, {
      editor: this.editor,
      props,
    })
  }

  /**
   * 返回用于展示节点视图的 DOM 元素
   */
  override get dom(): HTMLElement {
    if (!this.renderer.element || !this.renderer.element.hasAttribute('data-node-view-wrapper')) {
      throw Error('Please use the NodeViewWrapper component for your node view.')
    }

    return this.renderer.element as HTMLElement
  }

  /**
   * 返回承载富文本内容的 DOM 元素
   */
  override get contentDOM(): HTMLElement | null {
    if (this.node.isLeaf) {
      return null
    }

    return this.dom.querySelector('[data-node-view-content]')
  }

  /**
   * 选区变化时同步节点选中状态
   */
  handleSelectionUpdate(): void {
    // 非基类成员：由 mount() 绑定后监听 selectionUpdate
    const { from, to } = this.editor.state.selection
    const pos = this.getPos()

    if (typeof pos !== 'number') {
      return
    }

    if (from <= pos && to >= pos + this.node.nodeSize) {
      if (this.renderer.props.selected) {
        return
      }

      this.selectNode()
    } else {
      if (!this.renderer.props.selected) {
        return
      }

      this.deselectNode()
    }
  }

  /**
   * 节点更新
   */
  update(
    node: ProseMirrorNode,
    decorations: readonly Decoration[],
    innerDecorations: DecorationSource,
  ): boolean {
    const rerenderComponent = (props: AnyRecord) => {
      this.decorationClasses.value = this.getDecorationClasses()
      this.renderer.updateProps(props)
    }

    if (typeof this.options.update === 'function') {
      const oldNode = this.node
      const oldDecorations = this.decorations
      const oldInnerDecorations = this.innerDecorations

      this.node = node
      this.decorations = decorations
      this.innerDecorations = innerDecorations

      return this.options.update({
        oldNode,
        oldDecorations,
        newNode: node,
        newDecorations: decorations,
        oldInnerDecorations,
        innerDecorations,
        updateProps: () => rerenderComponent({ node, decorations, innerDecorations }),
      })
    }

    if (node.type !== this.node.type) {
      return false
    }

    if (
      node === this.node &&
      this.decorations === decorations &&
      this.innerDecorations === innerDecorations
    ) {
      return true
    }

    this.node = node
    this.decorations = decorations
    this.innerDecorations = innerDecorations

    rerenderComponent({ node, decorations, innerDecorations })

    return true
  }

  /**
   * 选中节点
   */
  selectNode(): void {
    this.renderer.updateProps({
      selected: true,
    })
    if (this.renderer.element) {
      this.renderer.element.classList.add('ProseMirror-selectednode')
    }
  }

  /**
   * 取消选中节点
   */
  deselectNode(): void {
    this.renderer.updateProps({
      selected: false,
    })
    if (this.renderer.element) {
      this.renderer.element.classList.remove('ProseMirror-selectednode')
    }
  }

  getDecorationClasses(): string {
    // 非基类成员：根据 decorations 计算装饰类名
    return this.decorations
      .map((item) => (item as unknown as { type?: { attrs?: AnyRecord } }).type?.attrs?.class)
      .flat()
      .filter(Boolean)
      .join(' ')
  }

  destroy(): void {
    this.renderer.destroy()
    this.editor.off('selectionUpdate', this.handleSelectionUpdate)
  }
}

/**
 * 把 Vue 组件包装成 Tiptap 节点视图渲染器
 */
export function VueNodeViewRenderer(
  component: Component,
  options: Partial<NodeViewRendererOptions> = {},
): (props: AnyRecord) => AnyRecord {
  return (props: AnyRecord) => {
    // 父组件可能尚未渲染（<editor-content> 未挂载）
    if (!props.editor.contentComponent) {
      return {}
    }

    // 兼容 class 组件
    const normalizedComponent =
      typeof component === 'function' && '__vccOpts' in component
        ? (component as unknown as AnyRecord).__vccOpts
        : component

    return new VueNodeView(
      normalizedComponent as Component,
      props as unknown as NodeViewRendererProps,
      options as VueNodeViewOptions,
    ) as unknown as AnyRecord
  }
}
