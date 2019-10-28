'use strict';

const admin = require('firebase-admin');
var moment = require('moment');

let db = admin.firestore();
const CollectionConfig = require('../config/collection.json');

const { CalculateChapter } = require('../components/calculate-chapter');
const { CalculateSchool } = require('../components/calculate-school');
const { CalculateStudent } = require('../components/calculate-student');

class Calculate {
    constructor() {
    }

    async calculateStat(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, res) {
        var event = {
            challengeCode: challengeCode,
            chapterCode: chapterCode,
            choiceId: choiceId,
            created: created,

            eventId: eventId,
            isComplete: isComplete,
            isCorrect: isCorrect,
            isStart: isStart,

            quizId: quizId,
            schoolId: schoolId,
            score: score,

            studentId: studentId,
            subjectCode: subjectCode

        };

        await db.collection(CollectionConfig.EVENT).add(event)
            .then(async function () {
                // console.log("Event: Document successfully written!");

                await new CalculateSchool().setSchoolEvent(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, event);
                await new CalculateChapter().setChapter(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);
                await new CalculateChapter().setChallenge(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);
                await new CalculateChapter().setQuiz(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);

                //  set choice stat
                await db.collection(CollectionConfig.CHAPTER).doc(chapterCode)
                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                    .collection(CollectionConfig.QUIZ).doc(quizId)
                    .collection(CollectionConfig.CHOICE).doc(choiceId).get().then(async (doc) => {

                        // console.log('isComplete-CHOICE', doc.exists);
                        if (doc.exists) {
                            var student = schoolId + "_" + studentId;
                            var stat = doc.data().stat;
                            if (typeof (stat) === 'undefined') stat = {};

                            if (typeof (stat.users) === 'undefined') {
                                stat.users = [student];
                                stat.totalUser = 1;

                            } else {
                                var users = stat.users;
                                users.push(student);

                                var newUsers = Array.from(new Set(users))
                                stat.users = newUsers;
                                stat.totalUser = newUsers.length;
                            }

                            await db.collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                .collection(CollectionConfig.QUIZ).doc(quizId)
                                .collection(CollectionConfig.CHOICE).doc(choiceId)
                                .update({stat: stat})
                                .then(function () {
                                    // console.log("Update successfully written!");

                                });


                            score = doc.data().score;
                            // console.log('score', score)


                            // Organization
                            //  set Organization choice stat
                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                .collection(CollectionConfig.QUIZ).doc(quizId)
                                .collection(CollectionConfig.CHOICE).doc(choiceId)
                                .get().then(async (doc) => {

                                    // console.log('isComplete-');

                                    var stat = {};

                                    if (doc.exists) {
                                        stat = doc.data().stat;

                                    }

                                    var student = schoolId + "_" + studentId;

                                    if (typeof (stat) === 'undefined') stat = {};

                                    if (typeof (stat.users) === 'undefined') {
                                        stat.users = [student];
                                        stat.scores = {};
                                        stat.scores[studentId] = score;

                                        stat.totalUser = 1;

                                    } else {
                                        var users = stat.users;
                                        users.push(student);

                                        var newUsers = Array.from(new Set(users))
                                        stat.users = newUsers;
                                        stat.totalUser = newUsers.length;

                                        stat.scores[studentId] = score;

                                    }

                                    var studentScore = stat.scores;

                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                        .collection(CollectionConfig.QUIZ).doc(quizId)
                                        .collection(CollectionConfig.CHOICE).doc(choiceId)
                                        .set({stat: stat})
                                        .then(async function () {


                                            // console.log('isComplete-');

                                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                .collection(CollectionConfig.QUIZ).doc(quizId)
                                                .get().then(async (doc) => {

                                                    // console.log('isComplete-');

                                                    var choiceStat = {};
                                                    if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().choiceStat) !== 'undefined') {
                                                        choiceStat = doc.data().choiceStat;
                                                    }

                                                    if (typeof (choiceStat[choiceId]) === 'undefined') {
                                                        choiceStat[choiceId] = 1;
                                                    } else {
                                                        choiceStat[choiceId] += 1;
                                                    }

                                                    var totalEvent = 0;
                                                    if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().totalEvent) !== 'undefined') {
                                                        totalEvent = doc.data().totalEvent;
                                                    }

                                                    totalEvent += 1;

                                                    var stat = {};
                                                    if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().stat) !== 'undefined')
                                                        stat = (doc.data().stat);


                                                    if (typeof (stat.users) === 'undefined') {
                                                        stat.users = [student];
                                                        stat.scores = studentScore;
                                                        stat.totalUser = 1;


                                                    } else {
                                                        var users = stat.users;
                                                        users.push(student);

                                                        var newUsers = Array.from(new Set(users))
                                                        stat.users = newUsers;
                                                        stat.totalUser = newUsers.length;
                                                        stat.scores = studentScore;

                                                    }

                                                    //  set Organization quiz stat
                                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                        .collection(CollectionConfig.QUIZ).doc(quizId)
                                                        .set({
                                                            stat: stat,
                                                            choiceStat: choiceStat,
                                                            totalEvent: totalEvent
                                                        })
                                                        .then(function () {

                                                            // console.log("quiz: Update successfully written!");

                                                        });

                                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                        .collection(CollectionConfig.STUDENT).doc(studentId)
                                                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                        .collection(CollectionConfig.QUIZ).doc(quizId)
                                                        .collection(CollectionConfig.STUDENT_ANSWER)
                                                        .add({
                                                            choice: choiceId,
                                                            created: created
                                                        }).then((doc) => {

                                                        });

                                                    await db.collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                        .collection(CollectionConfig.QUIZ).doc(quizId).get().then(async (doc) => {

                                                            await db.collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                                .collection(CollectionConfig.QUIZ).doc(quizId)
                                                                .collection(CollectionConfig.CHOICE).get().then(async (querySnapshot) => {

                                                                    var correctChoiceName = "";
                                                                    var latestChoiceName = "";

                                                                    querySnapshot.forEach((doc) => {

                                                                        if (doc.id === choiceId) {
                                                                            latestChoiceName = doc.data().choice;
                                                                        }

                                                                        if (doc.data().isCorrect) {
                                                                            correctChoiceName = doc.data().choice;
                                                                        }
                                                                    });

                                                                    var quizQuestion = doc.data().quizQuestion;
                                                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                        .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                                        .collection(CollectionConfig.QUIZ).doc(quizId)
                                                                        .get().then(async (doc) => {

                                                                            if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().latestAt) !== 'undefined') {
                                                                                if (doc.data().latestAt < created) {

                                                                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                                        .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                                                        .collection(CollectionConfig.QUIZ).doc(quizId)
                                                                                        .set({
                                                                                            correctChoice: choiceId,
                                                                                            latestChoice: choiceId,
                                                                                            correctChoiceName: correctChoiceName,
                                                                                            latestChoiceName: latestChoiceName,
                                                                                            question: quizQuestion,
                                                                                            totalScore: score,
                                                                                            latestAt: created
                                                                                        }).then((doc) => {
                                                                                        });
                                                                                }
                                                                            } else {
                                                                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                                                    .collection(CollectionConfig.QUIZ).doc(quizId)
                                                                                    .set({
                                                                                        correctChoice: choiceId,
                                                                                        latestChoice: choiceId,
                                                                                        correctChoiceName: correctChoiceName,
                                                                                        latestChoiceName: latestChoiceName,
                                                                                        question: quizQuestion,
                                                                                        totalScore: score,
                                                                                        latestAt: created
                                                                                    }).then((doc) => {
                                                                                    });
                                                                            }

                                                                        });

                                                                });


                                                        });


                                                    // console.log('isComplete--');

                                                    //  set Organization student stat
                                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                        .collection(CollectionConfig.STUDENT).doc(studentId)
                                                        .get().then(async (doc) => {

                                                            var studentLevel = doc.data().level;
                                                            var studentDepartment = doc.data().department;

                                                            var dateJoined = doc.data().dateJoined || created;
                                                            var modified = created;

                                                            var stat = {};
                                                            if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().stat) !== 'undefined')
                                                                stat = (doc.data().stat);


                                                            if (typeof (stat.chapters) === 'undefined') {
                                                                stat.chapters = [chapterCode];
                                                                stat.totalStart = 1;


                                                            } else {
                                                                var chapters = stat.chapters;
                                                                chapters.push(chapterCode);

                                                                var newChapters = Array.from(new Set(chapters))
                                                                stat.chapters = newChapters;
                                                                stat.totalStart = newChapters.length;

                                                            }


                                                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                .update({
                                                                    stat: stat,
                                                                    dateJoined: dateJoined,
                                                                    modified: modified
                                                                }).then(() => {

                                                                });

                                                            await new CalculateChapter().calculateChallengeStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, studentLevel, studentDepartment);
                                                            await new CalculateChapter().calculateChapterStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, studentLevel, studentDepartment);


                                                        });

                                                    // console.log('isComplete---');

                                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                        .collection(CollectionConfig.QUIZ)
                                                        .get().then(async (querySnapshot) => {
                                                            var totalScore = 0;

                                                            querySnapshot.forEach((doc) => {

                                                                let scores = doc.data().stat.scores;
                                                                let quizScore = scores[studentId];

                                                                if (typeof (quizScore) !== 'undefined')
                                                                    totalScore += parseInt(quizScore)
                                                            });

                                                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                .get().then(async (doc) => {

                                                                    var totalInteraction = 1;
                                                                    if (typeof (doc.data().stat) !== 'undefined' && typeof (doc.data().stat.totalInteraction) !== 'undefined') {
                                                                        totalInteraction = doc.data().stat.totalInteraction + 1;
                                                                    }

                                                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId).update({'stat.totalInteraction': totalInteraction})
                                                                });


                                                            // console.log('isComplete', isComplete);

                                                            await new CalculateSchool().calculateOrganizationStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);

                                                            if (isComplete) {

                                                                await new CalculateSchool().calculateEventComplete(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, studentId, totalScore, score);

                                                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                    .get().then(async (studentDoc) => {


                                                                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                            .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                                            .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                            .get().then(async (doc) => {
                                                                                var student = doc.data();
                                                                                if (typeof (doc.data()) === 'undefined') {
                                                                                    student = {}
                                                                                }

                                                                                // console.log("totalScore", totalScore);

                                                                                student.firstName = studentDoc.data().firstName;
                                                                                student.lastName = studentDoc.data().lastName || "";
                                                                                student.studentId = studentId;
                                                                                student.isCompleted = true;
                                                                                student.latestQuizId = quizId;
                                                                                student.totalScore = totalScore;

                                                                                await new CalculateStudent().calculateStudentStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);

                                                                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                                    .set(student)
                                                                                    .then(async function () {
                                                                                        await new CalculateSchool().calculateAvgScore(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);


                                                                                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                                            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                                            .get().then(async (doc) => {


                                                                                                var totalChallenge = doc.data().totalChallenge;
                                                                                                // console.log('totalChallenge', totalChallenge)

                                                                                                var stat = doc.data().stat;

                                                                                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                                                    .get().then(async (doc) => {

                                                                                                        var quizScore = {};
                                                                                                        if (typeof (doc.data()) !== "undefined" && typeof (doc.data().quizScore) !== "undefined")
                                                                                                            quizScore = doc.data().quizScore;

                                                                                                        quizScore[challengeCode + "-" + quizId] = score;

                                                                                                        totalScore = 0;
                                                                                                        Object.values(quizScore).forEach(function (score) {
                                                                                                            totalScore += parseInt(score)
                                                                                                        });


                                                                                                        var challenges = [];
                                                                                                        if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().challenges) !== 'undefined') {
                                                                                                            challenges = doc.data().challenges
                                                                                                        }

                                                                                                        challenges.push(challengeCode);

                                                                                                        var newChallenges = Array.from(new Set(challenges))

                                                                                                        if (doc.exists) {
                                                                                                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                                                                .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                                                                .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                                                                .update({
                                                                                                                    challenges: newChallenges,
                                                                                                                    totalChallenge: newChallenges.length,
                                                                                                                    totalScore: totalScore,
                                                                                                                    quizScore: quizScore
                                                                                                                })
                                                                                                                .then(async function () {

                                                                                                                    await new CalculateChapter().calculateCompleteChapter(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, totalChallenge, stat);
                                                                                                                    await new CalculateChapter().calculateScoreXBar(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, totalScore);

                                                                                                                    return res.sendStatus(200);
                                                                                                                });

                                                                                                        } else {
                                                                                                            db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                                                                .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                                                                .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                                                                .set({
                                                                                                                    challenges: newChallenges,
                                                                                                                    totalChallenge: newChallenges.length,
                                                                                                                    totalScore: totalScore,
                                                                                                                    quizScore: quizScore
                                                                                                                })
                                                                                                                .then(async function () {

                                                                                                                    await new CalculateChapter().calculateCompleteChapter(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, totalChallenge, stat);
                                                                                                                    await new CalculateChapter().calculateScoreXBar(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, totalScore);

                                                                                                                    return res.sendStatus(200);
                                                                                                                });

                                                                                                        }

                                                                                                    });

                                                                                            });


                                                                                    });
                                                                            });

                                                                    });


                                                                await new CalculateStudent().calculateStudentScoreStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, studentId, totalScore, score)

                                                            } else {

                                                                // Not Complete
                                                                // console.log('Not Complete');
                                                                // console.log(CollectionConfig.ORGANIZATION, CollectionConfig.STUDENT);

                                                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                    .get().then(async (studentDoc) => {

                                                                        // console.log('studentDoc', studentDoc.exists, studentDoc.data());

                                                                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                            .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                                            .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                            .get().then(async (doc) => {
                                                                                var student = doc.data();
                                                                                if (typeof (doc.data()) === 'undefined') {
                                                                                    student = {}
                                                                                }

                                                                                student.firstName = studentDoc.data().firstName;
                                                                                student.lastName = studentDoc.data().lastName || "";
                                                                                student.studentId = studentId;
                                                                                student.isCompleted = false;
                                                                                student.latestQuizId = quizId;
                                                                                student.totalScore = 0;

                                                                                // console.log('student', student)

                                                                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                                                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                                                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                                                                    .set(student)
                                                                                    .then(function () {

                                                                                        // console.log("student, studentId: Update successfully written!");

                                                                                        return res.sendStatus(200);
                                                                                    });


                                                                            });


                                                                        await new CalculateChapter().calculateChapterScore(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, totalScore);
                                                                        await new CalculateStudent().calculateStudentScoreStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, studentId, totalScore, score)


                                                                    });

                                                            }

                                                            await new CalculateStudent().calculateUserScore(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);
                                                            // calculateGrowthScore(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);


                                                        });


                                                });


                                        });

                                });

                        }

                    });


                // console.log("sendStatus: 200!");
                return res.sendStatus(200);
                // return res.sendStatus(200);


            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
                return res.sendStatus(400);
            });

    }


}

module.exports.Calculate = Calculate;