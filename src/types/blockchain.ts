import type { TablePaginationConfig } from 'ant-design-vue'

// 定義區塊鏈記錄的類型
export interface BlockchainRecord {
  id: number;
  chainName: string;
  chainCode: string;
  chainType: string;
  servicePath: string;
  confirmBlocks: number;
  unlockBlocks: number;
  explorer: string;
  isEvm: boolean;
  lastUpdateTime: string;
  nodes: BlockchainNode[];
}

// 定義節點的類型
export interface BlockchainNode {
  url: string;
  priority: number;
  isCurrentUsing: boolean;
}

// 定義表單數據的類型
export interface BlockchainFormData {
  chainName: string;
  chainCode: string;
  servicePath: string;
  confirmBlocks?: number;
  unlockBlocks?: number;
  explorer: string;
  isEvm: boolean;
  expectedTime?: number;
  addressRegex: string;
  nodes: BlockchainNode[];
}

// 定義表格變更事件的參數類型
export interface TableChangeParams {
  pagination: TablePaginationConfig;
  filters: Record<string, (string | number)[] | null>;
  sorter: any;
} 