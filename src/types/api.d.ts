export interface RequestParams {
  current?: number
  pageSize?: number
  [key: string]: any
}

export interface ResponseData<T = any> {
  code: number
  message: string
  data: T
} 