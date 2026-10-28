import { defineComponent, h, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { prefixClass } from '@proseharbor-editor/core'
import { createTippy } from '../../utils/tippy'
import type { Instance } from 'tippy.js'

type TippyInstances = Instance[] | null

export default defineComponent({
  name: 'ITrigger',
  props: {
    tippyOptions: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props, { slots, expose }) {
    let tippyInstance: TippyInstances = null
    const tooltipContent = ref<HTMLElement | null>(null)
    const triggerRef = ref<HTMLElement | null>(null)

    watch(
      () => props.disabled,
      () => (props.disabled ? disable() : enable()),
    )

    function enable() {
      tippyInstance?.forEach((instance) => instance.enable())
    }

    function disable() {
      tippyInstance?.forEach((instance) => instance.disable())
    }

    function hide() {
      tippyInstance?.forEach((instance) => instance.hide())
    }

    function show() {
      tippyInstance?.forEach((instance) => instance.show())
    }

    function setProps(props: Record<string, unknown> = {}) {
      tippyInstance?.forEach((instance) => instance.setProps(props))
    }

    onMounted(() => {
      // mounted 钩子里的异常会中断 Vue 的 post-flush 队列，
      // 导致整个应用后续再也不更新，因此这里兜底捕获
      try {
        tippyInstance = createTippy(triggerRef.value as HTMLElement, {
          content: tooltipContent.value ?? undefined,
          trigger: 'click',
          hideOnClick: true,
          placement: 'bottom',
          appendTo: 'parent',
          ...props.tippyOptions,
        })

        props.disabled && disable()
      } catch (error) {
        console.error('[proseharbor-editor] ITrigger 初始化失败：', error)
        tippyInstance = null
      }
    })

    onBeforeUnmount(() => {
      tippyInstance?.forEach((instance) => instance.destroy())
      tippyInstance = null
    })

    expose({ hide, show, enable, disable, setProps })

    return () => [
      h('div', { ref: triggerRef, class: `${prefixClass}-trigger__btn` }, [slots.default?.()]),
      h('div', { ref: tooltipContent, class: `${prefixClass}-trigger__content` }, [
        slots.content?.(),
      ]),
    ]
  },
})
