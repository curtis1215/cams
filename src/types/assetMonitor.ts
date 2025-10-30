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

  /** 保留額度 */
  reserveAmount: number

  /** 資產差額 (扣減保留額度後: sum(chainHoldings) - userHoldings - projectHoldings - reserveAmount) */
  assetDifference: number

  /** 資產差額的 USDT 等值 */
  assetDifferenceUsdt: number

  /** 淨資產差額 (不扣減保留額度: sum(chainHoldings) - userHoldings - projectHoldings) */
  netAssetDifference: number

  /** 原資產差額欄位 (已棄用,保留向後相容) @deprecated 請使用 netAssetDifference */
  difference: number

  /** 淨資產差額的 USDT 價值 */
  differenceUsdt: number

  /** 24小時交易均價 (USDT) */
  avgPrice24h: number

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
  | 'assetDifference'
  | 'netAssetDifference'
  | 'difference'
  | 'avgPrice24h'
  | 'hourChange'
  | 'updateTime'

/**
 * 資產差額告警數據介面
 */
export interface AssetDifferenceAlert {
  /** 唯一識別碼 */
  id: string

  /** 商戶名稱 */
  merchant: string

  /** 幣種代碼 */
  currency: string

  /** 錢包持有總量 */
  walletTotalHoldings: number

  /** 平台持有總量 (用戶持有量 + 項目方持有量) */
  platformTotalHoldings: number

  /** 資產差額 (錢包持有總量 - 平台持有總量 - 保留額度) */
  assetDifference: number

  /** 淨資產差額 (錢包持有總量 - 平台持有總量) */
  netAssetDifference: number

  /** 告警時間 */
  alertTime: string
}

/**
 * 資產差額告警配置介面
 */
export interface AssetDifferenceConfig {
  /** 幣種代碼 */
  currency: string

  /** 配置類型: 'platform' = 跟隨平台保留額度, 'custom' = 自訂 */
  configType: 'platform' | 'custom'

  /** 自訂保留額度 (當 configType 為 'custom' 時使用) */
  customReserveAmount?: number
}
