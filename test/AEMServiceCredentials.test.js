const AEMServiceCredentials = require('../actions/AEMServiceCredentials');

jest.mock('@adobe/aio-lib-ims');
const { context, getToken } = require('@adobe/aio-lib-ims');
jest.mock('@adobe/aio-lib-ims', () => ({
    context: {
        set: jest.fn()
    },
    getToken: jest.fn()
}))

beforeEach(() => {
    jest.resetAllMocks();
})

describe('AEMServiceCredentials', () => {

    it('can construct jwt auth config', () => {

        // arrange
        const params = {
            AEM_SERVICECREDENTIALS_HELLO_WORLD: 'hello,world',
            AEM_SERVICECREDENTIALS_FOO: 'bar'
        };

        // act
        const credential = new AEMServiceCredentials(params);

        // assert
        expect(credential).toMatchObject({
            hello_world: 'hello,world',
            foo: 'bar'
        });
    });

    it('can get a token', async () => {

        // arrange
        const params = { AEM_SERVICECREDENTIALS_HELLO_WORLD: 'hello,world' };
        getToken.mockResolvedValue('Supercalifragilisticexpialidocious');

        // act/assert
        await expect(new AEMServiceCredentials(params).getToken()).resolves.toEqual('Supercalifragilisticexpialidocious');
        expect(context.set).toHaveBeenCalledTimes(1);
        expect(context.set).toHaveBeenCalledWith(
            'aem-service-credential-ctx',
            expect.objectContaining({ hello_world: 'hello,world' })
        );
        expect(getToken).toHaveBeenCalledTimes(1);
        expect(getToken).toHaveBeenCalledWith('aem-service-credential-ctx');
    });
});
