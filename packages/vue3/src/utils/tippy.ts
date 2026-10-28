import tippy from 'tippy.js'
import type { Instance, Props } from 'tippy.js'

type AnyRecord = Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * 创建 tippy 实例；当传入多个目标元素时返回实例数组
 */
export function createTippy(
  element: Element | Element[],
  tippyOptions: AnyRecord = {},
): Instance[] {
  const result = tippy(
    element as Element[],
    {
      duration: 0,
      interactive: true,
      trigger: 'manual',
      placement: 'top',
      hideOnClick: 'toggle',
      appendTo: document.body,
      ...tippyOptions,
    } as Partial<Props>,
  )

  // tippy() 在只传入单个元素时返回单个实例（而非数组），
  // 这里统一成数组，避免调用方 forEach / [0] 拿到 undefined
  return (Array.isArray(result) ? result : [result]) as Instance[]
}
