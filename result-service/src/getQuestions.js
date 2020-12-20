import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import canAccess from "../libs/canAccess";
export const main = handler(async (event, context) => {
    const res = await canAccess(event);
    if (res !== 200) return { statusCode: res };
    const params = {
        TableName: process.env.saved,
        IndexName: "userId-examId-index",
        KeyConditionExpression: "examId = :examId and userId = :userId",
        ExpressionAttributeValues: {
            ":examId": event.pathParameters.id,
            ":userId": event.requestContext.identity.cognitoIdentityId
        },
    };

    const result1 = await dynamoDb.query(params);

    return { body: result1.Items, statusCode: 200 };
});