// // Error Handler using ifs:
// module.exports = (error, request, response, next) => {
//   console.log('ERROR NAME => ' + error.name)
//   console.error(error.name)

//   if (error.name === 'CastError') {
//     response.status(400).send({ error: 'id used is malformed' })
//   } else if (error.name === 'ValidationError') {
//     response.status(401).json({ error: 'invalid token' })
//   } else if (error.name === 'JsonWebTokenError') {
//     response.status(409).send({ error: error.message })
//   } else {
//     response.status(500).end()
//   }
// }

// Error Handler without ifs:
const ERROR_HANDLERS = {
  CastError: res =>
    res.status(400).send({ error: 'id used is malformed' }),

  ValidationError: (res, { message }) =>
    res.status(409).send({ error: message }),

  JsonWebTokenError: res =>
    res.status(401).send({ error: 'invalid token' }),

  defaultError: res => res.status(500).end()
}

module.exports = (error, request, response, next) => {
  console.log('ERROR NAME => ' + error.name)
  console.error(error.name)

  const handler =
    ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError

  handler(response, error)
}
