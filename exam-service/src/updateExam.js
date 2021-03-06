import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const { name, description, startDate, endDate } = data;
    const params = {
        TableName: process.env.exams,
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id,
            name,
            description,
            startDate,
            endDate,
        }
    };

    await dynamoDb.put(params);

    return { body: params.Item, statusCode: 201 };
});