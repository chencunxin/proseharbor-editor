import { ref } from 'vue'
import { PICKER_STANDARD_COLORS, PICKER_BASE_COLORS, DEFAULT_COLORS } from '../constants'

// 获取所有颜色
export const getDefaultColors = () => {
  return DEFAULT_COLORS
}

// 获取标准颜色
export const getPickerStandardColors = () => {
  return PICKER_STANDARD_COLORS
}

// 获取所有基础颜色
export const getPickerColors = () => {
  return PICKER_BASE_COLORS
}

// 获取所有基础颜色的扁平数组
export const getPickerColorsFlat = () => {
  return PICKER_BASE_COLORS.reduce<string[]>((acc, color) => {
    return acc.concat(color.shades)
  }, [])
}

// 获取特定色阶的所有颜色
export const getPickerColorsByShade = (shade: string) => {
  return PICKER_BASE_COLORS.map((color) => {
    const found = color.shades.find((c) => c === shade)
    return found || null
  }).filter(Boolean)
}

// 获取某个颜色系列的所有色阶
export const getPickerShadesByColor = (colorName: string) => {
  const color = PICKER_BASE_COLORS.find((c) => c.name === colorName)
  return color ? color.shades : []
}

/**
 * localStorage 安全访问层
 * SSR、隐私模式或配额不足时读写都会抛错，这里统一降级，避免中断渲染
 */
const safeStorage = {
  get(key: string): string | null {
    try {
      return globalThis.localStorage?.getItem(key) ?? null
    } catch {
      return null
    }
  },
  set(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value)
    } catch {
      // 忽略写入失败
    }
  },
}

const recentColorsMap = new Map()
// 获取或创建一个最近使用颜色的响应式引用
export function getRecentColors(key = 'default', maxItems = 9) {
  if (!recentColorsMap.has(key)) {
    const colors = ref<string[]>([])

    // 初始化时从 localStorage 读取数据
    const stored = safeStorage.get(key)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          colors.value = parsed.slice(0, maxItems)
        }
      } catch {
        colors.value = []
      }
    }

    recentColorsMap.set(key, colors)
  }

  return recentColorsMap.get(key)
}

// 添加最近使用的颜色
export function addRecentColor(color: string, key = 'default', maxItems = 9) {
  const recentColors = getRecentColors(key, maxItems)

  // 如果颜色已存在，先移除它
  const index = recentColors.value.indexOf(color)
  if (index > -1) {
    recentColors.value.splice(index, 1)
  }

  // 添加到开头
  recentColors.value.unshift(color)

  // 限制数量
  if (recentColors.value.length > maxItems) {
    recentColors.value = recentColors.value.slice(0, maxItems)
  }

  // 保存到 localStorage
  safeStorage.set(key, JSON.stringify(recentColors.value))

  return recentColors
}
