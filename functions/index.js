const functions = require('firebase-functions');

const firebase = require("firebase");
require("firebase/firestore");

var moment = require('moment');

const config = require('./config/firebaseConfig.json');

firebase.initializeApp(config);
let db = firebase.firestore();

const express = require('express');;
const app = express();

const CollectionConfig = require('./config/collection.json');

app.post('/event-action-quiz', function (req, res) {
    console.log("req", req.body)

    let challengeCode = req.body['challengeCode'] || '';
    let chapterCode = req.body['chapterCode'] || '';
    let choiceId = req.body['choiceId'] || '';

    let time = req.body['time'] || '';
    let created = (new Date()).getTime();

    if (time !== '') {
        created = moment(parseInt(time) * 1000).valueOf();
    }

    let eventId = req.body['eventId'] || '';
    let isComplete = req.body['isComplete'] || false;
    let isCorrect = req.body['isCorrect'] || false;
    let isStart = req.body['isStart'] || false;

    let quizId = req.body['quizId'] || '';
    let schoolId = req.body['schoolId'] || '';
    let score = req.body['score'] || 0;

    let studentId = req.body['studentId'] || '';
    let subjectCode = req.body['subjectCode'] || '';

    if (challengeCode === "" ||
        chapterCode === "" ||
        choiceId === "" ||
        created === "" ||
        eventId === "" ||
        isComplete === "" ||
        isCorrect === "" ||
        isStart === "" ||
        quizId === "" ||
        schoolId === "" ||
        score === "" ||
        studentId === "" ||
        subjectCode === ""

    ) {

        return res.status(400).send({'error':'information is required!'});
    }

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
    db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
        .collection(CollectionConfig.STUDENT).doc(studentId)
        .get().then(async (doc) => {
        if (doc.exists) {

            await db.collection(CollectionConfig.CHAPTER).doc(chapterCode)
                .collection(CollectionConfig.CHALLENGE).doc(challengeCode)
                .collection(CollectionConfig.QUIZ).doc(quizId)
                .collection(CollectionConfig.CHOICE).doc(choiceId).get().then((doc) => {

                if (doc.exists) {
                    return db.collection(CollectionConfig.EVENT).add(event)
                        .then(function () {});
                } else {
                    return res.status(400).send({'error':'chapterCode or challengeCode or quizId or choiceId does not exist!'});
                }
            });
        } else {
            return res.status(400).send({'error':'schoolId or studentId does not exist!'});
        }
    });
});


app.post('/calculate-event-stat', function (req, res) {

    /* Oop~ ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ */

});

exports.SchoolStatAPI = functions.https.onRequest(app);
