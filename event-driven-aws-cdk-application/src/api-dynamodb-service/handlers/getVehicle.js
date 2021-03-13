'use strict';

module.exports.handler = async event => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'get vehicle',
                input: event,
            },
            null,
            2
        ),
    };
};