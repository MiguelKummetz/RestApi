module.exports = (request, response, next) => {
  response.status(404).json({
    error: 'URL not  found'
  })
}
