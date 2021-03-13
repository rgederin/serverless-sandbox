'use strict';

module.exports.handler = async event => {
    return {
        statusCode: 200,
        body: JSON.stringify(
            {
                message: 'processS3Bucket',
                input: event,
            },
            null,
            2
        ),
    };
};