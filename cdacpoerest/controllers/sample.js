const https = require('https')
const options = {
  hostname: '10.244.1.222',
  port: 5000,
  path: '/channel/info',
  method: 'GET'
}

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`)

  res.on('data', d => {
    process.stdout.write(d)
  })
})

req.on('error', error => {
  console.error(error)
})

req.end()