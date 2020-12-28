import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import grade from "../libs/grade";

export const main = handler(async (event, context) => {

    const result4 = await dynamoDb.get({
        TableName: process.env.results,

        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id
        }
    });
    if (result4.Item.status === 'graded')
        return { statusCode: 200, body: { finalGrade: result4.Item.grade } };
    const result = await dynamoDb.query({
        TableName: process.env.questions,
        KeyConditionExpression: "examId = :examId",
        ExpressionAttributeValues: {
            ":examId": event.pathParameters.id
        },
    });
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
    const questions = result.Items;
    const answers = result1.Items;
    const finalGrade = grade(questions, answers);

    await dynamoDb.update({
        TableName: process.env.results,
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id,
        },
        UpdateExpression: "set #status = :r, grade = :d",
        ExpressionAttributeValues: {
            ":r": "graded",
            ":d": finalGrade
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    });


    return { statusCode: 200, body: { finalGrade } };

});