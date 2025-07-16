const AEMServiceCredentials = require('../actions/AEMServiceCredentials');

jest.mock('@adobe/jwt-auth');
const authorize = require('@adobe/jwt-auth');

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
        expect(credential.jwtAuthConfig).toEqual({
            helloWorld: 'hello,world',
            foo: 'bar'
        });
    });

    it('can get a token', async () => {

        // arrange
        const params = { AEM_SERVICECREDENTIALS_HELLO_WORLD: 'hello,world' };
        authorize.mockResolvedValue({ access_token: 'Supercalifragilisticexpialidocious' });

        // act/assert
        await expect(new AEMServiceCredentials(params).getToken()).resolves.toEqual('Supercalifragilisticexpialidocious');
        expect(authorize).toHaveBeenCalledTimes(1);
        expect(authorize).toHaveBeenCalledWith({
            helloWorld: 'hello,world'
        });
    });
});
