'use strict';

const admin = require('firebase-admin');
var moment = require('moment');


let db = admin.firestore();
const CollectionConfig = require('../config/collection.json');

class CalculateSchool {
    constructor() {
    }

    async setSchoolEvent(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, event) {
        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.STUDENT).doc(studentId)
            .collection(CollectionConfig.EVENT)
            .add(event).then(function () {
            });

        //  set content stat
        await db.collection(CollectionConfig.CONTENT).doc(subjectCode).get().then(async (doc) => {
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


                await db.collection(CollectionConfig.CONTENT).doc(subjectCode)
                    .update({stat: stat})
                    .then(function () {
                        // console.log("Update successfully written!");
                    });

            }

        });

    }


    async calculateOrganizationStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId) {
        var dateKey = "D" + (new Date(created)).setHours(0, 0, 0, 0);

        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.ORGANIZATION_STAT).doc('courseCompletionGrowth')
            .collection(CollectionConfig.DATA).doc(dateKey)
            .get().then(async (doc) => {

                if (!doc.exists) {
                    var totalComplete = isComplete ? 1 : 0;
                    ;

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.ORGANIZATION_STAT).doc('courseCompletionGrowth')
                        .collection(CollectionConfig.DATA).doc(dateKey)
                        .set({
                            level1: 0,
                            level2: 0,
                            level3: 0,
                            level4: 0,
                            level5: 0,
                            level6: 0,
                            avgScore: 0,
                            created: created,
                            totalCompletion: totalComplete,
                            totalUser: 0,
                            totalInteraction: 1
                        }).then(function (docRef) {
                        });

                    if (isComplete) {
                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                            .get().then(async function (docRef) {

                                var totalCompletion = 0;
                                if (typeof (docRef.data().stat) !== 'undefined' && typeof (docRef.data().stat.totalCompletion) !== 'undefined') {
                                    totalCompletion = docRef.data().stat.totalCompletion;
                                }

                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId).update({'stat.totalCompletion': totalCompletion + 1})

                            });

                    }


                } else {
                    var totalComplete = doc.data().totalCompletion || 0;
                    totalComplete += isComplete ? 1 : 0;

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.ORGANIZATION_STAT).doc('courseCompletionGrowth')
                        .collection(CollectionConfig.DATA).doc(dateKey)
                        .update({
                            level1: doc.data().level1,
                            level2: doc.data().level2,
                            level3: doc.data().level3,
                            level4: doc.data().level4,
                            level5: doc.data().level5,
                            level6: doc.data().level6,
                            avgScore: doc.data().avgScore,
                            created: created,
                            totalCompletion: totalComplete,
                            totalUser: doc.data().totalUser,
                            totalInteraction: (doc.data().totalInteraction || 0) + 1
                        }).then(function (docRef) {
                        });

                    if (isComplete) {
                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                            .get().then(async function (docRef) {

                                var totalCompletion = 0;
                                if (typeof (docRef.data().stat) !== 'undefined' && typeof (docRef.data().stat.totalCompletion) !== 'undefined') {
                                    totalCompletion = docRef.data().stat.totalCompletion;
                                }

                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId).update({'stat.totalCompletion': totalCompletion + 1})

                            });

                    }


                }

                await this.calculateStudentScoreGrowth(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);
                await this.calculateChapterScoreGrowth(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId);
            });

    }


    async calculateAvgScore(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId) {


        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
            .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
            .collection(CollectionConfig.STUDENT)
            .where("isCompleted", "==", true)
            .get().then(async (querySnapshot) => {
                var totalScore = 0;
                var scores = [];

                querySnapshot.forEach((doc) => {

                    let studentScore = doc.data().totalScore;
                    totalScore += parseInt(studentScore)

                    scores.push(studentScore);
                });


                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                    .get().then(async (doc) => {

                        var stat = doc.data().stat;
                        stat.totalScore = totalScore;
                        stat.totalComplete = scores.length;
                        stat.avgScore = totalScore / scores.length;
                        stat.avgScorePercent = (stat.avgScore * 100) / parseInt(doc.data().fullScore);
                        stat.scores = scores;


                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                            .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                            .update({
                                stat: stat,
                                totalScore: totalScore,
                                avgScore: stat.avgScore
                            })
                            .then(async function () {
                                // console.log("score: Update successfully written!");


                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                    .collection(CollectionConfig.CHALLENGE)
                                    .get().then(async (querySnapshot) => {

                                        var avgScore = 0;
                                        var scores = [];

                                        querySnapshot.forEach((doc) => {
                                            let challengeScore = doc.data().avgScore;

                                            if (typeof (challengeScore) !== 'undefined') {
                                                avgScore += parseFloat(challengeScore);
                                                scores.push(challengeScore);
                                            }

                                        });


                                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                            .get().then(async (doc) => {

                                                var stat = doc.data().stat;
                                                stat.avgScore = avgScore;
                                                stat.avgScorePercent = (avgScore * 100) / parseInt(doc.data().fullScore);
                                                stat.scores = scores;

                                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                                    .update({
                                                        stat: stat,
                                                        avgScore: stat.avgScore
                                                    })
                                                    .then(function () {
                                                        // console.log("chapter: Update successfully written!");

                                                    });

                                            })
                                    });

                            });
                    });
            });

    }

    async calculateEventComplete(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, studentId, totalScore, score) {

        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.STUDENT).doc(studentId)
            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
            .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
            .get().then(async (doc) => {

                var stat = {};
                if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().stat) !== 'undefined') {
                    stat = doc.data().stat;
                }

                let isPast = false;

                if (typeof (stat.latestAt) === 'undefined' || (typeof (stat.latestAt) !== 'undefined' && stat.latestAt <= created)) {
                    stat.latestAt = created;
                    stat.latestScore = totalScore;
                } else {
                    isPast = true;
                }

                if (typeof (stat.events) === 'undefined') {
                    stat.events = [eventId];

                } else {
                    var events = stat.events;
                    events.push(eventId);

                    var newEvents = Array.from(new Set(events))
                    stat.events = newEvents;

                }

                // console.log('events---->', events)

                stat.totalRound = stat.events.length;

                if (isPast) return;

                var quiz = {};
                if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().quiz) !== 'undefined') {
                    quiz = doc.data().quiz;

                }
                quiz[quizId] = score;

                var myScore = 0;
                Object.keys(quiz).forEach(function (key) {
                    myScore += parseInt(quiz[key]);
                });

                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.STUDENT).doc(studentId)
                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                    .set({
                        stat: stat,
                        quiz: quiz,
                        totalScore: myScore
                    }).then(function () {
                    });

                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.STUDENT).doc(studentId)
                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                    .collection(CollectionConfig.CHALLENGE)
                    .get().then(async (querySnapshot) => {
                        var totalScore = 0;

                        querySnapshot.forEach((doc) => {

                            let studentScore = doc.data().totalScore;
                            if (typeof (studentScore) !== 'undefined')
                                totalScore += parseInt(studentScore)
                        });

                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                            .collection(CollectionConfig.STUDENT).doc(studentId)
                            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                            .get().then(async (doc) => {

                                var isCompleted = doc.data().isCompleted;
                                if (typeof (isCompleted) !== "undefined" && isCompleted == true) {
                                    isCompleted = true
                                } else {
                                    isCompleted = false
                                }

                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                    .set({
                                        totalScore: totalScore,
                                        chapterName: doc.data().chapterName,
                                        chapterScore: doc.data().chapterScore,
                                        isCompleted: isCompleted
                                    }).then(function () {
                                    });
                            });

                    });
            });

    }


    async calculateStudentScoreGrowth(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId) {

        // console.log("calculateStudentScoreGrowth-->")


        var dateKey = "D" + (new Date(created)).setHours(0, 0, 0, 0) + "-" + studentId;

        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.ORGANIZATION_STAT)
            .doc('studentScoreGrowth')
            .collection(CollectionConfig.DATA)
            .doc(dateKey)
            .get().then(async (doc) => {

                if (doc.exists) {

                    var quizStat = doc.data().quizStat || {};

                    var key = chapterCode + "-" + challengeCode + "-" + quizId;
                    if (typeof (quizStat[key]) == 'undefined') {
                        quizStat[key] = score;
                    } else {
                        quizStat[key] = score;
                    }


                    var totalScore = 0;
                    Object.values(quizStat).forEach(function (score) {
                        totalScore += parseInt(score);
                    });

                    var item = {
                        created: created,
                        studentId: studentId,
                        totalScore: totalScore,
                        quizStat: quizStat

                    };

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.ORGANIZATION_STAT)
                        .doc('studentScoreGrowth')
                        .collection(CollectionConfig.DATA)
                        .doc(dateKey)
                        .update(item)
                        .then(async function () {

                            var pastQuizScore = quizStat;

                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.ORGANIZATION_STAT)
                                .doc('studentScoreGrowth')
                                .collection(CollectionConfig.DATA)
                                .where('studentId', '==', studentId)
                                .where('created', '>', created)
                                .orderBy('created')
                                .get()
                                .then(async (querySnapshot) => {

                                    querySnapshot.forEach(async (doc) => {

                                        var quizStat = doc.data().quizStat || {};
                                        quizStat[key] = score;

                                        Object.keys(pastQuizScore).forEach(function (key, i) {
                                            // // console.log('-->quizStat', pastQuizScore)
                                            if (typeof (quizStat[key]) === 'undefined') {
                                                quizStat[key] = pastQuizScore[key];
                                            }
                                        });

                                        var totalScore = 0;
                                        Object.values(quizStat).forEach(function (score) {
                                            totalScore += parseInt(score);
                                        });

                                        // // console.log('quizStat', quizStat)

                                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                            .collection(CollectionConfig.ORGANIZATION_STAT)
                                            .doc('studentScoreGrowth')
                                            .collection(CollectionConfig.DATA)
                                            .doc(doc.id)
                                            .update({
                                                'totalScore': totalScore,
                                                'quizStat': quizStat
                                            })
                                            .then(function () {
                                            });

                                        pastQuizScore = quizStat;
                                    });
                                });
                        });

                } else {

                    var item = {
                        created: created,
                        studentId: studentId,
                    };

                    var key = chapterCode + "-" + challengeCode + "-" + quizId;

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.ORGANIZATION_STAT)
                        .doc('studentScoreGrowth')
                        .collection(CollectionConfig.DATA)
                        .where('studentId', '==', studentId)
                        .where('created', '<', created)
                        .orderBy('created')
                        .limit(1)
                        .get()
                        .then(async (querySnapshot) => {
                            var quizStat = {};
                            querySnapshot.forEach((doc) => {
                                quizStat = doc.data().quizStat || {};
                                return
                            });

                            quizStat[key] = score;

                            var totalScore = 0;
                            Object.values(quizStat).forEach(function (score) {
                                totalScore += parseInt(score);
                            });

                            item["totalScore"] = totalScore;
                            item["quizStat"] = quizStat;

                            var pastQuizScore = quizStat;

                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.ORGANIZATION_STAT)
                                .doc('studentScoreGrowth')
                                .collection(CollectionConfig.DATA)
                                .doc(dateKey)
                                .set(item)
                                .then(async function () {

                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                        .collection(CollectionConfig.ORGANIZATION_STAT)
                                        .doc('studentScoreGrowth')
                                        .collection(CollectionConfig.DATA)
                                        .where('studentId', '==', studentId)
                                        .where('created', '>', created)
                                        .orderBy('created')
                                        .get()
                                        .then(async (querySnapshot) => {

                                            querySnapshot.forEach(async (doc) => {

                                                var quizStat = doc.data().quizStat || {};
                                                quizStat[key] = score;

                                                Object.keys(pastQuizScore).forEach(function (key, i) {
                                                    // // console.log('-->quizStat', pastQuizScore)
                                                    if (typeof (quizStat[key]) === 'undefined') {
                                                        quizStat[key] = pastQuizScore[key];
                                                    }
                                                });

                                                var totalScore = 0;
                                                Object.values(quizStat).forEach(function (score) {
                                                    totalScore += parseInt(score);
                                                });

                                                // // console.log('quizStat', quizStat)

                                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                    .collection(CollectionConfig.ORGANIZATION_STAT)
                                                    .doc('studentScoreGrowth')
                                                    .collection(CollectionConfig.DATA)
                                                    .doc(doc.id)
                                                    .update({
                                                        'totalScore': totalScore,
                                                        'quizStat': quizStat
                                                    })
                                                    .then(function () {
                                                    });

                                                pastQuizScore = quizStat;
                                            });

                                        });
                                });

                        });


                }


            });
    }


    async calculateChapterScoreGrowth(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId) {

        // console.log("calculateChapterScoreGrowth-->")


        var dateKey = "D" + (new Date(created)).setHours(0, 0, 0, 0) + "-" + chapterCode;

        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.ORGANIZATION_STAT)
            .doc('chapterScoreGrowth')
            .collection(CollectionConfig.DATA)
            .doc(dateKey)
            .get().then(async (doc) => {

                if (doc.exists) {

                    var users = doc.data().users || [];
                    users.push(studentId);

                    var users = Array.from(new Set(users));
                    var totalUser = users.length;

                    var item = {
                        created: created,
                        chapterCode: chapterCode,
                        totalUser: totalUser,
                        users: users

                    };

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.ORGANIZATION_STAT)
                        .doc('chapterScoreGrowth')
                        .collection(CollectionConfig.DATA)
                        .doc(dateKey)
                        .update(item)
                        .then(async function () {

                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.ORGANIZATION_STAT)
                                .doc('chapterScoreGrowth')
                                .collection(CollectionConfig.DATA)
                                .where('chapterCode', '==', chapterCode)
                                .where('created', '>', created)
                                .orderBy('created')
                                .get()
                                .then(async (querySnapshot) => {

                                    querySnapshot.forEach(async (doc) => {

                                        var students = doc.data().students || [];
                                        students.push(studentId);

                                        var users = Array.from(new Set(users));
                                        var totalUser = users.length;

                                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                            .collection(CollectionConfig.ORGANIZATION_STAT)
                                            .doc('chapterScoreGrowth')
                                            .collection(CollectionConfig.DATA)
                                            .doc(doc.id)
                                            .update({
                                                'totalUser': totalUser,
                                                'users': users
                                            })
                                            .then(function () {
                                            });
                                    });
                                });
                        });

                } else {

                    var item = {
                        created: created,
                        chapterCode: chapterCode,
                    };

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.ORGANIZATION_STAT)
                        .doc('chapterScoreGrowth')
                        .collection(CollectionConfig.DATA)
                        .where('chapterCode', '==', chapterCode)
                        .where('created', '<', created)
                        .orderBy('created')
                        .limit(1)
                        .get()
                        .then(async (querySnapshot) => {
                            var users = [];

                            querySnapshot.forEach((doc) => {
                                users = doc.data().users || [];
                                return;
                            });

                            users.push(studentId);

                            var users = Array.from(new Set(users));
                            var totalUser = users.length;

                            item["users"] = users;
                            item["totalUser"] = totalUser;

                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.ORGANIZATION_STAT)
                                .doc('chapterScoreGrowth')
                                .collection(CollectionConfig.DATA)
                                .doc(dateKey)
                                .set(item)
                                .then(async function () {

                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                        .collection(CollectionConfig.ORGANIZATION_STAT)
                                        .doc('chapterScoreGrowth')
                                        .collection(CollectionConfig.DATA)
                                        .where('chapterCode', '==', chapterCode)
                                        .where('created', '>', created)
                                        .orderBy('created')
                                        .get()
                                        .then(async (querySnapshot) => {

                                            querySnapshot.forEach(async (doc) => {

                                                var users = doc.data().users || [];
                                                users.push(studentId);

                                                var users = Array.from(new Set(users));
                                                var totalUser = users.length;


                                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                                    .collection(CollectionConfig.ORGANIZATION_STAT)
                                                    .doc('chapterScoreGrowth')
                                                    .collection(CollectionConfig.DATA)
                                                    .doc(doc.id)
                                                    .update({
                                                        'users': users,
                                                        'totalUser': totalUser
                                                    })
                                                    .then(function () {
                                                    });

                                            });

                                        });
                                });

                        });


                }


            });
    }




}

module.exports.CalculateSchool = CalculateSchool;