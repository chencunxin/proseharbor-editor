import { prefixClass, changeLocale } from '@proseharbor-editor/core'
import {
  defineComponent,
  ref,
  h,
  shallowRef,
  onMounted,
  getCurrentInstance,
  watch,
  computed,
  nextTick,
} from 'vue'
import { changeTheme, formatHTML } from './utils'
import { v4 as uuidv4 } from 'uuid'
import { Editor } from './editor'
import type { AnyExtension, EnableRules, FocusPosition } from '@proseharbor-editor/core'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
import './styles/index.scss'
import './utils/preload-icons'
import Prism from 'prismjs'
import 'prismjs/components/prism-markup'

export default defineComponent({
  name: 'ProseharborEditor',
  props: {
    modelValue: {
      type: [Object, Array, String],
      default: '',
    },
    // 扩展
    extensions: {
      type: Array,
      default: () => [],
    },
    locale: {
      type: String,
      default: 'en',
    },
    theme: {
      type: String,
      default: 'light',
    },
    output: {
      type: String,
      default: 'html',
    },
    // 自动获焦
    autofocus: {
      type: [Boolean, String, Number],
      default: false,
    },
    // 是否可编辑 默认 true
    editable: {
      type: Boolean,
      default: true,
    },
    // 输入规则
    enableInputRules: {
      type: [Array, Boolean],
      default: true,
    },
    // 粘贴规则
    enablePasteRules: {
      type: [Array, Boolean],
      default: true,
    },
    // 是否启用内容校验
    enableContentCheck: {
      type: Boolean,
      default: false,
    },
    // 是否注入 CSS（默认 tiptap 会注入一些 css
    // https://github.com/ueberdosis/tiptap/blob/main/packages/core/src/style.ts）
    injectCSS: {
      type: Boolean,
      default: true,
    },
    // https://tiptap.dev/docs/editor/api/editor#injectnonce
    injectNonce: {
      type: String,
      default: undefined,
    },
    // editorProps 对象由 ProseMirror 处理
    // 可以使用它来覆盖各种编辑器事件或更改编辑器DOM元素属性，例如添加一些类
    // https://tiptap.dev/docs/editor/api/editor#editorprops
    editorProps: {
      type: Object,
      default: () => {},
    },
    // parseOptions 对象由 ProseMirror 解析
    // https://prosemirror.net/docs/ref/#model.ParseOptions
    parseOptions: {
      type: Object,
      default: () => {},
    },
    // 拼写检查是否开启 - ProseMirror 不提供内置拼写检查，此依托于浏览器内置拼写检查
    spellcheck: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:modelValue',
    'update',
    'beforeCreate',
    'create',
    'selectionUpdate',
    'transaction',
    'focus',
    'blur',
    'destroy',
    'contentError',
    'paste',
    'drop',
  ],
  setup(props, { slots, emit, expose }) {
    const instance = getCurrentInstance()
    // 根容器 ref（Vue 渲染用）
    const editorContainer = ref<HTMLElement | null>(null)
    // tiptap 编辑器挂载容器 ref（ProseMirror DOM 挂载点）
    const prosemirrorContainer = ref<HTMLElement | null>(null)
    // Editor 实例
    const editor = shallowRef<Editor | null>(null)
    // 实例 uuid
    const uuid = uuidv4()
    // 是否聚焦
    const isFocused = ref(false)
    // 是否为空
    const isEmpty = ref(false)
    // 代码预览模式
    const isCodeView = ref(false)
    // 代码编辑器内容
    const codeContent = ref('')
    // 行号容器 ref
    const lineNumbersRef = ref<HTMLElement | null>(null)

    watch(
      () => props.locale,
      (locale) => {
        if (locale) {
          changeLocale(locale)
        }
      },
      { immediate: true },
    )

    watch(
      () => props.theme,
      (theme) => {
        if (theme) {
          changeTheme(theme)
        }
      },
      { immediate: true },
    )

    // props.extensions.some(
    //   (v) => v.name == "color" || v.name == "fontFamily",
    // ) && TextStyle,
    // props.extensions.some(
    //   (v) => v.name == "orderedList" || v.name == "bulletList",
    // ) && ListItem,

    const extensions = [...(props.extensions as unknown as AnyExtension[])].filter((ext) => {
      return ['extension', 'node', 'mark'].includes((ext as unknown as AnyRecord)?.type)
    })

    // 合并默认 editorProps & spellcheck 配置
    const editorProps = {
      ...props.editorProps,
      attributes: {
        ...(props.editorProps?.attributes || {}),
        spellcheck: String(props.spellcheck),
      },
    }

    // 获取字符数
    const getCharacters = (params: AnyRecord = {}) => {
      if (!editor.value?.storage?.characterCount) {
        return new Error('characterCount extension is not enabled')
      }
      return {
        characters: editor.value.storage.characterCount.characters(params),
        words: editor.value.storage.characterCount.words(params),
      }
    }

    // 校验编辑器是否为空
    function checkEditorEmpty() {
      isEmpty.value = editor.value ? editor.value.getText().trim() == '' : true
    }
    checkEditorEmpty()

    // 标记本次 modelValue 变更是否由编辑器内部更新触发，
    // 用于避免外部 modelValue 回写时重复 setContent 造成循环/光标重置
    let isInternalUpdate = false

    const onUpdate = (options: AnyRecord) => {
      const output =
        props?.output === 'html' ? options?.editor.getHTML() : options?.editor.getJSON()
      // console.log(options?.editor.getHTML())

      checkEditorEmpty()

      isInternalUpdate = true

      emit('update:modelValue', output)

      emit('update', {
        output,
        editor: options?.editor,
      })

      // 下一个 tick 复位，避免标志残留导致后续外部赋值被误跳过
      nextTick(() => {
        isInternalUpdate = false
      })
    }

    // Editor 渲染方法
    const editorRender = () => {
      // 已存在实例时先销毁，避免重复挂载
      if (editor.value) editor.value.destroy()

      editor.value = new Editor({
        element: prosemirrorContainer.value,
        content: props.modelValue,
        extensions: extensions,
        editable: props.editable,
        autofocus: (!props.editable ? false : props.autofocus || false) as FocusPosition,
        editorProps,
        enableInputRules: props.enableInputRules as EnableRules,
        enablePasteRules: props.enablePasteRules as EnableRules,
        enableContentCheck: props.enableContentCheck,
        injectCSS: props.injectCSS,
        injectNonce: props.injectNonce,
        parseOptions: props.parseOptions,
        // 在编辑器视图创建之前触发
        onBeforeCreate: (options) => {
          emit('beforeCreate', options)
        },
        // 当编辑器完全初始化并准备就绪时发生
        onCreate: (options) => {
          onUpdate(options)
          emit('create', options)
        },
        // 当内容发生变化时触发
        onUpdate,
        // 当编辑器内的选择发生变化时发生
        onSelectionUpdate: (options) => {
          emit('selectionUpdate', options)
        },
        // 当编辑器状态由于任何操作而改变时调用
        onTransaction: (options) => {
          emit('transaction', options)
        },
        // 当编辑器获得焦点时触发
        onFocus: (options) => {
          isFocused.value = true
          emit('focus', options)
        },
        // 当编辑器失去焦点时触发
        onBlur: (options) => {
          isFocused.value = false
          emit('blur', options)
        },
        // 当编辑器实例被销毁时发生
        onDestroy: () => {
          emit('destroy')
        },
        // 内容与架构不匹配时触发
        onContentError: (options) => {
          emit('contentError', options)
        },
        // 当内容粘贴到编辑器时触发
        onPaste: (...options) => {
          emit('paste', ...options)
        },
        // 当内容被放入编辑器时触发
        onDrop: (...options) => {
          emit('drop', ...options)
        },
      })

      // 添加实例静态方法
      const editorInstance = editor.value as unknown as AnyRecord
      editorInstance.uuid = uuid
      editorInstance.getCharacters = getCharacters
      editorInstance.isCodeView = isCodeView
      editorInstance.toggleCodeView = toggleCodeView

      editorInstance.contentComponent = (instance as unknown as AnyRecord | undefined)?.ctx?._

      if (instance) {
        editorInstance.appContext = {
          ...instance.appContext,
          provides: (instance as unknown as AnyRecord).provides,
        }
      }
    }

    onMounted(() => {
      editorRender()
    })

    // 外部 modelValue 变化时同步内容到编辑器（支持异步赋值初始化/重置内容）
    watch(
      () => props.modelValue,
      (value) => {
        // 编辑器尚未创建，交由 editorRender 用 props.modelValue 初始化
        if (!editor.value) return
        // 本次变更由编辑器内部更新触发，无需回写
        if (isInternalUpdate) return

        editor.value.commands.setContent(value ?? '', { emitUpdate: false })
        checkEditorEmpty()
      },
    )

    // 切换代码预览模式
    const toggleCodeView = () => {
      if (!editor.value) return

      if (isCodeView.value) {
        // 从代码预览切换回富文本编辑
        // 解析代码内容并设置到编辑器
        editor.value.commands.setContent(codeContent.value)
        isCodeView.value = false
      } else {
        // 从富文本切换到代码预览
        // getHTML() 返回的是无换行的单行字符串，先格式化再展示
        codeContent.value = formatHTML(editor.value.getHTML())
        isCodeView.value = true
      }
    }

    // 代码编辑器输入处理
    const onCodeInput = (e: Event) => {
      codeContent.value = (e.target as HTMLTextAreaElement).value
    }

    // 代码滚动同步
    const onCodeScroll = (e: Event) => {
      const target = e.target as HTMLElement
      const highlightEl = target.parentElement?.querySelector(`.${prefixClass}-code-highlight`)
      const lineNumbersEl = target.parentElement?.querySelector(`.${prefixClass}-code-line-numbers`)
      if (highlightEl) {
        highlightEl.scrollTop = target.scrollTop
        highlightEl.scrollLeft = target.scrollLeft
      }
      if (lineNumbersEl) {
        lineNumbersEl.scrollTop = target.scrollTop
      }
    }

    // 代码高亮计算属性
    const highlightedCode = computed(() => {
      const code = codeContent.value || ''
      return Prism.highlight(code, Prism.languages.markup, 'markup')
    })

    // 行号计算属性
    const lineNumbers = computed(() => {
      const code = codeContent.value || ''
      const lines = code.split('\n').length
      return Array.from({ length: lines }, (_, i) => i + 1).join('\n')
    })

    // 更新行号
    const updateLineNumbers = () => {
      nextTick(() => {
        if (lineNumbersRef.value) {
          lineNumbersRef.value.textContent = lineNumbers.value
        }
      })
    }

    // 监听代码内容变化更新行号
    watch(codeContent, updateLineNumbers, { immediate: true })

    expose({
      editor: editor,
      isFocused,
      isEmpty,
      isCodeView,
      toggleCodeView,
    })

    return () =>
      h(
        'div',
        {
          ref: editorContainer,
          class: `${prefixClass}-editor-root`,
        },
        [
          // tiptap ProseMirror 挂载容器 - 代码预览模式下隐藏但保留 DOM（维持编辑器实例）
          h('div', {
            ref: prosemirrorContainer,
            class: `${prefixClass}-prosemirror-wrapper`,
            style: isCodeView.value ? { display: 'none' } : undefined,
          }),
          // slot 内容（toolbar 等外部插槽，仅非代码预览模式下渲染）
          !isCodeView.value && slots.default?.(),
          // 代码编辑器
          isCodeView.value &&
            h(
              'div',
              {
                class: `${prefixClass}-code-editor-wrapper`,
              },
              [
                // 行号
                h('div', {
                  class: `${prefixClass}-code-line-numbers`,
                  ref: lineNumbersRef,
                }),
                // 代码高亮区域
                h(
                  'pre',
                  {
                    class: `${prefixClass}-code-highlight`,
                  },
                  [
                    h('code', {
                      class: `language-html`,
                      // 仅接受 Prism.highlight() 的输出（已做 HTML 转义），不要传入任意用户输入
                      innerHTML: highlightedCode.value,
                    }),
                  ],
                ),
                // 实际编辑的 textarea（透明覆盖层）
                h('textarea', {
                  class: `${prefixClass}-code-editor`,
                  value: codeContent.value,
                  onInput: onCodeInput,
                  onScroll: onCodeScroll,
                  spellcheck: false,
                }),
              ],
            ),
        ],
      )
  },
})
