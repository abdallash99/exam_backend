import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
export const main = handler(async (event, context) => {

    const result = await dynamoDb.query({
        TableName: process.env.results,
        IndexName: "examId-index",
        KeyConditionExpression: '#examId = :examId',
        ExpressionAttributeValues: {
            ':examId': event.pathParameters.id,
        },
        ExpressionAttributeNames: {
            '#examId': 'examId',
        },
    });


    return { statusCode: 200, body: result.Items };

});