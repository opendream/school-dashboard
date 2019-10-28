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

class ExportNewSchoolDetail extends BaseSchoolPage {
    constructor(props) {
        super(props);

        const values = queryString.parse(this.props.location.search)
        const file = (values.file);


        this.state = {
            data: [],
            csvData: [],
            chapters: {},
            organization: null,
            count: 0,
            fileCount: 0,
            filename: 'Download',
            file: file,
            isDone: false
        }
    }

    componentWillUpdate(nextProps, nextState) {
        // console.log('componentWillUpdate')

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

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {

                    self.setState({
                        organization:  doc.data(),
                        filename: moment().format('YYYYMMDD') + ' สถิติการใช้โดยรวม School Dashboard ' + doc.data().organizationName
                    })
                });


            var columns = [
                "Date (วันเดือนปี)",
                "Total Users (จำนวน Users รวม)",
                "Total Interactions (จำนวนการโต้ตอบกับบอท)",
                "Total Completions (จำนวนบทที่เรียนจบ)",
                "Score X Bar (คะแนนเฉลี่ยรวม)",

                "Highest Score Top 1",
                "Score Top 1",
                "Highest Score Top 2",
                "Score Top 2",
                "Highest Score Top 3",
                "Score Top 3",
                "Highest Score Top 4",
                "Score Top 4",
                "Highest Score Top 5",
                "Score Top 5",
                "Chapter Complete Top 1",
                "Top 1 Chapter Users",
                "Chapter Complete Top 2",
                "Top 2 Chapter Users",
                "Chapter Complete Top 3",
                "Top 3 Chapter Users",
                "Chapter Complete Top 4",
                "Top 4 Chapter Users",
                "Chapter Complete Top 5",
                "Top 5 Chapter Users",
            ];

            var columnsKey = [
                'created',
                'totalUser',
                'totalInteraction',
                'totalCompletion',
                'avgScore',

                'top1StudentName',
                'top1StudentScore',
                'top2StudentName',
                'top2StudentScore',
                'top3StudentName',
                'top3StudentScore',
                'top4StudentName',
                'top4StudentScore',
                'top5StudentName',
                'top5StudentScore',

                'top1ChapterName',
                'top1ChapterUser',
                'top2ChapterName',
                'top2ChapterUser',
                'top3ChapterName',
                'top3ChapterUser',
                'top4ChapterName',
                'top4ChapterUser',
                'top5ChapterName',
                'top5ChapterUser',

            ];

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.DEPARTMENT)
                .get()
                .then((querySnapshot) => {

                    var indexStart = 4;

                    querySnapshot.forEach((doc) => {
                        columnsKey.splice(indexStart, 0, doc.id);
                        columns.splice(indexStart, 0, doc.id);

                        indexStart += 1;

                    });

                    self.setState({
                        columns: columns,
                        columnsKey: columnsKey
                    })

                    // console.log('columns', columns);


                });


            var organizationId = nextState.user.organizationId;
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.ORGANIZATION_STAT)
                .doc('courseCompletionGrowth')
                .collection(CollectionConfig.DATA)
                .orderBy('created')
                .get()
                .then((querySnapshot) => {
                    var data = [];


                    var totalUser = 0;
                    var totalInteraction = 0;
                    var totalCompletion = 0;
                    var avgScore = 0;

                    var mapStudent = {};
                    var mapChapter = {};

                    querySnapshot.forEach((doc) => {
                        var item = {};
                        item['created'] = moment(doc.data().created).format('DD/MM/YYYY');

                        totalUser += typeof(doc.data().totalUser) === 'undefined'? 0: doc.data().totalUser;
                        totalInteraction += typeof(doc.data().totalInteraction) === 'undefined'? 0: doc.data().totalInteraction;
                        totalCompletion += typeof(doc.data().totalCompletion) === 'undefined'? 0: doc.data().totalCompletion;
                        avgScore =  typeof(doc.data().avgScore) === 'undefined'? avgScore: (avgScore + doc.data().avgScore)/2;

                        item['totalUser'] = totalUser;
                        item['totalInteraction'] = totalInteraction;
                        item['totalCompletion'] = totalCompletion;
                        item['avgScore'] = avgScore;

                        var section = doc.data().section;
                        if (typeof(section) !== "undefined") {
                            Object.keys(section).forEach(function (key) {
                                item[key] = section[key];
                            });
                        }

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

                        db.collection(CollectionConfig.ORGANIZATION).doc(organizationId)
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
                                    if (students.length>5) return;
                                    if (students.indexOf(mapStudent[key].name) >= 0) return;

                                    item['top'+ (students.length+1) +'StudentName'] = mapStudent[key].name;
                                    item['top'+ (students.length+1) +'StudentScore'] = key;

                                    students.push(mapStudent[key].name)
                                });



                                this.setState({
                                    data: data,
                                });

                            });


                        db.collection(CollectionConfig.ORGANIZATION).doc(organizationId)
                            .collection(CollectionConfig.ORGANIZATION_STAT)
                            .doc('chapterScoreGrowth')
                            .collection(CollectionConfig.DATA)
                            .where('created', '==', doc.data().created)
                            .orderBy('totalUser', 'desc')
                            .limit(5)
                            .get()
                            .then((chapterQuerySnapshot) => {
                                // console.log('chapterQuerySnapshot', chapterQuerySnapshot.size);


                                chapterQuerySnapshot.forEach((chapter) => {
                                    mapChapter[chapter.data().totalUser] = {
                                        name: chapter.data().chapterCode,
                                    };

                                });


                                var chapters = [];

                                Object.keys(mapChapter).reverse().forEach(function (key, i) {
                                    if (chapters.length>5) return;
                                    if (chapters.indexOf(mapChapter[key].name) >= 0) return;

                                    // console.log('mapChapter[key].name', mapChapter[key].name);

                                    item['top'+ (chapters.length+1) +'ChapterName'] = mapChapter[key].name;
                                    item['top'+ (chapters.length+1) +'ChapterUser'] = key;

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

                });

            setTimeout(function () {
                console.log(self.state.fileCount);

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

            }, 15000);


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
                        <ExcelSheet dataSet={this.state.multiDataSet} name="Student">
                        </ExcelSheet>
                    </ExcelFile>

                    <CSVLink id="exportCSV" className="btn btn-download btn-sm ic-export"  data={this.state.csvData} filename={ this.state.filename + ".csv"}>CSV</CSVLink>

                </div>
            </div>

        );
    }
}

export default ExportNewSchoolDetail;