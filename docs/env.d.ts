/// <reference types="vite/client" />

// 单文件组件由 Vite 编译，tsc 只做类型占位
declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  >

  export default component
}

// UnoCSS 的虚拟模块
declare module 'uno.css'
