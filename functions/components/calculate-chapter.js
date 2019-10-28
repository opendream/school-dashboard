'use strict';

const admin = require('firebase-admin');
var moment = require('moment');


let db = admin.firestore();
const CollectionConfig = require('../config/collection.json');

class CalculateChapter {
    constructor() {
    }

    async setChapter(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId) {
        //  set chapter stat
        await db.collection(CollectionConfig.CHAPTER).doc(chapterCode).get().then(async (doc) => {
            if (doc.exists) {
                var student = schoolId + "_" + studentId;
                var stat = doc.data().stat;

                var fullScore = doc.data().chapterScore;
                var chapterName = doc.data().chapterName;
                var chapterScore = doc.data().chapterScore;
                var totalChallenge = doc.data().stat.totalChallenge;

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

                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.STUDENT).doc(studentId)
                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                    .get().then(async (doc) => {

                        if (doc.exists) {
                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.STUDENT).doc(studentId)
                                .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                .update({
                                    chapterName: chapterName,
                                    chapterScore: chapterScore,
                                }).then(function () {
                                });
                        } else {
                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.STUDENT).doc(studentId)
                                .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                .set({
                                    chapterName: chapterName,
                                    chapterScore: chapterScore,
                                    stat: {}
                                }).then(function () {
                                });
                        }

                    });

                await db.collection(CollectionConfig.CHAPTER).doc(chapterCode)
                    .update({stat: stat})
                    .then(function () {
                        // console.log("Update successfully written!");

                    });

                //  set organization chapter stat
                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                    .get().then(async (doc) => {

                        var student = schoolId + "_" + studentId;
                        var stat = {};

                        if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().stat) !== 'undefined') stat = doc.data().stat;

                        if (typeof (stat.users) === 'undefined') {
                            stat.users = [student];
                            stat.totalUser = 1;
                            stat.totalStart = 1;

                        } else {
                            var users = stat.users;
                            users.push(student);

                            var newUsers = Array.from(new Set(users))
                            stat.users = newUsers;
                            stat.totalUser = newUsers.length;
                            stat.totalStart = newUsers.length;
                        }

                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                            .collection(CollectionConfig.STUDENT).doc(studentId)
                            .get().then(async function (doc) {
                                if (!doc.exists) {
                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                        .collection(CollectionConfig.STUDENT).doc(studentId)
                                        .set({
                                            studentId: studentId,
                                        });
                                }
                            });

                        if (doc.exists) {

                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                .update({
                                    chapterName: chapterName,
                                    fullScore: fullScore,
                                    stat: stat,
                                    totalUser: stat.totalUser,
                                    totalChallenge: totalChallenge
                                })
                                .then(function () {
                                    // console.log("Update successfully written!");

                                });


                        } else {
                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                .set({
                                    chapterName: chapterName,
                                    fullScore: fullScore,
                                    stat: stat,
                                    totalUser: stat.totalUser,
                                    totalChallenge: totalChallenge
                                })
                                .then(function () {
                                    // console.log("Add successfully written!");

                                });

                        }

                    });


            }

        });

    }

    async setChallenge(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId) {
        //  set challenge stat
        await db.collection(CollectionConfig.CHAPTER).doc(chapterCode)
            .collection(CollectionConfig.CHALLENGE).doc(challengeCode).get().then(async (doc) => {
                if (doc.exists) {
                    var student = schoolId + "_" + studentId;
                    var stat = doc.data().stat;

                    var fullScore = doc.data().challengeScore;
                    var challengeName = doc.data().challengeName;

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
                        .update({stat: stat})
                        .then(function () {
                            // console.log("Update successfully written!");

                        });

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.STUDENT).doc(studentId)
                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                        .get().then(async (doc) => {

                            if (doc.exists) {
                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                    .update({
                                        challengeName: challengeName,
                                    }).then(function () {
                                    });
                            } else {
                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                    .collection(CollectionConfig.STUDENT).doc(studentId)
                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                    .set({
                                        challengeName: challengeName,
                                        stat: {}
                                    }).then(function () {
                                    });
                            }

                        });

                    //  set organization challenge stat
                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                        .get().then(async (doc) => {

                            var student = schoolId + "_" + studentId;
                            var stat = {};

                            if (typeof (doc.data()) !== 'undefined') stat = doc.data().stat;

                            if (typeof (stat.users) === 'undefined') {
                                stat.users = [student];
                                stat.totalUser = 1;
                                stat.totalStart = 1;

                            } else {
                                var users = stat.users;
                                users.push(student);

                                var newUsers = Array.from(new Set(users))
                                stat.users = newUsers;
                                stat.totalUser = newUsers.length;
                                stat.totalStart = newUsers.length;
                            }

                            if (doc.exists) {

                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                    .update({
                                        challengeName: challengeName,
                                        fullScore: fullScore,
                                        stat: stat,
                                        totalUser: stat.totalUser
                                    })
                                    .then(function () {
                                        // console.log("Update successfully written!");

                                    });


                            } else {
                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                                    .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                                    .set({
                                        challengeName: challengeName,
                                        fullScore: fullScore,
                                        stat: stat,
                                        totalUser: stat.totalUser
                                    })
                                    .then(function () {
                                        // console.log("Add successfully written!");

                                    });

                            }

                        });


                }

            });


    }

    async setQuiz(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId) {
        //  set  quiz stat
        await db.collection(CollectionConfig.CHAPTER).doc(chapterCode)
            .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
            .collection(CollectionConfig.QUIZ).doc(quizId).get().then(async (doc) => {
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
                        .update({stat: stat})
                        .then(function () {
                            // console.log("Update successfully written!");

                        });

                }

            });
    }

    async calculateCompleteChapter(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, totalChallenge, stat) {

        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
            .collection(CollectionConfig.STUDENT)
            .get().then(async (querySnapshot) => {
                var totalComplete = 0;
                var studentComplete = [];

                querySnapshot.forEach((doc) => {

                    let studentTotalChallenge = doc.data().totalChallenge;

                    // console.log('studentTotalChallenge', studentTotalChallenge, parseInt(totalChallenge))
                    if (studentTotalChallenge === parseInt(totalChallenge)) {
                        totalComplete += 1;
                        studentComplete.push(doc.id)
                    }


                });

                stat.totalComplete = totalComplete;
                stat.studentComplete = studentComplete;

                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                    .update({stat: stat})
                    .then(function () {
                        // console.log("chapter: Update successfully written!");

                    });


                if (studentComplete.indexOf(studentId) !== -1) {

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.STUDENT).doc(studentId)
                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                        .update({isComplete: true}).then(async function () {


                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.STUDENT).doc(studentId)
                                .collection(CollectionConfig.CHAPTER)
                                .get().then(async (querySnapshot) => {
                                    var totalComplete = 0;
                                    var chapterComplete = [];

                                    querySnapshot.forEach((doc) => {
                                        if (doc.data().isComplete) {
                                            totalComplete += 1;
                                            chapterComplete.push(doc.id)
                                        }


                                    });

                                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                        .collection(CollectionConfig.STUDENT).doc(studentId)
                                        .update({
                                            'stat.totalComplete': totalComplete,
                                            'stat.chapterComplete': chapterComplete
                                        }).then(function () {
                                        });

                                });


                        });

                }

            });
    }

    async calculateChapterScore(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, totalScore) {

        // console.log('---calculateChapterScore--');

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

                // console.log('isPast', isPast)

                if (typeof (stat.events) === 'undefined') {
                    stat.events = [eventId];

                } else {
                    var events = stat.events;
                    events.push(eventId);

                    var newEvents = Array.from(new Set(events))
                    stat.events = newEvents;

                }

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
                        totalScore: myScore,
                        latestAt: created
                    }).then(function () {
                    });


            });

        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
            .collection(CollectionConfig.STUDENT).doc(studentId)
            .get().then(async (doc) => {


                var quizScore = {};
                if (typeof (doc.data()) !== 'undefined' && typeof (doc.data().quizScore) !== 'undefined') {
                    quizScore = doc.data().quizScore;

                }
                quizScore[challengeCode + "-" + quizId] = score;

                totalScore = 0;
                Object.values(quizScore).forEach(function (score) {
                    totalScore += parseInt(score)
                });

                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                    .collection(CollectionConfig.STUDENT).doc(studentId)
                    .update({
                        totalScore: totalScore,
                        quizScore: quizScore
                    }).then(function () {
                    });


                return await this.calculateScoreXBar(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, totalScore)

            });
    }


    async calculateScoreXBar(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, totalScore) {
        if (!isComplete) return;

        await db.collection(CollectionConfig.CHAPTER).doc(chapterCode)
            .get().then(async (doc) => {

                var chapterName = doc.data().chapterName;
                var fullScore = doc.data().chapterScore;

                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.STUDENT).doc(studentId)
                    .get().then(async (doc) => {

                        var topChapter = doc.data().topChapter || {};
                        if (typeof (topChapter.totalScore) == "undefined") {
                            topChapter['totalScore'] = totalScore;
                            topChapter['chapterName'] = chapterName;
                            topChapter['chapterScore'] = fullScore;

                            db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.STUDENT).doc(studentId).update({topChapter: topChapter});
                        } else {

                            if (topChapter['totalScore'] < totalScore) {
                                topChapter['totalScore'] = totalScore;
                                topChapter['chapterName'] = chapterName;
                                topChapter['chapterScore'] = fullScore;

                                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                    .collection(CollectionConfig.STUDENT).doc(studentId).update({topChapter: topChapter});
                            }
                        }


                    });

                var fullScore = doc.data().chapterScore;
                var avgScore = totalScore * 100 / fullScore;


                await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                    .collection(CollectionConfig.ORGANIZATION_STAT).doc('scoreXBar')
                    .get().then(async (doc) => {

                        var values;
                        var users;

                        if (doc.exists) {
                            values = doc.data().values || {};
                            users = doc.data().users || {};
                        } else {
                            values = {};
                            users = {};
                        }

                        if (typeof (values) == "undefined" || typeof (values['scoreAvg']) == "undefined") {
                            values['scoreAvg'] = avgScore;
                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.ORGANIZATION_STAT).doc('scoreXBar').set({
                                    values: values,
                                    name: "Score X Bar"
                                })
                        } else {
                            var oldAvg = values['scoreAvg'] || 0;
                            var newAvg = (oldAvg + avgScore) / 2;

                            // console.log('newAvg', newAvg)
                            values['scoreAvg'] = newAvg;

                            await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                                .collection(CollectionConfig.ORGANIZATION_STAT).doc('scoreXBar').set({
                                    values: values,
                                    name: "Score X Bar"
                                })
                        }
                    });

            });
    }

    async calculateChallengeStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, studentLevel, studentDepartment) {
        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
            .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
            .collection(CollectionConfig.CHALLENGE_STAT).doc('demographics')
            .get().then(async (doc) => {

                if (!doc.exists) {
                    var values = {};
                    values[studentDepartment] = 1;
                    var users = [studentId];

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                        .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                        .collection(CollectionConfig.CHALLENGE_STAT).doc('demographics')
                        .set({
                            values: values,
                            users: users
                        }).then(function (docRef) {
                        });

                } else {
                    var values = doc.data().values || {};
                    var users = doc.data().users || [];

                    if (users.indexOf(studentId) == -1) {
                        users.push(studentId);

                        if (typeof (values[studentDepartment]) === 'undefined') {
                            values[studentDepartment] = 1;
                        } else {
                            values[studentDepartment] += 1;
                        }


                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                            .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                            .collection(CollectionConfig.CHALLENGE_STAT).doc('demographics')
                            .update({
                                values: values,
                                users: users
                            }).then(function (docRef) {
                            });
                    }


                }


            });

    }


    async calculateChapterStat(challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, studentLevel, studentDepartment) {

        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
            .collection(CollectionConfig.CHAPTER_STAT).doc('demographics')
            .get().then(async (doc) => {

                if (!doc.exists) {
                    var values = {};
                    values[studentDepartment] = 1;
                    var users = [studentId];

                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                        .collection(CollectionConfig.CHAPTER_STAT).doc('demographics')
                        .set({
                            values: values,
                            users: users
                        }).then(function (docRef) {
                        });
                } else {
                    var values = doc.data().values || {};
                    var users = doc.data().users || [];

                    if (users.indexOf(studentId) == -1) {
                        users.push(studentId);
                        if (typeof (values[studentDepartment]) === 'undefined') {
                            values[studentDepartment] = 1;
                        } else {
                            values[studentDepartment] += 1;
                        }

                        await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                            .collection(CollectionConfig.CHAPTER).doc(chapterCode)
                            .collection(CollectionConfig.CHAPTER_STAT).doc('demographics')
                            .update({
                                values: values,
                                users: users
                            }).then(function (docRef) {
                            });
                    }
                }
            });

    }


}

module.exports.CalculateChapter = CalculateChapter;