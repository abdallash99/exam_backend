import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const params = {
        TableName: process.env.results,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
            ":userId": event.requestContext.identity.cognitoIdentityId
        }
    };
    const result = await dynamoDb.query(params);
    const promis = result.Items.map(({ examId }) => dynamoDb.query({
        TableName: process.env.exams,
        IndexName: "examId-index",
        KeyConditionExpression: '#examId = :examId',
        ExpressionAttributeValues: {
            ':examId': examId,
        },
        ExpressionAttributeNames: {
            '#examId': 'examId',
        },
    }));
    const exams = await Promise.all(promis);
    let finalExams = [];
    exams.forEach((item) => item.Items.forEach(innerItem => finalExams.push(innerItem)));
    return { body: finalExams, statusCode: 200 };
});