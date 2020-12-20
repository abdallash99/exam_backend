import dynamoDb from "./dynamodb-lib";

export default async function (body) {
    return dynamoDb.put({
        TableName: process.env.saved,
        Item: body
    });
}