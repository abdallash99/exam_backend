import * as uuid from "uuid";
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const { name, description, startTime, endTime } = data;
    if (!name || !startTime || !endTime) {
        return { statusCode: 400 };
    }
    const params = {
        TableName: process.env.exams,
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: uuid.v1(),
            name,
            description,
            startTime,
            endTime,
        }
    };

    await dynamoDb.put(params);

    return { body: params.Item, statusCode: 201 };
});