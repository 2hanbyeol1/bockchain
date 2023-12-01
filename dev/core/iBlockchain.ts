import { Option } from '../libs/jinx/option'
import { Result } from '../libs/jinx/result'
import { Block } from '../types/Block'
import { Transaction } from '../types/Transaction'
import { CoreError } from './error'

export interface IBlockchain {
  createNewBlock(nonce: number, previousBlockHash: string, hash: string): Block

  get lastBlock(): Block

  createNewTransaction(
    amount: number,
    sender: string,
    receipient: string
  ): Transaction

  addTransactionToPendingTransactions(transaction: Transaction): number

  hashBlock(
    previousBlockHash: string,
    currentBlockData: BlockData,
    nonce: number
  ): string

  proofOfWork(
    previousBlockHash: string,
    currentBlockData: BlockData
  ): Result<number, CoreError>

  chainIsValid(blockchain: Block[]): Result<{}, CoreError>

  getBlock(blockHash: string): Option<Block>

  getTransaction(
    transactionId: string
  ): Option<{ block: Block; transaction: Transaction }>

  getAddressData(address: string): {
    balance: number
    transactions: Transaction[]
  }
}

export type BlockData = { index: number; transactions: Transaction[] }
