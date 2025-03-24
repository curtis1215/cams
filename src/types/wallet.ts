export interface WalletRecord {
  key: string;
  walletId: string;
  merchant: string;
  userId: string;
  walletType: string;
  chainType: string;
  address: string;
  assetValue: string;
  lastTransactionTime: string;
  isDisabled: boolean;
}

export interface TablePagination {
  current: number;
  pageSize: number;
  total?: number;
}

export interface TableSorter {
  field?: string;
  order?: 'ascend' | 'descend';
}

export interface QueryParams {
  merchant?: string;
  chainType?: string;
  walletType?: string;
  address?: string;
}

export interface AddWalletForm {
  merchant?: string;
  chainType?: string;
  walletType?: string;
  address?: string;
} 