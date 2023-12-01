import Transaction from './Transaction'

export default interface Block {
  index: number
  timestamp: number
  transactions: Transaction[]
  nonce: number
  hash: string
  previousBlockHash: string
}
