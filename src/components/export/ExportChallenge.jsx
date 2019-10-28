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

class ExportChallenge extends BaseSchoolPage {
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
            isDone: false
        }
    }

    async componentWillUpdate(nextProps, nextState) {
        console.log('componentWillUpdate')

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
            await db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {

                    self.setState({
                        organization: doc.data(),
                    })
                });

            var query = db.collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .collection(CollectionConfig.CHALLENGE)
                .where("isDelete", "==", false);

            db.collection(CollectionConfig.CHAPTER)
                .doc(chapterId)
                .get().then(async (doc) => {
                var subjectName = doc.data().subjectName;
                var chapterName = doc.data().chapterName;

                var organizationId = nextState.user.organizationId;
                await db.collection(CollectionConfig.ORGANIZATION)
                    .doc(organizationId)
                    .get()
                    .then((doc) => {

                        self.setState({
                            filename: moment().format('YYYYMMDD') + ' สถิติการเรียนแบบ Challenge ' + chapterName + ' (' + doc.data().organizationName + ')'
                        })
                    });


                await query.orderBy('challengeCode')
                    .get().then(async (querySnapshot) => {
                        let challenges = [];

                        await querySnapshot.forEach((doc) => {
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
                        await db.collection(CollectionConfig.ORGANIZATION)
                            .doc(organizationId)
                            .collection(CollectionConfig.CHAPTER)
                            .doc(chapterId)
                            .collection(CollectionConfig.CHALLENGE)
                            .get()
                            .then(async (querySnapshot) => {
                                let challenges = self.state.challenges;

                                await querySnapshot.forEach(async(doc) => {

                                    if (typeof (challenges[doc.id]) === "undefined") return;

                                    if (typeof (doc.data()) !== "undefined" && typeof (doc.data().stat) !== "undefined") {
                                        challenges[doc.id]['avgScore'] = doc.data().stat.avgScore;
                                        challenges[doc.id]['totalUser'] = doc.data().stat.totalUser;
                                        challenges[doc.id]['totalComplete'] = doc.data().stat.totalComplete;
                                        challenges[doc.id]['percentComplete'] = doc.data().stat.totalComplete * 100 / doc.data().stat.totalUser;
                                    }

                                    var challengeId = doc.id;

                                    await db.collection(CollectionConfig.ORGANIZATION)
                                        .doc(organizationId)
                                        .collection(CollectionConfig.CHAPTER)
                                        .doc(chapterId)
                                        .collection(CollectionConfig.CHALLENGE)
                                        .doc(challengeId)
                                        .collection(CollectionConfig.CHALLENGE_STAT)
                                        .doc('demographics')
                                        .get()
                                        .then(async(doc) => {
                                            if (doc.exists) {

                                                let values = doc.data().values;
                                                console.log('values', values);

                                                let challenges = self.state.challenges;
                                                challenges[challengeId]['level6'] = typeof (values[6]) === 'undefined' ? 0 : values[6];
                                                challenges[challengeId]['level5'] = typeof (values[5]) === 'undefined' ? 0 : values[5];
                                                challenges[challengeId]['level4'] = typeof (values[4]) === 'undefined' ? 0 : values[4];
                                                challenges[challengeId]['level3'] = typeof (values[3]) === 'undefined' ? 0 : values[3];
                                                challenges[challengeId]['level2'] = typeof (values[2]) === 'undefined' ? 0 : values[2];
                                                challenges[challengeId]['level1'] = typeof (values[1]) === 'undefined' ? 0 : values[1];

                                                this.setState({
                                                    challenges: challenges,
                                                    data: Array.from(Object.values(challenges))
                                                });

                                            }

                                        });


                                    await db.collection(CollectionConfig.ORGANIZATION)
                                        .doc(organizationId)
                                        .collection(CollectionConfig.CHAPTER)
                                        .doc(chapterId)
                                        .collection(CollectionConfig.CHALLENGE)
                                        .doc(challengeId)
                                        .collection(CollectionConfig.CHALLENGE_STAT)
                                        .doc('scoreRange')
                                        .get()
                                        .then(async(doc) => {
                                            if (doc.exists) {

                                                let values = doc.data().values;
                                                let scores = Object.keys(values).sort();

                                                let challenges = self.state.challenges;
                                                challenges[challengeId]['minScore'] = scores[0];
                                                challenges[challengeId]['maxScore'] = scores[(scores.length) - 1];

                                                this.setState({
                                                    challenges: challenges,
                                                    data: Array.from(Object.values(challenges))
                                                });

                                            }

                                        });
                                });

                                setTimeout(function () {

                                    if (self.state.fileCount == 0) {
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
                    <ExcelFile filename={this.state.filename}  element={<a id="exportXls" href="#" className="btn btn-download btn-sm ic-export mr-2">XLS</a>}>
                        <ExcelSheet data={this.state.data} name="Challenge">
                            <ExcelColumn label="Chapter ID" value="id"/>
                            <ExcelColumn label="Subject" value="subjectName"/>
                            <ExcelColumn label="Chapter" value="chapterName"/>
                            <ExcelColumn label="Challenge" value="challengeName"/>
                            <ExcelColumn label="คะแนนเต็ม" value="challengeScore"/>
                            <ExcelColumn label="คะแนนเฉลี่ย" value="avgScore"/>
                            <ExcelColumn label="คะแนนสูงสุด" value="maxScore"/>
                            <ExcelColumn label="คะแนนต่ำสุด" value="minScore"/>
                            <ExcelColumn label="Users เริ่มเรียน" value="totalUser"/>
                            <ExcelColumn label="Users เรียนจบ" value="totalComplete"/>
                            <ExcelColumn label="อัตราเรียนจบ" value="percentComplete"/>
                            <ExcelColumn label="ม.6" value="level6"/>
                            <ExcelColumn label="ม.5" value="level5"/>
                            <ExcelColumn label="ม.4" value="level4"/>
                            <ExcelColumn label="ม.3" value="level3"/>
                            <ExcelColumn label="ม.2" value="level2"/>
                            <ExcelColumn label="ม.1" value="level1"/>
                            <ExcelColumn label="Learning Objectives" value="challengeObjective"/>
                            <ExcelColumn label="Assessment Outcome" value="challengeAssessment"/>
                        </ExcelSheet>
                    </ExcelFile>

                    <CSVLink id="exportCSV" className="btn btn-download btn-sm ic-export"  data={this.state.data} filename={this.state.filename + ".csv"}>CSV</CSVLink>

                </div>

            </div>
        );
    }
}

export default ExportChallenge;