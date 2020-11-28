import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

export const main = handler(async (event, context) => {
    const data = JSON.parse(event.body);
    const { question, answers, correct } = data;
    if (answers.length < 2 || !correct || correct >= answers.length || correct < 0) {
        return { statusCode: 400 };
    }
    const params = {
        TableName: process.env.questions,
        Item: {
            examId: event.pathParameters.id,
            questionId: event.pathParameters.question_id,
            question,
            answers,
            correct
        }
    };

    await dynamoDb.put(params);

    return { body: params.Item, statusCode: 201 };
});