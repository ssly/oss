const express = require('express')
const path = require('path')
const fs = require('fs')

const app = express()

// 常亮
const BASE_PATH = '/usr/src/oss'
console.log('BASE_PATH is', BASE_PATH)

app.get('/*', (req, res) => {
  console.log(req.url)

  const url = path.join(BASE_PATH, decodeURIComponent(req.url))
  console.log(url)
  const exist = fs.statSync(url, { throwIfNoEntry: false })
  console.log(exist)
  if (exist) {
    res.sendFile(url)
  } else {
    res.send({ c: '1000', m: 'No resource' })
  }
})

app.listen(3000, () => {
  console.log('server is running on port 3000')
})