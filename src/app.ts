import express from 'express'
const app = express()
import bodyParser from 'body-parser'
// import uuid from 'uuid'
import Blockchain from './core/blockchain'
const port = process.argv[2]

// const nodeAddress = uuid.v1().split('-').join('')

const bitcoin = new Blockchain()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// get entire blockchain
app.get('/blockchain', function (req, res) {
  res.send(bitcoin)
})

// create a new transaction
app.post('/transaction', function (req, res) {
  const newTransaction = req.body
  const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction)
  res.json({ note: `Transaction will be added in block ${blockIndex}.` })
})

app.listen(port, function () {
  console.log(`Listening on port ${port}...`)
})
