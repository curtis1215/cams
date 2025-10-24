/**
 * 資產監控數據介面
 * Asset Monitor Data Interface
 *
 * 此專案為前端 demo 展示用途，所有資料為 mock 資料
 */

/**
 * 各鏈路的持有資產數量
 */
export interface ChainHoldings {
  [chain: string]: number
}

export interface AssetMonitorData {
  /** 唯一識別碼 */
  id: string

  /** 幣種代碼 (如 USDT, BTC, ETH) */
  currency: string

  /** 各鏈路的持有資產數量 (如 { ETH: 1250000, BSC: 875000, TRON: 2100000 }) */
  chainHoldings: ChainHoldings

  /** 平台用戶持有量 (所有鏈路總和) */
  userHoldings: number

  /** 平台項目方持有量 (所有鏈路總和) */
  projectHoldings: number

  /** 資產差額 (計算值: sum(chainHoldings) - userHoldings - projectHoldings) */
  difference: number

  /** 資產差額的 USDT 價值 */
  differenceUsdt: number

  /** 走勢數據 (最近24小時) */
  trendData: number[]

  /** 更新時間 (ISO 8601格式) */
  updateTime: string
}

/**
 * 表格欄位鍵值類型
 */
export type AssetMonitorColumnKey =
  | 'currency'
  | 'chainHoldings'
  | 'userHoldings'
  | 'projectHoldings'
  | 'difference'
  | 'hourChange'
  | 'updateTime'
