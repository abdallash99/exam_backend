import moment from 'moment';
import dynamoDb from './dynamodb-lib';

export default async function (event) {
    const now = moment().format('YYYY-MM-DDTHH:mm');
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
    const params = {
        TableName: process.env.results,

        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id
        }
    };

    const result4 = await dynamoDb.get(params);

    if (!result4.Item)
        return 404;
    if (result4.Item.status === "ended")
        return 400;

    if (result.Items.length !== 0) {
        const { startDate, endDate } = result.Items[0];
        if (startDate > now || endDate <= now) {
            return { statusCode: 403 };
        }
    } else return { statusCode: 404 };
    return 200;
}