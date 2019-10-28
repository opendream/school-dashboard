const functions = require('firebase-functions');
const admin = require('firebase-admin');
const moment = require('moment');

admin.initializeApp();

const config = require('./config/firebaseConfig.json');
const CollectionConfig = require('./config/collection.json');
const { Calculate } = require('./components/calculate');

const generateReport = async (req, res) => {
    console.log("req", req.body);

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

    return await new Calculate().calculateStat(subjectCode, challengeCode, chapterCode, choiceId, created, eventId, isComplete, isCorrect, isStart, quizId, schoolId, score, studentId, res);
};

const generateEvent = async (req, res) => {
    console.log("req", req.body);

    let text = req.body['text'] || '';

    let time = req.body['time'] || '';

    let created = (new Date()).getTime();
    if (time !== '') {
        created = moment(parseInt(time) * 1000).valueOf();
    }


    let eventId = req.body['eventId'] || '';
    let schoolId = req.body['schoolId'] || '';

    let studentId = req.body['studentId'] || '';

    if (
        created === "" ||
        eventId === "" ||
        text === "" ||
        schoolId === "" ||
        studentId === ""
    ) {

        return res.status(400).send({'error':'information is required!'});
    }

    var event = {
        text: text,
        created: created,
        eventId: eventId,
        schoolId: schoolId,
        studentId: studentId,

    };

    db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
        .collection(CollectionConfig.STUDENT).doc(studentId)
        .get().then(async(doc) => {
        if (doc.exists) {
            return await db.collection(CollectionConfig.EVENT).add(event)
                .then(async function () {
                    console.log("Document successfully written!");

                    //  set student event
                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .collection(CollectionConfig.STUDENT).doc(studentId)
                        .collection(CollectionConfig.EVENT)
                        .add(event).then(function () {
                    });

                    //  set totalInteraction
                    await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId)
                        .get().then(async(doc) => {

                        var totalInteraction = 1;
                        if (typeof (doc.data().stat) !== 'undefined' && typeof (doc.data().stat.totalInteraction) !== 'undefined') {
                            totalInteraction = doc.data().stat.totalInteraction + 1;
                        }

                         await db.collection(CollectionConfig.ORGANIZATION).doc(schoolId).update({'stat.totalInteraction': totalInteraction})
                    });

                    return res.sendStatus(200);
                });

        } else {
            return res.status(400).send({'error':'schoolId or studentId does not exist!'});
        }
    });

};


const generateReportViaHTTP = async (req, res) => {
    try {
        return await generateReport(req, res);
    } catch (error) {
        res.status(500).send({code: 500, success: false, error: error});
    }
};

const generateEventViaHTTP = async (req, res) => {
    try {
        return await generateEvent(req, res);
    } catch (error) {
        res.status(500).send({code: 500, success: false, error: error});
    }
};

const submitEvent = functions
    .runWith({memory: '256MB', timeoutSeconds: 60})
    .https.onRequest((req, res) => generateEventViaHTTP(req, res));

const submitQuiz = functions
    .runWith({memory: '256MB', timeoutSeconds: 120})
    .https.onRequest((req, res) => generateReportViaHTTP(req, res));

module.exports = {
    submitQuiz,
    submitEvent
};
