import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import canAccess from "../libs/canAccess";
export const main = handler(async (event, context) => {
    const res = await canAccess(event);
    if (res.statusCode !== 200) return res;
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

    return { body: { questions: result1.Items, exam: res.body.Items[0] }, statusCode: 200 };
});