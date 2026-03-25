export const THEME_STORAGE_KEY = 'TravelMapTheme'

export type ThemeMode = 'emerald' | 'autumn' | 'galaxy' | 'snow' | 'summer'

export interface ThemeOption {
    key: ThemeMode
    label: string
    subtitle: string
    swatch: string
}

export const DEFAULT_THEME: ThemeMode = 'emerald'

export const THEMES: ThemeOption[] = [
    {
        key: 'emerald',
        label: '绿莹',
        subtitle: '森林柔光',
        swatch: 'linear-gradient(135deg, #43d17d 0%, #0f8f58 100%)'
    },
    {
        key: 'autumn',
        label: '秋叶',
        subtitle: '金黄落叶',
        swatch: 'linear-gradient(135deg, #f1c24a 0%, #c8741b 100%)'
    },
    {
        key: 'galaxy',
        label: '银河',
        subtitle: '星空流光',
        swatch: 'linear-gradient(135deg, #111a35 0%, #5d6dff 55%, #9b7bff 100%)'
    },
    {
        key: 'snow',
        label: '雪境',
        subtitle: '蓝白飞雪',
        swatch: 'linear-gradient(135deg, #f4fbff 0%, #95c8ff 100%)'
    },
    {
        key: 'summer',
        label: '炎夏',
        subtitle: '暖阳光晕',
        swatch: 'linear-gradient(135deg, #ff8d67 0%, #d93b3b 100%)'
    }
]

export function normalizeTheme(theme: string | null | undefined): ThemeMode {
    if (THEMES.some(item => item.key === theme)) {
        return theme as ThemeMode
    }
    return DEFAULT_THEME
}

export function getStoredTheme(): ThemeMode {
    if (typeof window === 'undefined') {
        return DEFAULT_THEME
    }
    return normalizeTheme(window.localStorage.getItem(THEME_STORAGE_KEY))
}

export function setStoredTheme(theme: ThemeMode) {
    if (typeof window === 'undefined') {
        return
    }
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export function applyThemeToDocument(theme: ThemeMode) {
    if (typeof document === 'undefined') {
        return
    }
    document.documentElement.dataset.theme = theme
}
