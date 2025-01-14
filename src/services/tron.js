import { SunWeb } from 'sunweb'

class TronService {
  constructor() {
    this.sunweb = null
    this.mainchain = null
    this.sidechain = null
  }

  async init() {
    try {
      // 初始化 SunWeb
      this.sunweb = new SunWeb({
        fullHost: import.meta.env.VITE_TRON_FULL_NODE,
        solidityNode: import.meta.env.VITE_TRON_SOLIDITY_NODE,
        eventServer: import.meta.env.VITE_TRON_EVENT_SERVER,
        sideOptions: {
          fullNode: import.meta.env.VITE_TRON_SIDE_FULL_NODE,
          solidityNode: import.meta.env.VITE_TRON_SIDE_SOLIDITY_NODE,
          eventServer: import.meta.env.VITE_TRON_SIDE_EVENT_SERVER,
        }
      })

      this.mainchain = this.sunweb.mainchain
      this.sidechain = this.sunweb.sidechain
    } catch (error) {
      console.error('Failed to initialize TronService:', error)
      throw error
    }
  }

  // 主鏈方法
  async getMainchainBalance(address) {
    try {
      return await this.mainchain.trx.getBalance(address)
    } catch (error) {
      console.error('Failed to get mainchain balance:', error)
      throw error
    }
  }

  // 側鏈方法
  async getSidechainBalance(address) {
    try {
      return await this.sidechain.trx.getBalance(address)
    } catch (error) {
      console.error('Failed to get sidechain balance:', error)
      throw error
    }
  }

  // 跨鏈轉帳方法
  async crossChainTransfer(fromAddress, toAddress, amount) {
    try {
      const tx = await this.sunweb.crossChainTransfer(fromAddress, toAddress, amount)
      return tx
    } catch (error) {
      console.error('Failed to perform cross chain transfer:', error)
      throw error
    }
  }
}

export const tronService = new TronService()
export default tronService 