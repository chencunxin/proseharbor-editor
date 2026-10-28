/** 是否在浏览器环境（服务端渲染时没有 document） */
const hasDOM = () => typeof document !== 'undefined'

export function toggleTheme() {
  // 主题是写在 body 上的，SSR 阶段没有 document，跳过即可
  if (!hasDOM()) return

  const currentTheme = document.body.getAttribute('proseharbor-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'

  document.body.setAttribute('proseharbor-theme', newTheme)
}

export function changeTheme(theme: string): void {
  const validThemes = ['light', 'dark']

  if (!validThemes.includes(theme)) {
    console.warn(`Invalid theme: ${theme}. Please choose either 'light' or 'dark'.`)
    return
  }

  // 服务端渲染时没有 document，等客户端挂载后再生效
  if (!hasDOM()) return

  document.body.setAttribute('proseharbor-theme', theme)
}
