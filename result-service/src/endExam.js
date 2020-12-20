import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import canAccess from "../libs/canAccess";
export const main = handler(async (event, context) => {
    const res = await canAccess(event);
    if (res !== 200) return { statusCode: res };
    const params = {
        TableName: process.env.results,
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id,
            status: "ended"
        }
    };

    await dynamoDb.put(params);

    return { body: params.Item, statusCode: 201 };
});