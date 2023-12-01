import sha256 from 'sha256'
const currentNodeUrl = process.argv[3]
import uuid from 'uuid'
import Block from '../types/Block'
import Transaction from '../types/Transaction'
import { Range } from 'immutable'
import { Result, err, ok } from '../libs/jinx/result'
import { CoreError } from './error'
import IBlockchain, { BlockData } from './iBlockChain'
import { Option, nullable } from '../libs/jinx/option'

export default class Blockchain implements IBlockchain {
  constructor(
    private chain: Block[] = [],
    private pendingTransactions: Transaction[] = [],
    // private networkNodes: String[] = [],
    // private readonly currentNodeUrl: string = currentNodeUrl
  ) {
    this.createNewBlock(100, '0', '0') // genesis
  }

  createNewBlock(
    nonce: number,
    previousBlockHash: string,
    hash: string
  ): Block {
    const newBlock: Block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce,
      hash,
      previousBlockHash,
    }
    this.pendingTransactions = []
    this.chain.push(newBlock)
    return newBlock
  }

  get lastBlock(): Block {
    return this.chain[this.chain.length - 1]
  }

  createNewTransaction(
    amount: number,
    sender: string,
    receipient: string
  ): Transaction {
    return {
      amount,
      sender,
      recipient: receipient,
      transactionId: uuid.v1().split('-').join(''),
    }
  }

  addTransactionToPendingTransactions(transaction: Transaction): number {
    this.pendingTransactions.push(transaction)
    return this.lastBlock.index + 1
  }

  hashBlock(
    previousBlockHash: string,
    currentBlockData: BlockData,
    nonce: number
  ): string {
    const dataAsString =
      previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData)
    return sha256(dataAsString)
  }

  proofOfWork(
    previousBlockHash: string,
    currentBlockData: BlockData
  ): Result<number, CoreError> {
    const nonce = Range(0, Infinity).find(
      (nonce) =>
        this.hashBlock(previousBlockHash, currentBlockData, nonce).substring(
          0,
          4
        ) === '0000'
    )
    if (nonce) {
      return ok(nonce)
    } else {
      return err({ type: 'ProofFailed' })
    }
  }

  chainIsValid(blockchain: Block[]): Result<{}, CoreError> {
    for (let i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i]
      const prevBlock = blockchain[i - 1]
      if (currentBlock.previousBlockHash !== prevBlock.hash) {
        return err({
          type: 'InvalidOrderChain',
          previousIndex: i - 1,
          currentIndex: i,
        })
      }
      const blockHash = this.hashBlock(
        prevBlock.hash,
        {
          transactions: currentBlock.transactions,
          index: currentBlock.index,
        },
        currentBlock.nonce
      )
      if (blockHash.substring(0, 4) !== '0000') {
        return err({ type: 'WrongHashBlock', hash: blockHash })
      }
    }

    const genesisBlock = blockchain[0]
    if (genesisBlock.nonce !== 100) {
      return err({
        type: 'InvalidGenesisNonce',
        expected: 100,
        actual: genesisBlock.nonce,
      })
    }
    if (genesisBlock.previousBlockHash !== '0') {
      return err({
        type: 'InvalidGenesisPreviousHash',
        expected: '0',
        actual: genesisBlock.previousBlockHash,
      })
    }
    if (genesisBlock.transactions.length !== 0) {
      return err({
        type: 'GenesisHasTransaction',
      })
    }

    return ok({})
  }

  getBlock(blockHash: string): Option<Block> {
    return nullable(this.chain.find((block) => block.hash === blockHash))
  }

  getTransaction(
    transactionId: string
  ): Option<{ block: Block; transaction: Transaction }> {
    return nullable(
      this.chain
        .flatMap((block) =>
          block.transactions.map((transaction) => ({ transaction, block }))
        )
        .find((data) => data.transaction.transactionId === transactionId)
    )
  }

  getAddressData(address: string): {
    balance: number
    transactions: Transaction[]
  } {
    const transactions = this.chain
      .flatMap((block) => block.transactions)
      .filter(
        (transaction) =>
          transaction.recipient === address || transaction.recipient === address
      )
    const balance = transactions
      .map((transaction) =>
        transaction.recipient === address
          ? transaction.amount
          : -transaction.sender
      )
      .reduce((acc, curr) => acc + curr)
    return {
      transactions,
      balance,
    }
  }
}
