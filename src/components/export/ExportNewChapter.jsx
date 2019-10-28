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

class ExportNewChapter extends BaseSchoolPage {
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
            isDone: false,
            csvData: [],
        }
    }

    componentWillUpdate(nextProps, nextState) {
        // console.log('componentWillUpdate')

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
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {

                    self.setState({
                        organization:  doc.data(),
                        filename: moment().format('YYYYMMDD') + ' สถิติการเรียนแบบ Chapter ' + doc.data().organizationName
                    })
                });


            var columns = [
                "Chapter ID",
                "Subject",
                "Chapter",
                "จำนวน challenge รวม",
                "จำนวน Quiz รวม",
                "คะแนนเต็ม",
                "คะแนนเฉลี่ย",
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
                "totalChallenge",
                "chapterQuiz",
                "chapterScore",
                "avgScore",
                "totalUser",
                "totalComplete",
                "percentComplete",
                "chapterObjective",
                "chapterAssessment",

            ];

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.DEPARTMENT)
                .get()
                .then((querySnapshot) => {

                    var indexStart = 10;

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
                .where("isDelete", "==", false);

            if (typeof (subjectId) !== 'undefined' && subjectId !== '') {
                query = query.where("subjectId", "==", subjectId);
            }

            if (typeof(subjectId) !== 'undefined' && subjectId !== '') {
                query = query.where("subjectId", "==", subjectId);
            }

            if (typeof(name) !== 'undefined' && name !== '') {
                query = query.orderBy('chapterName').where("chapterName" ,'>=',name).where("chapterName" ,'<=', name + "\uf8ff");
            }


            query.orderBy('chapterCode')
                .get().then((querySnapshot) => {
                let chapters = [];

                querySnapshot.forEach((doc) => {
                    chapters[doc.data().chapterCode] = {
                        id: doc.id,
                        chapterName: doc.data().chapterName,
                        subjectName: doc.data().subjectName,
                        chapterScore: doc.data().chapterScore,
                        chapterQuiz: doc.data().chapterQuiz,
                        totalChallenge: typeof (doc.data().stat) === 'undefined' || typeof (doc.data().stat.totalChallenge) === 'undefined'? 0: doc.data().stat.totalChallenge,
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
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .get()
                .then((querySnapshot) => {
                    let chapters = self.state.chapters;

                    querySnapshot.forEach((doc) => {

                        if (typeof (chapters[doc.id]) === "undefined") return;

                        if (typeof (doc.data()) !== "undefined" && typeof (doc.data().stat) !== "undefined") {
                            chapters[doc.id]['avgScore'] = doc.data().stat.avgScore;
                            chapters[doc.id]['totalUser'] = doc.data().stat.totalUser;
                            chapters[doc.id]['totalComplete'] = doc.data().stat.totalComplete;
                            chapters[doc.id]['percentComplete'] =  doc.data().stat.totalComplete * 100 / doc.data().stat.totalUser;
                        }

                        var chapterId = doc.id;

                        db.collection(CollectionConfig.ORGANIZATION)
                            .doc(organizationId)
                            .collection(CollectionConfig.CHAPTER)
                            .doc(chapterId)
                            .collection(CollectionConfig.CHAPTER_STAT)
                            .doc('demographics')
                            .get()
                            .then((doc) => {
                                if (doc.exists) {

                                    let values = doc.data().values;
                                    // console.log('values', values);

                                    let chapters = self.state.chapters;

                                    Object.keys(values).forEach(function (key) {
                                        chapters[chapterId][key] = values[key]
                                    });

                                    this.setState({
                                        chapters: chapters,
                                        data: Array.from(Object.values(chapters))
                                    });

                                    // console.log(chapterId, chapters)
                                }

                            });
                    });


                    this.setState({
                        chapters: chapters,
                        data: Array.from(Object.values(chapters))
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

export default ExportNewChapter;