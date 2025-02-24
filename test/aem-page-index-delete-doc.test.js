const action = require('./../actions/aem-page-index-delete-doc/index')

jest.mock('@azure/identity', () => ({
  ClientSecretCredential: jest.fn().mockImplementation(() => { return {}; })
}));
const { ClientSecretCredential } = require('@azure/identity');

const mockDeleteDocuments = jest.fn();
jest.mock('@azure/search-documents', () => ({
  SearchClient: jest.fn().mockImplementation(() => ({
    deleteDocuments: mockDeleteDocuments
  }))
}));
const { SearchClient } = require('@azure/search-documents');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('az-ai-search-index-delete', () => {

  it('can handle delete error', async () => {

    // arrange
    mockDeleteDocuments.mockRejectedValue(new Error('uh-oh, spaghetti-o'));
    // act
    return action.main({
      data: {
        path: '/content/myapp/hello/world'
      }
    })
      .then(result => {
        // assert
        expect(mockDeleteDocuments).toHaveBeenCalledTimes(1);
        expect(mockDeleteDocuments).toHaveBeenCalledWith('id', ['contentmyapphelloworld']);
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

  it('can delete the document', () => {

    // arrange
    const params = {
      AZURE_TENANT_ID: 'my-az-tenant',
      AZURE_CLIENT_ID: 'my-az-client-id',
      AZURE_CLIENT_SECRET: 'my-az-client-secret',
      AZURE_SEARCH_ENDPOINT: 'my-search-endpoint',
      AZURE_SEARCH_INDEX_NAME: 'my-search-index',
      data: {
        path: '/content/myapp/hello/world'
      }
    };
    mockDeleteDocuments.mockResolvedValue({
      results: [{
        key: 'somekey',
        succeeded: true
      }]
    });
    // act
    return action.main(params)
      .then(result => {
        // assert
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
        expect(mockDeleteDocuments).toHaveBeenCalledWith('id', ['contentmyapphelloworld']);
        expect(result).toEqual({
          statusCode: 200,
          headers: {},
          body: [{
            key: 'somekey',
            succeeded: true
          }]
        });
      });
  });
});