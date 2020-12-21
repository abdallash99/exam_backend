export default function (questions, answers) {
    let count = 0;
    for (let question of questions) {
        for (let answer of answers) {
            if (question.questionId === answer.questionId && question.correct === answer.correct) {
                count = count + 1;
            }
        }
    }
    return count;
}