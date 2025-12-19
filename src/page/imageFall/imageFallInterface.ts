export interface ItemOption {
    id: number
    title: string
    url: string
    width: number
    height: number
    avatar: string
    user: string
    views: number
    /**
     * 关联的论坛帖子 ID，可选
     * 不为 null / undefined 时表示当前卡片可点击跳转论坛详情
     */
    luntanId?: number | null
}
