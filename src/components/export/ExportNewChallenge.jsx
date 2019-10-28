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
import BeatLoader from 'react-spinners/BeatLoader';

import Header from "../organization/Header";
var moment = require('moment');

const CollectionConfig = require('../../config/collection.json');

class ExportNewChallenge extends BaseSchoolPage {
    constructor(props) {
        super(props);

        let chapterId = this.props.params.chapterId;

        const values = queryString.parse(this.props.location.search)
        const file = (values.file);

        this.state = {
            data: [],
            chapters: {},
            challenge: {},
            chapterId: chapterId,
            organization: null,
            count: 0,
            fileCount: 0,
            filename: 'Download',
            file: file,
            isDone: false,
            csvData: [],
        }
    }

    componentWillUpdate(nextProps, nextState) {
        // console.log('componentWillUpdate')

        var self = this;

        let chapterId = this.state.chapterId;

        const values = queryString.parse(this.props.location.search)
        const file = (values.file);

        if (this.state.organization == null && this.state.count == 0 && nextState.user) {

            setTimeout(function () {
                self.setState({
                    count: 1,
                });

            }, 1);

            var organizationId = nextState.user.organizationId;
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {

                    self.setState({
                        organization:  doc.data(),
                    })
                });

            var columns = [
                "Chapter ID",
                "Subject",
                "Chapter",
                "Challenge",

                "คะแนนเต็ม",
                "คะแนนเฉลี่ย",
                "คะแนนสูงสุด",
                "คะแนนต่ำสุด",

                "Users เริ่มเรียน",
                "Users เรียนจบ",
                "อัตราเรียนจบ",

                "Learning Objectives",
                "Assessment Outcome",

            ];

            var columnsKey = [
                "id",
                "subjectName",
                "chapterName",
                "challengeName",

                "challengeScore",
                "avgScore",
                "maxScore",
                "minScore",

                "totalUser",
                "totalComplete",
                "percentComplete",

                "challengeObjective",
                "challengeAssessment",

            ];

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.DEPARTMENT)
                .get()
                .then((querySnapshot) => {

                    var indexStart = 11;

                    querySnapshot.forEach((doc) => {
                        columnsKey.splice(indexStart, 0, doc.id);
                        columns.splice(indexStart, 0, doc.id);

                        indexStart += 1;

                    });

                    self.setState({
                        columns: columns,
                        columnsKey: columnsKey
                    })



                });


            var query = db.collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .where("isDelete", "==", false);

            db.collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .get().then((doc) => {
                    var subjectName = doc.data().subjectName;
                    var chapterName = doc.data().chapterName;

                var organizationId = nextState.user.organizationId;
                db.collection(CollectionConfig.ORGANIZATION)
                    .doc(organizationId)
                    .get()
                    .then((doc) => {

                        self.setState({
                            filename: moment().format('YYYYMMDD') + ' สถิติการเรียนแบบ Challenge '+ chapterName +' (' + doc.data().organizationName + ')'
                        })
                    });


                query.orderBy('challengeCode')
                        .get().then((querySnapshot) => {
                        let challenges = [];

                        querySnapshot.forEach((doc) => {
                            challenges[doc.data().challengeCode] = {
                                id: doc.id,
                                chapterName: chapterName,
                                subjectName: subjectName,
                                challengeName: doc.data().challengeName,
                                challengeScore: doc.data().challengeScore,
                                challengeQuiz: doc.data().challengeQuiz,
                                avgScore: 0,
                                maxScore: 0,
                                minScore: 0,
                                totalUser: 0,
                                totalComplete: 0,
                                percentComplete: 0,
                                level6: 0,
                                level5: 0,
                                level4: 0,
                                level3: 0,
                                level2: 0,
                                level1: 0,
                                challengeObjective: doc.data().challengeObjective,
                                challengeAssessment: doc.data().challengeAssessment,
                            };

                        });

                        this.setState({
                            challenges: challenges,
                            data: Array.from(Object.values(challenges))
                        })

                        var organizationId = nextState.user.organizationId;
                        db.collection(CollectionConfig.ORGANIZATION)
                            .doc(organizationId)
                            .collection(CollectionConfig.CHAPTER)
                            .doc(chapterId)
                            .collection(CollectionConfig.CHALLENGE)
                            .get()
                            .then((querySnapshot) => {
                                let challenges = self.state.challenges;

                                querySnapshot.forEach((doc) => {

                                    if (typeof (challenges[doc.id]) === "undefined") return;

                                    if (typeof (doc.data()) !== "undefined" && typeof (doc.data().stat) !== "undefined") {
                                        challenges[doc.id]['avgScore'] = doc.data().stat.avgScore;
                                        challenges[doc.id]['totalUser'] = doc.data().stat.totalUser;
                                        challenges[doc.id]['totalComplete'] = doc.data().stat.totalComplete;
                                        challenges[doc.id]['percentComplete'] =  doc.data().stat.totalComplete * 100 / doc.data().stat.totalUser;
                                    }

                                    var challengeId = doc.id;

                                    db.collection(CollectionConfig.ORGANIZATION)
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

                                                let values = doc.data().values;
                                                // console.log('values', values);

                                                let challenges = self.state.challenges;
                                                Object.keys(values).forEach(function (key) {
                                                    challenges[challengeId][key] = values[key]
                                                });


                                                this.setState({
                                                    challenges: challenges,
                                                    data: Array.from(Object.values(challenges))
                                                });

                                            }

                                        });


                                    db.collection(CollectionConfig.ORGANIZATION)
                                        .doc(organizationId)
                                        .collection(CollectionConfig.CHAPTER)
                                        .doc(chapterId)
                                        .collection(CollectionConfig.CHALLENGE)
                                        .doc(challengeId)
                                        .collection(CollectionConfig.STUDENT)
                                        .get()
                                        .then((querySnapshot) => {

                                            let minScore = 999;
                                            let maxScore = 0;

                                            querySnapshot.forEach((doc) => {
                                                var score = doc.data().totalScore || 0;
                                                if (score > maxScore) maxScore = score;
                                                if (score < minScore) minScore = score;
                                            });

                                            let challenges = self.state.challenges;
                                            challenges[challengeId]['minScore'] = minScore + "";
                                            challenges[challengeId]['maxScore'] = maxScore + "";

                                            this.setState({
                                                challenges: challenges,
                                                data: Array.from(Object.values(challenges))
                                            });

                                        });
                                });

                                setTimeout(function () {
                                    // console.log(self.state.fileCount);

                                    if (self.state.fileCount == 0) {

                                        var data = [];

                                        var items = self.state.data;
                                        items.forEach(function (item) {
                                            var newItem = [];
                                            self.state.columnsKey.forEach(function (key) {
                                                newItem.push(item[key] || '');
                                            });

                                            data.push(newItem)
                                        });

                                        let csvData = [];
                                        var multiDataSet = [{}];
                                        multiDataSet[0] =({
                                            columns: self.state.columns,
                                            data: data
                                        });

                                        multiDataSet.forEach(function (dataSet) {
                                            csvData.push(dataSet.columns);

                                            if(typeof(dataSet.data)!= 'undefined') {
                                                dataSet.data.forEach(function (data) {
                                                    csvData.push(data)

                                                });

                                                csvData.push([""])

                                            }

                                        });

                                        self.setState({
                                            csvData: csvData,
                                            multiDataSet: multiDataSet
                                        });

                                        if (file === 'xls') {
                                            $('#exportXls').get(0).click();
                                        } else if(file === 'csv') {

                                            $('#exportCSV').get(0).click();
                                        }

                                        self.setState({
                                            fileCount: 1,
                                            isDone: true
                                        });

                                    }

                                }, 5000);

                            });



                        this.setState({
                            chapters: challenges,
                            data: Array.from(Object.values(challenges))
                        });


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
                        <ExcelFile filename={this.state.filename} element={<a id="exportXls" href="#" className="btn btn-download btn-sm ic-export mr-2">XLS</a>}>
                            <ExcelSheet dataSet={this.state.multiDataSet} name="Chapter">
                            </ExcelSheet>
                        </ExcelFile>

                        <CSVLink id="exportCSV" className="btn btn-download btn-sm ic-export"  data={this.state.csvData} filename={ this.state.filename + ".csv"}>CSV</CSVLink>

                    </div>
                </div>

            </div>
        );
    }
}

export default ExportNewChallenge;