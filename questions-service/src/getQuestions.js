import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import moment from 'moment';
export const main = handler(async (event, context) => {
    const now = moment().add(2, 'hours').format('YYYY-MM-DDTHH:mm');
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
    if (result.Items.length === 1) {
        const { startDate, endDate } = result.Items[0];
        if (startDate > now || endDate <= now) {
            return { statusCode: 403 };
        }
    } else return { statusCode: 404 };
    const params = {
        TableName: process.env.questions,
        KeyConditionExpression: "examId = :examId",
        ExpressionAttributeValues: {
            ":examId": event.pathParameters.id
        },
        ProjectionExpression: "examId, questionId, answers, question",
    };

    const result1 = await dynamoDb.query(params);

    return { body: { questions: result1.Items, exam: result.Items[0] }, statusCode: 200 };
});