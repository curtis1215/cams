declare module 'markdown-it-mermaid' {
  import MarkdownIt from 'markdown-it'

  interface MermaidOptions {
    theme?: string
    startOnLoad?: boolean
    securityLevel?: string
    themeVariables?: {
      darkMode?: boolean
      primaryColor?: string
      primaryTextColor?: string
      primaryBorderColor?: string
      lineColor?: string
      secondaryColor?: string
      tertiaryColor?: string
    }
  }

  const mermaidPlugin: (md: MarkdownIt, options?: MermaidOptions) => void
  export default mermaidPlugin
} 