const { Core } = require('@adobe/aio-sdk')
const { SearchClient } = require('@azure/search-documents');
const { ClientSecretCredential } = require('@azure/identity');
const { errorResponse } = require('../utils');
const HTMLScraper = require('../HTMLScraper');

exports.main = async (params) => {

  const logger = Core.Logger('main', { level: params.LOG_LEVEL || 'info' });
  logger.info(`Calling ${process.env['__OW_ACTION_NAME']}`);

  return new HTMLScraper(params.data?.sourceUrl, params.data?.path)
    .scrape()
    .then(document => {
      const credential = new ClientSecretCredential(
        params.AZURE_TENANT_ID,
        params.AZURE_CLIENT_ID,
        params.AZURE_CLIENT_SECRET
      );
      const client = new SearchClient(
        params.AZURE_SEARCH_ENDPOINT,
        params.AZURE_SEARCH_INDEX_NAME,
        credential);
      return client.mergeOrUploadDocuments([document]);
    })
    .then(indexResult => {
      for (const result of indexResult.results) {
        logger.info(`Uploaded ${result.key}; succeeded? ${result.succeeded}`);
      }
      return {
        statusCode: 200,
        headers: {},
        body: indexResult.results
      };
    })
    .catch(error => errorResponse(500, error.message, logger));
};
