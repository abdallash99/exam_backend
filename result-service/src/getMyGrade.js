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
        return { statusCode: 200, body: result4.Item };
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

    await dynamoDb.put({
        TableName: process.env.results,
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id,
            status: "graded",
            grade: finalGrade
        }
    });


    return { statusCode: 200, body: { finalGrade } };

});