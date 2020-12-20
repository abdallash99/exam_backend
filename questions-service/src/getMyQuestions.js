import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const result = await dynamoDb.query({
        TableName: process.env.exams,
        IndexName: "examId-index",
        KeyConditionExpression: '#examId = :examId',
        ExpressionAttributeValues: {
            ':examId': event.pathParameters.id,
        },
        ExpressionAttributeNames: {
            '#examId': 'examId',
        },
    });
    if (result.Items.length === 0 || result.Items[0].userId !== event.requestContext.identity.cognitoIdentityId) {
        return { statusCode: 403 };
    }
    const params = {
        TableName: process.env.questions,
        KeyConditionExpression: "examId = :examId",
        ExpressionAttributeValues: {
            ":examId": event.pathParameters.id
        },
    };

    const result1 = await dynamoDb.query(params);

    return { body: result1.Items, statusCode: 200 };
});