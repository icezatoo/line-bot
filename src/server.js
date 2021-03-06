import express from 'express'
import dotenv from 'dotenv'
import vision from '@google-cloud/vision'
import * as line from '@line/bot-sdk'

dotenv.config()
export const app = express()
export const port = process.env.PORT || 4000

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
}

app.post('/webhook', line.middleware(config), async (req, res) => {
  await Promise.all(
    req.body.events.map(async event => await handleWebHook(event))
  ).then(result => res.json(result))
})

async function handleWebHook(event) {
  if (event.type === 'message') {
    return await handleMessage(event)
  } else {
    return null
  }
}

// create LINE SDK client
const client = new line.Client(config)

// # HandleMessage
async function handleMessage(eventMessage) {
  const { replyToken, message } = eventMessage
  if (message.type === 'text') {
    const reply = await handleMessageText(message)
    return await client.replyMessage(replyToken, toMessages(reply))
  } else if (message.type === 'image') {
    const content = await client.getMessageContent(message.id)
    const buffer = await readAsBuffer(content)
    const reply = await handleImage(buffer)
    return await client.replyMessage(replyToken, toMessages(reply))
  }
}

async function handleMessageText({ text }) {
  return text
}

async function handleImage(imageBuffer) {
  const credentials = JSON.parse(
    Buffer.from(process.env.CLOUD_VISION_SERVICE_ACCOUNT, 'base64').toString()
  )
  const imageAnnotator = new vision.ImageAnnotatorClient({ credentials })
  const results = await imageAnnotator.documentTextDetection(imageBuffer)
  const fullTextAnnotation = results[0].fullTextAnnotation
  const blocks = []
  for (const page of fullTextAnnotation.pages) {
    blocks.push(
      ...page.blocks.map(block => {
        return block.paragraphs
          .map(p =>
            p.words.map(w => w.symbols.map(s => s.text).join('')).join(' ')
          )
          .join('\n\n')
      })
    )
  }
  const blocksToResponses = blocks => {
    if (blocks.length <= 5) return blocks
    let processedIndex = 0
    const outBlocks = []
    for (let i = 0; i < 5; i++) {
      const targetIndex = Math.ceil(((i + 1) * blocks.length) / 5)
      outBlocks.push(
        blocks
          .slice(processedIndex, targetIndex)
          .map(x => `・ ${x}`)
          .join('\n')
      )
      processedIndex = targetIndex
    }
    return outBlocks
  }
  const responses = blocksToResponses(blocks)
  return responses.map(r => ({ type: 'text', text: r }))
}

function toMessages(data) {
  if (!data) data = '...'
  if (typeof data === 'string') data = [{ type: 'text', text: data }]
  return data
}

function readAsBuffer(stream) {
  return new Promise((resolve, reject) => {
    stream.on('error', e => {
      reject(e)
    })
    const bufs = []
    stream.on('end', () => {
      resolve(Buffer.concat(bufs))
    })
    stream.on('data', buf => {
      bufs.push(buf)
    })
  })
}

export const start = () => {
  app.listen(port, () => {
    console.log(`REST API on http://localhost:${port}/`)
  })
}
