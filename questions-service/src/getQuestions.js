import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const params = {
        TableName: process.env.questions,
        KeyConditionExpression: "examId = :examId",
        ExpressionAttributeValues: {
            ":examId": event.pathParameters.id
        },
        ProjectionExpression: "examId, questionId, answers, question",
    };

    const result = await dynamoDb.query(params);

    return { body: result.Items, statusCode: 200 };
});