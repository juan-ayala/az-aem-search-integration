const action = require('./../actions/aem-page-index-upload-doc/index.js')

jest.mock('./../actions/HTMLScraper');
const HTMLScraper = require('../actions/HTMLScraper');
const mockScrape = jest.fn();
HTMLScraper.mockImplementation(() => ({
  scrape: mockScrape
}));

jest.mock('@azure/identity', () => ({
  ClientSecretCredential: jest.fn().mockImplementation(() => {})
}));
const { ClientSecretCredential } = require('@azure/identity');

const mockMergeOrUploadDocuments = jest.fn();
jest.mock('@azure/search-documents', () => ({
  SearchClient: jest.fn().mockImplementation(() => ({
    mergeOrUploadDocuments: mockMergeOrUploadDocuments
  }))
}));
const { SearchClient } = require('@azure/search-documents');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('az-ai-search-index-add', () => {

  it('can handle scrape error', async () => {

    // arrange
    mockScrape.mockRejectedValue(new Error('uh-oh, spaghetti-o'));
    // act
    return action.main({})
      .then(result => {
        // assert
        expect(HTMLScraper).toHaveBeenCalledTimes(1);
        expect(HTMLScraper).toHaveBeenCalledWith(undefined, undefined);
        expect(mockScrape).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
          error: {
            statusCode: 500,
            body: {
              error: 'uh-oh, spaghetti-o'
            }
          }
        });
      });
  });

  it('can handle index error', async () => {

    // arrange
    mockScrape.mockResolvedValue({ id: 'unique-doc-id' });
    mockMergeOrUploadDocuments.mockRejectedValue(new Error('uh-oh, spaghetti-o'));
    // act
    return action.main({})
      .then(result => {
        // assert
        expect(HTMLScraper).toHaveBeenCalledTimes(1);
        expect(HTMLScraper).toHaveBeenCalledWith(undefined, undefined);
        expect(mockScrape).toHaveBeenCalledTimes(1);
        expect(mockMergeOrUploadDocuments).toHaveBeenCalledTimes(1);
        expect(mockMergeOrUploadDocuments).toHaveBeenCalledWith([{ id: 'unique-doc-id' }]);
        expect(result).toEqual({
          error: {
            statusCode: 500,
            body: {
              error: 'uh-oh, spaghetti-o'
            }
          }
        });
      });
  });

  it('can index a document', async () => {

    // arrange
    mockScrape.mockResolvedValue({ id: 'unique-doc-id' });
    const params = {
      AZURE_TENANT_ID: 'my-az-tenant',
      AZURE_CLIENT_ID: 'my-az-client-id',
      AZURE_CLIENT_SECRET: 'my-az-client-secret',
      AZURE_SEARCH_ENDPOINT: 'my-search-endpoint',
      AZURE_SEARCH_INDEX_NAME: 'my-search-index'
    };
    mockMergeOrUploadDocuments.mockResolvedValue({
      results: [{ key: 'unique-key-id' }]
    });
    // act
    return action.main(params)
      .then(result => {
        // assert
        expect(HTMLScraper).toHaveBeenCalledTimes(1);
        expect(HTMLScraper).toHaveBeenCalledWith(undefined, undefined);
        expect(mockScrape).toHaveBeenCalledTimes(1);
        expect(mockMergeOrUploadDocuments).toHaveBeenCalledTimes(1);
        expect(mockMergeOrUploadDocuments).toHaveBeenCalledWith([{ id: 'unique-doc-id' }]);
        expect(ClientSecretCredential).toHaveBeenCalledWith(
          'my-az-tenant',
          'my-az-client-id',
          'my-az-client-secret'
        );
        expect(SearchClient).toHaveBeenCalledWith(
          'my-search-endpoint',
          'my-search-index',
          {}
        );
        expect(result).toEqual({
          statusCode: 200,
          headers: {},
          body: [{ key: 'unique-key-id' }]
        });
      });
  });
});