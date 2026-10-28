import { defineComponent, h } from 'vue'
import { prefixClass } from '@proseharbor-editor/core'

export default defineComponent({
  name: 'IDivider',
  props: {
    type: {
      type: String,
      default: 'horizontal',
      validator: (value: unknown) => ['horizontal', 'vertical'].includes(value as string),
    },
    dashed: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    return () =>
      h('div', {
        class: [
          `${prefixClass}-divider`,
          `${prefixClass}-divider--${props.type}`,
          { [`${prefixClass}-divider--dashed`]: props.dashed },
        ],
      })
  },
})
