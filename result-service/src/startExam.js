import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import addToSavedLib from "../libs/addToSaved-lib";
import canAccess from "../libs/canAccess";
import moment from 'moment';

export const main = handler(async (event, context) => {
    const now = moment().add(2, 'hours').format('YYYY-MM-DDTHH:mm');

    const res = await canAccess(event);
    const exam = await dynamoDb.get({
        TableName: process.env.results,
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id,
        }
    });
    if (exam.Item.status === "started")
        return { statusCode: 200 };
    if (res.statusCode !== 200) return res;
    const params = {
        TableName: process.env.questions,
        KeyConditionExpression: "examId = :examId",
        ExpressionAttributeValues: {
            ":examId": event.pathParameters.id
        },
        ProjectionExpression: "examId, questionId, answers, question",
    };

    const result1 = await dynamoDb.query(params);
    const promis = result1.Items.map((item) => addToSavedLib({ ...item, userId: event.requestContext.identity.cognitoIdentityId, correct: "-1" }));
    await Promise.all(promis);

    const param = {
        TableName: process.env.results,
        Key: {
            userId: event.requestContext.identity.cognitoIdentityId,
            examId: event.pathParameters.id,
        },
        UpdateExpression: "set #status = :r, startDate = :d",
        ExpressionAttributeValues: {
            ":r": "started",
            ":d": now
        },
        ExpressionAttributeNames: {
            '#status': 'status',
        },
    };

    await dynamoDb.update(param);

    return { body: { questions: result1.Items, exam: res.body.Items[0] }, statusCode: 200 };
});