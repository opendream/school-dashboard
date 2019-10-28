'use strict';

const admin = require('firebase-admin');
var moment = require('moment');


let db = admin.firestore();
const CollectionConfig = require('../config/collection.json');

class CalculateStudent {
    constructor() {
    }

    async calculateUserScore(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId) {

        // Set user score
        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.STUDENT).doc(studentId)
            .get().then(async (studentDoc) => {

                let isPast = false;

                var stat = {};
                if (typeof (studentDoc.data()) !== 'undefined' && typeof (studentDoc.data().stat) !== 'undefined') {
                    stat = studentDoc.data().stat;
                }

                if (typeof (stat.latestAt) === 'undefined' || (typeof (stat.latestAt) !== 'undefined' && stat.latestAt <= created)) {
                    isPast = false;
                } else {
                    isPast = true;
                }

                if (isPast) return;

                var quizStat = studentDoc.data().quizStat || {};


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

                // stat.totalScore = totalScore;

                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.STUDENT).doc(studentId)
                    .update({
                        quizStat: quizStat,
                        'stat.totalScore': totalScore,
                        'stat.latestAt': created,
                        totalScore: totalScore
                    }).then(async function () {

                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                            .collection(CollectionConfig.STUDENT)
                            .where('totalScore', '>', totalScore).get().then(async (querySnapshot) => {

                                var ranking = querySnapshot.size + 1;
                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                    .update({
                                        ranking: ranking,
                                        'stat.ranking': ranking,
                                    }).then(function () {


                                    })


                            })

                    });
            });

    }

    async calculateStudentStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId) {
        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.STUDENT).doc(studentId)
            .collection(CollectionConfig.STUDENT_STAT).doc('courseCompletionGrowth')
            .get().then(async (doc) => {

                if (!doc.exists) {
                    var totalComplete = 1;

                    var dateKey = "D" + (new Date(created)).setHours(0, 0, 0, 0)
                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.STUDENT).doc(studentId)
                        .collection(CollectionConfig.STUDENT_STAT).doc('courseCompletionGrowth')
                        .collection(CollectionConfig.DATA).doc(dateKey)
                        .set({
                            created: created,
                            totalCompletion: totalComplete
                        }).then(function (docRef) {
                        });

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.STUDENT).doc(studentId)
                        .collection(CollectionConfig.STUDENT_STAT).doc('courseCompletionGrowth')
                        .set({name: 'Course Completion Growth', totalComplete: totalComplete}).then(function (docRef) {
                        });

                } else {
                    var totalComplete = doc.data().totalComplete || 0;
                    totalComplete += 1

                    var dateKey = "D" + (new Date(created)).setHours(0, 0, 0, 0)
                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.STUDENT).doc(studentId)
                        .collection(CollectionConfig.STUDENT_STAT).doc('courseCompletionGrowth')
                        .collection(CollectionConfig.DATA).doc(dateKey)
                        .set({
                            created: created,
                            totalCompletion: totalComplete
                        }).then(function (docRef) {
                        });

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.STUDENT).doc(studentId)
                        .collection(CollectionConfig.STUDENT_STAT).doc('courseCompletionGrowth')
                        .set({name: 'Course Completion Growth', totalComplete: totalComplete}).then(function (docRef) {
                        });

                }


            });
    }

    async calculateStudentScoreStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, studentId, totalScore, score) {

        // console.log("calculateStudentScoreStat-->")


        var dateKey = "D" + (new Date(created)).setHours(0, 0, 0, 0)
        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.STUDENT).doc(studentId)
            .collection(CollectionConfig.STUDENT_STAT).doc('scoreGrowth')
            .collection(CollectionConfig.DATA).doc(dateKey)
            .get().then(async function (doc) {

                var quizStat = {};
                if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().quizStat) !== 'undefined') {
                    quizStat = doc.data().quizStat;
                }

                var key = chapterCode + "-" + challengeCode + "-" + quizId;
                if (typeof (quizStat[key]) == 'undefined') {
                    quizStat[key] = score;
                } else {
                    quizStat[key] = score;
                }

                // console.log(score);
                var totalScore = 0;
                Object.values(quizStat).forEach(function (score) {
                    totalScore += parseInt(score);
                });

                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.STUDENT).doc(studentId)
                    .collection(CollectionConfig.STUDENT_STAT).doc('scoreGrowth')
                    .collection(CollectionConfig.DATA).doc(dateKey)
                    .set({
                        created: created,
                        totalScore: totalScore,
                        quizStat: quizStat
                    }).then(function (docRef) {});

            });

    }


}

module.exports.CalculateStudent = CalculateStudent;