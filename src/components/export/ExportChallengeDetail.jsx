import React from "react";
import ReactExport from "react-data-export";
import BaseSchoolPage from "../common/BaseSchoolPage";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

import { CSVLink } from "react-csv";

import firebase from "../../firebase";
let db = firebase.firestore();

import queryString from 'query-string'
import Header from "../organization/Header";
import BeatLoader from 'react-spinners/BeatLoader';
var moment = require('moment');

const CollectionConfig = require('../../config/collection.json');

class ExportChallengeDetail extends BaseSchoolPage {
    constructor(props) {
        super(props);


        let chapterId = this.props.params.chapterId;
        let challengeId = this.props.params.challengeId;

        var self = this;

        db.collection(CollectionConfig.CHAPTER)
            .doc(chapterId)
            .collection(CollectionConfig.CHALLENGE)
            .doc(challengeId)
            .collection(CollectionConfig.QUIZ)
            .get()
            .then(async (querySnapshot) => {
                let questions = {};
                await querySnapshot.forEach(async (doc) => {
                    var quizId = doc.data().quizId;

                    questions[quizId] = {
                        id: doc.id,
                        chapterId: doc.data().chapterId,
                        subjectId: doc.data().subjectId,
                        challengeId: challengeId,

                        quizId: doc.data().quizId,
                        quizQuestion: doc.data().quizQuestion,
                        isDelete: doc.data().isDelete,

                        choices: [],
                        totalChoices: 0
                    };

                    await db.collection(CollectionConfig.CHAPTER)
                        .doc(chapterId)
                        .collection(CollectionConfig.CHALLENGE)
                        .doc(challengeId)
                        .collection(CollectionConfig.QUIZ)
                        .doc(quizId)
                        .collection(CollectionConfig.CHOICE)
                        .orderBy('isCorrect', 'desc')
                        .get()
                        .then((querySnapshot) => {
                            let choices = {};
                            let questions = self.state.quiz;

                            let totalChoices = 0;
                            querySnapshot.forEach((doc) => {
                                var item = {
                                    id: doc.id,
                                    choice: doc.data().choice || "",
                                    isCorrect: doc.data().isCorrect || false,
                                    score: doc.data().score || "",

                                };

                                choices[doc.id] = (item);
                                totalChoices += 1
                            });

                            questions[quizId].choices = choices;
                            questions[quizId].totalChoices = totalChoices;

                            this.setState({
                                quiz: questions
                            })

                        });


                });

                this.setState({
                    quiz: questions
                })
            });

        const values = queryString.parse(this.props.location.search)
        const file = (values.file);

        this.state = {
            data: [],
            chapters: {},
            challenge: {},
            chapterId: chapterId,
            challengeId: challengeId,
            organization: null,
            quiz: {},
            count: 0,
            fileCount: 0,
            multiDataSet: [],
            csvData: [],
            filename: 'Download',
            file: file,
            isDone: false

        }
    }

    async componentWillUpdate(nextProps, nextState) {
        // console.log('componentWillUpdate')

        var self = this;

        let chapterId = this.state.chapterId;
        let challengeId = this.state.challengeId;

        const values = queryString.parse(this.props.location.search)
        const file = (values.file);

        if (this.state.organization == null && this.state.count == 0 && nextState.user) {


            setTimeout(function () {
                self.setState({
                    count: 1,
                });

            }, 1);

            var organizationId = nextState.user.organizationId;
            await db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {

                    self.setState({
                        organization: doc.data(),
                    })
                });


            var multiDataSet = [{}, {}, {}, {}, {}, {}];

            await db.collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .get().then(async (doc) => {
                var subjectName = doc.data().subjectName;
                var chapterName = doc.data().chapterName;

                    await db.collection(CollectionConfig.CHAPTER)
                    .doc(chapterId)
                    .collection(CollectionConfig.CHALLENGE)
                    .doc(challengeId)
                    .get().then(async (doc) => {

                    var challengeId = doc.id;
                    var challengeName = doc.data().challengeName;

                    var organizationId = nextState.user.organizationId;
                    await db.collection(CollectionConfig.ORGANIZATION)
                        .doc(organizationId)
                        .get()
                        .then((doc) => {

                            self.setState({
                                filename: moment().format('YYYYMMDD') + ' สถิติการเรียนบท ' + challengeId + ' ' + chapterName + ' ' + challengeName + ' (' + doc.data().organizationName + ')'
                            })
                        });


                    let challenge = {
                        id: doc.id,
                        chapterName: chapterName,
                        subjectName: subjectName,
                        challengeName: doc.data().challengeName,
                        challengeLevel: doc.data().challengeLevel,
                        challengeQuiz: doc.data().challengeQuiz,
                        challengeScore: doc.data().challengeScore,
                        avgScore: 0,
                        avgScorePercent: 0,
                        totalUser: 0,
                        totalComplete: 0,
                        percentComplete: 0,
                        challengeObjective: doc.data().challengeObjective,
                        challengeAssessment: doc.data().challengeAssessment,
                    };


                    multiDataSet[0] = ({
                        columns: ["", ""],
                        data: [
                            ["ChallengeID", challengeId],
                            ["วิชา", subjectName],
                            ["Chapter", chapterName],
                            ["Challenge", doc.data().challengeName],
                            ["ระดับความรู้", doc.data().challengeLevel],
                            ["จำนวนข้อ", doc.data().challengeQuiz],
                            ["คะแนนเต็ม", doc.data().challengeScore],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                            [],
                        ]
                    });

                    this.setState({
                        challenge: challenge,
                        multiDataSet: multiDataSet
                    });


                    var organizationId = nextState.user.organizationId;
                    await db.collection(CollectionConfig.ORGANIZATION)
                        .doc(organizationId)
                        .collection(CollectionConfig.CHAPTER)
                        .doc(chapterId)
                        .collection(CollectionConfig.CHALLENGE)
                        .doc(challengeId)
                        .get()
                        .then(async (doc) => {

                            // console.log("export challenge", doc.exists);

                            if (doc.exists) {

                                let challenge = self.state.challenge;
                                let multiDataSet = self.state.multiDataSet;

                                if (typeof (challenge) === "undefined") return;

                                if (typeof (doc.data()) !== "undefined" && typeof (doc.data().stat) !== "undefined") {
                                    challenge['avgScore'] = doc.data().stat.avgScore;
                                    challenge['avgScorePercent'] = doc.data().stat.avgScore;
                                    challenge['totalStart'] = doc.data().stat.totalStart;
                                    challenge['totalComplete'] = doc.data().stat.totalComplete;
                                    challenge['percentComplete'] = doc.data().stat.totalComplete * 100 / doc.data().stat.totalUser;
                                } else {
                                    challenge['avgScore'] = 0;
                                    challenge['avgScorePercent'] = 0;
                                    challenge['totalStart'] = 0;
                                    challenge['totalComplete'] = 0;
                                    challenge['percentComplete'] = 0;
                                }

                                // console.log(multiDataSet[0]);

                                multiDataSet[0].data[7] = (["คะแนนเฉลี่ย", challenge['avgScore']]);
                                multiDataSet[0].data[8] = (["อัตราคะแนนเฉลี่ย", challenge['avgScorePercent']]);
                                multiDataSet[0].data[9] = (["เริ่มเรียน", challenge['totalStart']]);
                                multiDataSet[0].data[10] = (["เรียนจบ", challenge['totalComplete']]);
                                multiDataSet[0].data[11] = (["อัตราเรียนจบ", challenge['percentComplete']]);
                                multiDataSet[0].data[12] = (["Learning Objectives", challenge['challengeObjective']]);
                                multiDataSet[0].data[13] = (["Assessment Outcome", challenge['challengeAssessment']]);

                                this.setState({
                                    challenge: challenge,
                                    multiDataSet: multiDataSet
                                });

                                let totalStart = challenge.totalStart;

                                await db.collection(CollectionConfig.ORGANIZATION)
                                    .doc(organizationId)
                                    .collection(CollectionConfig.CHAPTER)
                                    .doc(chapterId)
                                    .collection(CollectionConfig.CHALLENGE)
                                    .doc(challengeId)
                                    .collection(CollectionConfig.CHALLENGE_STAT)
                                    .doc('demographics')
                                    .get()
                                    .then((doc) => {
                                        if (doc.exists) {

                                            var data = [];

                                            let values = doc.data().values;

                                            Object.keys(values).forEach(function (key) {
                                                data.push([key, values[key], values[key] * 100 / totalStart])
                                            });

                                            let multiDataSet = self.state.multiDataSet;
                                            multiDataSet[1] = ({
                                                ySteps: 1,
                                                columns: ["Demographic", "จำนวนคน", "%"],
                                                data: data
                                            });

                                            this.setState({
                                                multiDataSet: multiDataSet
                                            });
                                        }
                                    });

                                await db.collection(CollectionConfig.ORGANIZATION)
                                    .doc(organizationId)
                                    .collection(CollectionConfig.CHAPTER)
                                    .doc(chapterId)
                                    .collection(CollectionConfig.CHALLENGE)
                                    .doc(challengeId)
                                    .collection(CollectionConfig.STUDENT)
                                    .get()
                                    .then((querySnapshot) => {

                                        var totalStudent = querySnapshot.size;

                                        var scoreData = {}
                                        querySnapshot.forEach((doc) => {
                                            let key = doc.data().totalScore + "";
                                            if (key == 'undefined') {
                                                key = 0;
                                            }

                                            if (typeof (scoreData[key]) == "undefined") {
                                                scoreData[key] = 1
                                            } else {
                                                scoreData[key] += 1
                                            }
                                        });


                                        var data = [];
                                        Object.keys(scoreData).forEach(function (key) {
                                            data.push([key, scoreData[key], scoreData[key] * 100 / totalStudent])
                                        });

                                        let multiDataSet = self.state.multiDataSet;
                                        multiDataSet[2] = ({
                                            ySteps: 1,
                                            columns: ["Scores", "จำนวนคน", "%"],
                                            data: data
                                        });

                                        this.setState({
                                            multiDataSet: multiDataSet
                                        });


                                    });

                                await db.collection(CollectionConfig.ORGANIZATION)
                                    .doc(organizationId)
                                    .collection(CollectionConfig.CHAPTER)
                                    .doc(chapterId)
                                    .collection(CollectionConfig.CHALLENGE)
                                    .doc(challengeId)
                                    .collection(CollectionConfig.QUIZ)
                                    .get()
                                    .then((querySnapshot) => {
                                        let questions = self.state.quiz;

                                        querySnapshot.forEach((doc) => {
                                            var choiceStat = doc.data().choiceStat;
                                            var totalEvent = doc.data().totalEvent;
                                            // console.log('choiceStat', choiceStat)

                                            if (typeof (choiceStat) !== 'undefined') {
                                                Object.keys(choiceStat).forEach(function (key) {
                                                    questions[doc.id].choices[key]['value'] = choiceStat[key] * 100 / totalEvent;
                                                });
                                            }
                                        });


                                        var data = [];

                                        Object.keys(questions).forEach(function (key) {
                                            var item = ["", key, questions[key]["quizQuestion"]];
                                            Object.keys(questions[key].choices).forEach(function (choiceKey) {
                                                item.push(questions[key].choices[choiceKey]['choice']);
                                                item.push(questions[key].choices[choiceKey]['value']);
                                            });
                                            data.push(item);
                                        });

                                        let multiDataSet = self.state.multiDataSet;
                                        multiDataSet[3] = ({
                                            ySteps: 1,
                                            columns: ["Learning Statistics", "QuizID", "คำถาม", "ข้อที่ถูกต้อง", "จำนวนคนตอบถูก (%)", "ข้อ 2", "จำนวนคนตอบข้อ 2 (%)", "ข้อ 3", "จำนวนคนตอบข้อ 3 (%)", "ข้อ 4", "จำนวนคนตอบข้อ 4 (%)"],
                                            data: data
                                        });

                                        this.setState({
                                            multiDataSet: multiDataSet,
                                            quiz: questions
                                        });

                                    });


                                await db.collection(CollectionConfig.ORGANIZATION)
                                    .doc(organizationId)
                                    .collection(CollectionConfig.CHAPTER)
                                    .doc(chapterId)
                                    .collection(CollectionConfig.CHALLENGE)
                                    .doc(challengeId)
                                    .collection(CollectionConfig.STUDENT)
                                    .where("isCompleted", "==", true)
                                    .get()
                                    .then((querySnapshot) => {
                                        let student = [];
                                        querySnapshot.forEach((doc) => {
                                            var item = [
                                                doc.data().firstName + " " + (doc.data().lastName || ""),
                                                doc.data().totalScore
                                            ];

                                            student.push(item);
                                        });

                                        let multiDataSet = self.state.multiDataSet;
                                        multiDataSet[4] = ({
                                            ySteps: 1,
                                            columns: ["Finished Users", "คะแนนที่ได้"],
                                            data: student
                                        });

                                        this.setState({
                                            multiDataSet: multiDataSet
                                        });
                                    });

                                await db.collection(CollectionConfig.ORGANIZATION)
                                    .doc(organizationId)
                                    .collection(CollectionConfig.CHAPTER)
                                    .doc(chapterId)
                                    .collection(CollectionConfig.CHALLENGE)
                                    .doc(challengeId)
                                    .collection(CollectionConfig.STUDENT)
                                    .where("isCompleted", "==", false)
                                    .get()
                                    .then((querySnapshot) => {
                                        let student = [];
                                        querySnapshot.forEach((doc) => {
                                            var item = [
                                                doc.data().firstName + " " + (doc.data().lastName || ""),
                                                doc.data().latestQuizId
                                            ];

                                            student.push(item);
                                        });

                                        let multiDataSet = self.state.multiDataSet;
                                        multiDataSet[5] = ({
                                            ySteps: 1,
                                            columns: ["Unfinished Users", "ข้อล่าสุด"],
                                            data: student
                                        });

                                        this.setState({
                                            multiDataSet: multiDataSet
                                        });
                                    });

                                // console.log("export challenge", multiDataSet);


                            } else {
                                let multiDataSet = self.state.multiDataSet;

                                multiDataSet[0].data[7] = (["คะแนนเฉลี่ย", "-"]);
                                multiDataSet[0].data[8] = (["อัตราคะแนนเฉลี่ย", "-"]);
                                multiDataSet[0].data[9] = (["เริ่มเรียน", "-"]);
                                multiDataSet[0].data[10] = (["เรียนจบ", "-"]);
                                multiDataSet[0].data[11] = (["อัตราเรียนจบ", "-"]);
                                multiDataSet[0].data[12] = (["Learning Objectives", "-"]);
                                multiDataSet[0].data[13] = (["Assessment Outcome", "-"]);

                                multiDataSet[1] = ({
                                    ySteps: 1,
                                    columns: ["Demographic", "จำนวนคน", "%"],
                                    data: []
                                });

                                multiDataSet[2] = ({
                                    ySteps: 1,
                                    columns: ["Scores", "จำนวนคน", "%"],
                                    data: []
                                });

                                multiDataSet[3] = ({
                                    ySteps: 1,
                                    columns: ["Learning Statistics", "QuizID", "คำถาม", "ข้อที่ถูกต้อง", "จำนวนคนตอบถูก (%)", "ข้อ 2", "จำนวนคนตอบข้อ 2 (%)", "ข้อ 3", "จำนวนคนตอบข้อ 3 (%)", "ข้อ 4", "จำนวนคนตอบข้อ 4 (%)"],
                                    data: []
                                });


                                multiDataSet[4] = ({
                                    ySteps: 1,
                                    columns: ["Finished Users", "คะแนนที่ได้"],
                                    data: []

                                });

                                multiDataSet[5] = ({
                                    ySteps: 1,
                                    columns: ["Unfinished Users", "ข้อล่าสุด"],
                                    data: []
                                });

                                this.setState({
                                    multiDataSet: multiDataSet
                                });
                            }


                        });

                    setTimeout(function () {
                        // console.log(self.state.fileCount);

                        if (self.state.fileCount == 0) {


                            let csvData = [];
                            let multiDataSet = self.state.multiDataSet;
                            // console.log('multiDataSet',multiDataSet);


                            multiDataSet.forEach(function (dataSet) {
                                csvData.push(dataSet.columns);

                                if (typeof (dataSet.data) != 'undefined') {
                                    dataSet.data.forEach(function (data) {
                                        csvData.push(data)

                                    });

                                    csvData.push([""])

                                }

                            });

                            self.setState({
                                csvData: csvData,
                            });

                            if (file === 'xls') {
                                $('#exportXls').get(0).click();
                            } else if (file === 'csv') {

                                $('#exportCSV').get(0).click();
                            }

                            self.setState({
                                fileCount: 1,
                                isDone: true
                            });

                        }

                    }, 100);


                });

            });


        }


    }

    render() {
        return (
            <div>
                <Header user={this.state.user} organization={this.state.organization} />
                <div className={"text-center " + (this.state.isDone? " d-none": "")} style={{'margin': '150px'}}>
                    <BeatLoader
                        sizeUnit={"px"}
                        size={30}
                        color={'#6c6c6d'}
                        loading={this.state.loading}
                    />
                </div>
                
                <div className={"container"  + (!this.state.isDone? " d-none": "")}>
                    <div className="card text-center card-download-complete">
                        <div className="card-body">
                        <img className="mb-4" src="/static/images/download.png" alt="icon download" />
                            <div className="file-name">{this.state.filename}{this.state.file === 'csv'? '.csv': this.state.file === 'xls'? '.xlsx': ''}</div>
                            <h5 className="card-title">คุณได้ดาวน์โหลดไฟล์เรียบร้อยแล้ว</h5>
                        </div>
                    </div>
                </div>
                
                <div className="d-none">
                    <ExcelFile filename={this.state.filename}  element={<a id="exportXls" href="#" className="btn btn-download btn-sm ic-export mr-2">XLS</a>}>
                        <ExcelSheet dataSet={this.state.multiDataSet} name="ChallengeDetail">
                        </ExcelSheet>
                    </ExcelFile>

                    <CSVLink id="exportCSV" className="btn btn-download btn-sm ic-export"  data={this.state.csvData} filename={ this.state.filename + ".csv"}>CSV</CSVLink>

                </div>
            </div>

        );
    }
}

export default ExportChallengeDetail;