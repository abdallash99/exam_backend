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
    if (result.Items.length === 0) {
        return { statusCode: 404 };
    }

    // Return the retrieved item
    return { body: result.Item, statusCode: 200 };
});