// Single serverless function for the whole admin portal: /api/admin/* (JSON API) and the protected page shell.
const { handle } = require('../../server/router');
module.exports = (req, res) => handle(req, res);
