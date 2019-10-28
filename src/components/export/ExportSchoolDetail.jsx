import React from "react";
import ReactExport from "react-data-export";
import BaseSchoolPage from "../common/BaseSchoolPage";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

import { CSVLink } from "react-csv";

import firebase from "../../firebase";
let db = firebase.firestore();

var moment = require('moment');
import queryString from 'query-string'
import Header from "../organization/Header";
import BeatLoader from 'react-spinners/BeatLoader';


const CollectionConfig = require('../../config/collection.json');

class ExportSchoolDetail extends BaseSchoolPage {
    constructor(props) {
        super(props);

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
                        filename: moment().format('YYYYMMDD') + ' สถิติการใช้โดยรวม School Dashboard ' + doc.data().organizationName
                    })
                });


            var organizationId = nextState.user.organizationId;
            await db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.ORGANIZATION_STAT)
                .doc('courseCompletionGrowth')
                .collection(CollectionConfig.DATA)
                .orderBy('created')
                .get()
                .then(async (querySnapshot) => {
                    var data = [];


                    var totalUser = 0;
                    var totalInteraction = 0;
                    var totalComplete = 0;
                    var avgScore = 0;

                    var level6 = 0;
                    var level5 = 0;
                    var level4 = 0;
                    var level3 = 0;
                    var level2 = 0;
                    var level1 = 0;

                    var mapStudent = {};
                    var mapChapter = {};

                    await querySnapshot.forEach(async (doc) => {
                        var item = {};
                        item['created'] = moment(doc.data().created).format('DD/MM/YYYY');

                        totalUser += typeof (doc.data().totalUser) === 'undefined' ? 0 : doc.data().totalUser;
                        totalInteraction += typeof (doc.data().totalInteraction) === 'undefined' ? 0 : doc.data().totalInteraction;
                        totalComplete += typeof (doc.data().totalComplete) === 'undefined' ? 0 : doc.data().totalComplete;
                        avgScore = typeof (doc.data().avgScore) === 'undefined' ? avgScore : (avgScore + doc.data().avgScore) / 2;

                        item['totalUser'] = totalUser;
                        item['totalInteraction'] = totalInteraction;
                        item['totalComplete'] = totalComplete;
                        item['avgScore'] = avgScore;

                        level6 += typeof (doc.data().level6) === 'undefined' ? 0 : doc.data().level6;
                        level5 += typeof (doc.data().level5) === 'undefined' ? 0 : doc.data().level5;
                        level4 += typeof (doc.data().level4) === 'undefined' ? 0 : doc.data().level4;
                        level3 += typeof (doc.data().level3) === 'undefined' ? 0 : doc.data().level3;
                        level2 += typeof (doc.data().level2) === 'undefined' ? 0 : doc.data().level2;
                        level1 += typeof (doc.data().level1) === 'undefined' ? 0 : doc.data().level1;

                        item['level6'] = level6;
                        item['level5'] = level5;
                        item['level4'] = level4;
                        item['level3'] = level3;
                        item['level2'] = level2;
                        item['level1'] = level1;

                        item['top1StudentName'] = "";
                        item['top1StudentScore'] = "";
                        item['top2StudentName'] = "";
                        item['top2StudentScore'] = "";
                        item['top3StudentName'] = "";
                        item['top3StudentScore'] = "";
                        item['top4StudentName'] = "";
                        item['top4StudentScore'] = "";
                        item['top5StudentName'] = "";
                        item['top5StudentScore'] = "";

                        item['top1ChapterName'] = "";
                        item['top1ChapterUser'] = "";
                        item['top2ChapterName'] = "";
                        item['top2ChapterUser'] = "";
                        item['top3ChapterName'] = "";
                        item['top3ChapterUser'] = "";
                        item['top4ChapterName'] = "";
                        item['top4ChapterUser'] = "";
                        item['top5ChapterName'] = "";
                        item['top5ChapterUser'] = "";

                        await db.collection(CollectionConfig.ORGANIZATION).doc(organizationId)
                            .collection(CollectionConfig.ORGANIZATION_STAT)
                            .doc('studentScoreGrowth')
                            .collection(CollectionConfig.DATA)
                            .where('created', '==', doc.data().created)
                            .orderBy('totalScore', 'desc')
                            .limit(5)
                            .get()
                            .then((studentQuerySnapshot) => {

                                studentQuerySnapshot.forEach((student) => {
                                    mapStudent[student.data().totalScore] = {
                                        name: student.data().studentId,
                                    };

                                });

                                var students = [];
                                Object.keys(mapStudent).reverse().forEach(function (key, i) {
                                    if (students.length > 5) return;
                                    if (students.indexOf(mapStudent[key].name) >= 0) return;

                                    item['top' + (students.length + 1) + 'StudentName'] = mapStudent[key].name;
                                    item['top' + (students.length + 1) + 'StudentScore'] = key;

                                    students.push(mapStudent[key].name)
                                });


                                this.setState({
                                    data: data,
                                });

                            });


                        await db.collection(CollectionConfig.ORGANIZATION).doc(organizationId)
                            .collection(CollectionConfig.ORGANIZATION_STAT)
                            .doc('chapterScoreGrowth')
                            .collection(CollectionConfig.DATA)
                            .where('created', '==', doc.data().created)
                            .orderBy('totalUser', 'desc')
                            .limit(5)
                            .get()
                            .then(async (chapterQuerySnapshot) => {
                                console.log('chapterQuerySnapshot', chapterQuerySnapshot.size);


                                await chapterQuerySnapshot.forEach((chapter) => {
                                    mapChapter[chapter.data().totalUser] = {
                                        name: chapter.data().chapterCode,
                                    };

                                });


                                var chapters = [];

                                Object.keys(mapChapter).reverse().forEach(function (key, i) {
                                    if (chapters.length > 5) return;
                                    if (chapters.indexOf(mapChapter[key].name) >= 0) return;

                                    console.log('mapChapter[key].name', mapChapter[key].name);

                                    item['top' + (chapters.length + 1) + 'ChapterName'] = mapChapter[key].name;
                                    item['top' + (chapters.length + 1) + 'ChapterUser'] = key;

                                    chapters.push(mapChapter[key].name)
                                });


                                this.setState({
                                    data: data,
                                });

                            });

                        data.push(item);
                    });

                    this.setState({
                        data: data,
                    });


                    setTimeout(function () {

                        console.log('item', self.state.data);

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
                
                <div className="d-none">
                    <ExcelFile filename={this.state.filename} element={<a id="exportXls" href="#" className="btn btn-download btn-sm ic-export mr-2">XLS</a>}>
                        <ExcelSheet data={this.state.data} name="Student">
                            <ExcelColumn label="Date (วันเดือนปี)" value="created"/>
                            <ExcelColumn label="Total Users (จำนวน Users รวม)" value="totalUser"/>
                            <ExcelColumn label="Total Interactions (จำนวนการโต้ตอบกับบอท)" value="totalInteraction"/>
                            <ExcelColumn label="Total Completions (จำนวนบทที่เรียนจบ)" value="totalComplete"/>
                            <ExcelColumn label="Score X Bar (คะแนนเฉลี่ยรวม)" value="avgScore"/>
                            <ExcelColumn label="ม.6" value="level6"/>
                            <ExcelColumn label="ม.5" value="level5"/>
                            <ExcelColumn label="ม.4" value="level4"/>
                            <ExcelColumn label="ม.3" value="level3"/>
                            <ExcelColumn label="ม.2" value="level2"/>
                            <ExcelColumn label="ม.1" value="level1"/>
                            <ExcelColumn label="Highest Score Top 1" value="top1StudentName"/>
                            <ExcelColumn label="Score Top 1" value="top1StudentScore"/>
                            <ExcelColumn label="Highest Score Top 2" value="top2StudentName"/>
                            <ExcelColumn label="Score Top 2" value="top2StudentScore"/>
                            <ExcelColumn label="Highest Score Top 3" value="top3StudentName"/>
                            <ExcelColumn label="Score Top 3" value="top3StudentScore"/>
                            <ExcelColumn label="Highest Score Top 4" value="top4StudentName"/>
                            <ExcelColumn label="Score Top 4" value="top4StudentScore"/>
                            <ExcelColumn label="Highest Score Top 5" value="top5StudentName"/>
                            <ExcelColumn label="Score Top 5" value="top5StudentScore"/>
                            <ExcelColumn label="Chapter Complete Top 1" value="top1ChapterName"/>
                            <ExcelColumn label="Top 1 Chapter Users" value="top1ChapterUser"/>
                            <ExcelColumn label="Chapter Complete Top 2" value="top2ChapterName"/>
                            <ExcelColumn label="Top 2 Chapter Users" value="top2ChapterUser"/>
                            <ExcelColumn label="Chapter Complete Top 3" value="top3ChapterName"/>
                            <ExcelColumn label="Top 3 Chapter Users" value="top3ChapterUser"/>
                            <ExcelColumn label="Chapter Complete Top 4" value="top4ChapterName"/>
                            <ExcelColumn label="Top 4 Chapter Users" value="top4ChapterUser"/>
                            <ExcelColumn label="Chapter Complete Top 5" value="top5ChapterName"/>
                            <ExcelColumn label="Top 5 Chapter Users" value="top5ChapterUser"/>
                        </ExcelSheet>
                    </ExcelFile>

                    <CSVLink id="exportCSV" className="btn btn-download btn-sm ic-export"  data={this.state.data} filename={ this.state.filename + ".csv"}>CSV</CSVLink>

                </div>
            </div>

        );
    }
}

export default ExportSchoolDetail;