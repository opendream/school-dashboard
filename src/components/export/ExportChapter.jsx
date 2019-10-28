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

class ExportChapter extends BaseSchoolPage {
    constructor(props) {
        super(props);

        // $('body').addClass('d-none');

        const values = queryString.parse(this.props.location.search)
        const file = (values.file);

        this.state = {
            data: [],
            chapters: {},
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


        const values = queryString.parse(this.props.location.search)
        const subjectId = (values.subjectId);
        const name = (values.name);

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
                        filename: moment().format('YYYYMMDD') + ' สถิติการเรียนแบบ Chapter ' + doc.data().organizationName
                    })
                });


            var query = db.collection(CollectionConfig.CHAPTER)
                .where("isDelete", "==", false);

            if (typeof (subjectId) !== 'undefined' && subjectId !== '') {
                query = query.where("subjectId", "==", subjectId);
            }

            if (typeof (subjectId) !== 'undefined' && subjectId !== '') {
                query = query.where("subjectId", "==", subjectId);
            }

            if (typeof (name) !== 'undefined' && name !== '') {
                query = query.orderBy('chapterName').where("chapterName", '>=', name).where("chapterName", '<=', name + "\uf8ff");
            }


            await query.orderBy('chapterCode')
                .get().then(async (querySnapshot) => {
                let chapters = [];

                await querySnapshot.forEach((doc) => {
                    chapters[doc.data().chapterCode] = {
                        id: doc.id,
                        chapterName: doc.data().chapterName,
                        subjectName: doc.data().subjectName,
                        chapterScore: doc.data().chapterScore,
                        chapterQuiz: doc.data().chapterQuiz,
                        totalChallenge: typeof (doc.data().stat) === 'undefined' || typeof (doc.data().stat.totalChallenge) === 'undefined' ? 0 : doc.data().stat.totalChallenge,
                        totalComplete: 0,
                        totalUser: 0,
                        avgScore: 0,
                        percentComplete: 0,
                        level6: 0,
                        level5: 0,
                        level4: 0,
                        level3: 0,
                        level2: 0,
                        level1: 0,
                        chapterObjective: doc.data().chapterObjective,
                        chapterAssessment: doc.data().chapterAssessment,
                    };

                });

                this.setState({
                    chapters: chapters,
                    data: Array.from(Object.values(chapters))
                })

            });

            var organizationId = nextState.user.organizationId;
            await db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .get()
                .then(async (querySnapshot) => {
                    let chapters = self.state.chapters;

                    await querySnapshot.forEach(async (doc) => {

                        if (typeof (chapters[doc.id]) === "undefined") return;

                        if (typeof (doc.data()) !== "undefined" && typeof (doc.data().stat) !== "undefined") {
                            chapters[doc.id]['avgScore'] = doc.data().stat.avgScore;
                            chapters[doc.id]['totalUser'] = doc.data().stat.totalUser;
                            chapters[doc.id]['totalComplete'] = doc.data().stat.totalComplete;
                            chapters[doc.id]['percentComplete'] = doc.data().stat.totalComplete * 100 / doc.data().stat.totalUser;
                        }

                        var chapterId = doc.id;

                        await db.collection(CollectionConfig.ORGANIZATION)
                            .doc(organizationId)
                            .collection(CollectionConfig.CHAPTER)
                            .doc(chapterId)
                            .collection(CollectionConfig.CHAPTER_STAT)
                            .doc('demographics')
                            .get()
                            .then((doc) => {
                                if (doc.exists) {

                                    let values = doc.data().values;
                                    console.log('values', values)

                                    let chapters = self.state.chapters;
                                    chapters[chapterId]['level6'] = typeof (values[6]) === 'undefined' ? 0 : values[6];
                                    chapters[chapterId]['level5'] = typeof (values[5]) === 'undefined' ? 0 : values[5];
                                    chapters[chapterId]['level4'] = typeof (values[4]) === 'undefined' ? 0 : values[4];
                                    chapters[chapterId]['level3'] = typeof (values[3]) === 'undefined' ? 0 : values[3];
                                    chapters[chapterId]['level2'] = typeof (values[2]) === 'undefined' ? 0 : values[2];
                                    chapters[chapterId]['level1'] = typeof (values[1]) === 'undefined' ? 0 : values[1];

                                    this.setState({
                                        chapters: chapters,
                                        data: Array.from(Object.values(chapters))
                                    });

                                    console.log(chapterId, chapters)
                                }

                            });
                    });


                    this.setState({
                        chapters: chapters,
                        data: Array.from(Object.values(chapters))
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
                
                <div  className="d-none">
                    <ExcelFile filename={this.state.filename} element={<a id="exportXls" href="#" className="btn btn-download btn-sm ic-export mr-2">XLS</a>}>
                        <ExcelSheet data={this.state.data} name="Chapter">
                            <ExcelColumn label="Chapter ID" value="id"/>
                            <ExcelColumn label="Subject" value="subjectName"/>
                            <ExcelColumn label="Chapter" value="chapterName"/>
                            <ExcelColumn label="จำนวน challenge รวม" value="totalChallenge"/>
                            <ExcelColumn label="จำนวน Quiz รวม" value="chapterQuiz"/>
                            <ExcelColumn label="คะแนนเต็ม" value="chapterScore"/>
                            <ExcelColumn label="คะแนนเฉลี่ย" value="avgScore"/>
                            <ExcelColumn label="Users เริ่มเรียน" value="totalUser"/>
                            <ExcelColumn label="Users เรียนจบ" value="totalComplete"/>
                            <ExcelColumn label="อัตราเรียนจบ" value="percentComplete"/>
                            <ExcelColumn label="ม.6" value="level6"/>
                            <ExcelColumn label="ม.5" value="level5"/>
                            <ExcelColumn label="ม.4" value="level4"/>
                            <ExcelColumn label="ม.3" value="level3"/>
                            <ExcelColumn label="ม.2" value="level2"/>
                            <ExcelColumn label="ม.1" value="level1"/>
                            <ExcelColumn label="Learning Objectives" value="chapterObjective"/>
                            <ExcelColumn label="Assessment Outcome" value="chapterAssessment"/>
                        </ExcelSheet>
                    </ExcelFile>

                    <CSVLink id="exportCSV" className="btn btn-download btn-sm ic-export"  data={this.state.data} filename={this.state.filename+".csv"}>CSV</CSVLink>

                </div>

            </div>

        );
    }
}

export default ExportChapter;