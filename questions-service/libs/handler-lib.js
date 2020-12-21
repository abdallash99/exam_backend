export default function handler(lambda) {
    return async function (event, context) {
        let body, statusCode;

        try {
            // Run the Lambda
            const res = await lambda(event, context);
            body = res.body;
            statusCode = res.statusCode;
        } catch (e) {
            body = { error: e.body };
            statusCode = 500;
        }

        // Return HTTP response
        return {
            statusCode,
            body: JSON.stringify(body),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": true,
            },
        };
    };
}