import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import canAccess from "../libs/canAccess";
import moment from 'moment';

export const main = handler(async (event, context) => {
    const now = moment().add(2, 'hours').format('YYYY-MM-DDTHH:mm');

    const res = await canAccess(event);
    if (res.statusCode !== 200) return res;
    const params = {
        TableName: process.env.results,
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id,
        },
        UpdateExpression: "set #status = :r, endDate = :d",
        ExpressionAttributeValues: {
            ":r": "ended",
            ":d": now
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    await dynamoDb.update(params);

    return { body: params.Item, statusCode: 201 };
});