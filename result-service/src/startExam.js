import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import addToSavedLib from "../libs/addToSaved-lib";
import canAccess from "../libs/canAccess";
export const main = handler(async (event, context) => {
    const res = await canAccess(event);
    if (res !== 200) return { statusCode: res };
    const params = {
        TableName: process.env.questions,
        KeyConditionExpression: "examId = :examId",
        ExpressionAttributeValues: {
            ":examId": event.pathParameters.id
        },
        ProjectionExpression: "examId, questionId, answers, question",
    };

    const result1 = await dynamoDb.query(params);
    const promis = result1.Items.map((item) => addToSavedLib({ ...item, userId: event.requestContext.identity.cognitoIdentityId, correct: "-1" }));
    await Promise.all(promis);
    const params = {
        TableName: process.env.results,
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id,
            status: "started"
        }
    };

    await dynamoDb.put(params);

    return { body: result1.Items, statusCode: 200 };
});