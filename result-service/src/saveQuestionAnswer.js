import handler from "../libs/handler-lib";
import canAccess from "../libs/canAccess";
import dynamodbLib from "../libs/dynamodb-lib";
export const main = handler(async (event, context) => {
    const res = await canAccess(event);
    if (res.statusCode !== 200) return res;
    const data = JSON.parse(event.body);
    const { questionId, correct } = data;
    if (!correct) return { statusCode: 400 };
    const params = {
        TableName: process.env.saved,
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            questionId
        },
        UpdateExpression: "set correct = :r",
        ExpressionAttributeValues: {
            ":r": correct,
        }
    };
    await dynamodbLib.update(params);

    return { statusCode: 200 };
});