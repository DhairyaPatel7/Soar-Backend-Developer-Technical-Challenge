const loader = require('./_common/fileLoader');

module.exports = class ValidatorsLoader {
    constructor({ validatorExtension }) {
        this.validatorExtension = validatorExtension;
    }

    load() {
        /** load Validators */
        const validators = loader(`./managers/entities/**/*.${this.validatorExtension}`);
        return validators;
    }
}