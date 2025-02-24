const authorize = require('@adobe/jwt-auth');

module.exports = class AEMServiceCredentials {

    jwtAuthConfig = {};

    constructor(params) {

        Object.keys(params)
            .filter(key => key.startsWith('AEM_SERVICECREDENTIALS_'))
            .forEach(key => this.jwtAuthConfig[this.#convEnvKeyToImsKey(key)] = params[key]);
        if (this.jwtAuthConfig.privateKey) {
            this.jwtAuthConfig.privateKey =
                this.jwtAuthConfig.privateKey
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r');
        }
    }

    getToken = () => authorize(this.jwtAuthConfig)
        .then(response => response.access_token);

    #convEnvKeyToImsKey = (key) => key
        .replace('AEM_SERVICECREDENTIALS_', '')
        .toLowerCase()
        .replace(/([_][a-z])/g, (ltr) => ltr.toUpperCase())
        .replace(/[_]/g, '');
};