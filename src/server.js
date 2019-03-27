import express from 'express'
import { json, urlencoded } from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import { middleware, Client } from '@line/bot-sdk'
// const line = require('@line/bot-sdk')
dotenv.config()
export const app = express()
export const port = process.env.PORT || 4000

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

// create LINE SDK client
const client = new Client(config)

app.disable('x-powered-by')
app.use(cors())
app.use(json())
app.use(urlencoded({ extended: true }))

app.get('/', (req, res) => {
  console.log(config, 'config')
  res.status(200).end()
})

app.post('/webhook', middleware(config), (req, res, next) => {
  console.log('Hello WebHook')
  console.log(req)
  res.status(200).end()
  // Promise.all(req.body.events.map(handleEvent))
  //   .then(result => res.json(result))
  //   .catch(err => {
  //     console.error(err)
  //     res.status(500).end()
  //   })
})

function handleEvent(event) {
  console.log(event, 'event Line')
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null)
  }
  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: event.message.text
  })
}

export const start = () => {
  app.listen(port, () => {
    console.log(`REST API on http://localhost:${port}/`)
  })
}
