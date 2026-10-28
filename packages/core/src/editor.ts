import * as TipTap from '@tiptap/core'
import type { EditorOptions } from '@tiptap/core'
import { prefixClass } from './utils/prefix'

export * from '@tiptap/core'

export class Editor extends TipTap.Editor {
  constructor(options: Partial<EditorOptions> = {}) {
    super(options)

    return this
  }

  override prependClass(): void {
    this.view.dom.className = `${prefixClass} ${this.view.dom.className}`
  }
}
