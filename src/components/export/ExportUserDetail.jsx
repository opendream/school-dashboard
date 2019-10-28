import React from "react";
import ReactExport from "react-data-export";
import BaseSchoolPage from "../common/BaseSchoolPage";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

import { CSVLink } from "react-csv";
import queryString from 'query-string'

import firebase from "../../firebase";
import Header from "../organization/Header";
let db = firebase.firestore();

var moment = require('moment');
import BeatLoader from 'react-spinners/BeatLoader';

const CollectionConfig = require('../../config/collection.json');

class ExportUserDetail extends BaseSchoolPage {

    constructor(props) {
        super(props);

        let userId = this.props.params.userId;
        console.log('userId', userId);

        const values = queryString.parse(this.props.location.search)
        const file = (values.file);


        this.state = {
            data: [],
            organization: null,
            userId: userId,
            student: {},
            count: 0,
            fileCount: 0,
            multiDataSet: [{}, {}, {}, {}],
            csvData: [],
            filename: "Download",
            file: file,
            isDone: false
        }
    }

    async componentWillUpdate(nextProps, nextState) {
        console.log('componentWillUpdate')

        var self = this;


        const values = queryString.parse(this.props.location.search)
        const file = (values.file);

        let userId = this.state.userId;

        if (this.state.organization == null && this.state.count == 0 && nextState.user) {
            setTimeout(function () {
                self.setState({
                    count: 1,
                });

            }, 1)

            var organizationId = nextState.user.organizationId;

            await db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        self.setState({
                            'organization': doc.data(),
                        })

                    }
                })

            await db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then(async (doc) => {

                    var totalUser = typeof (doc.data().stat) !== "undefined" ? doc.data().stat.totalUser : 0;

                    await db.collection(CollectionConfig.ORGANIZATION)
                        .doc(organizationId)
                        .collection(CollectionConfig.STUDENT)
                        .doc(userId)
                        .get()
                        .then(async (doc) => {

                            var studentId = doc.data().studentId;
                            var studentName = doc.data().firstName + " " + (doc.data().lastName || "");

                            self.setState({
                                filename: moment().format('YYYYMMDD') + ' User Export ' + studentId + " " + studentName
                            });

                            let multiDataSet = this.state.multiDataSet;

                            if (doc.exists) {
                                let student = {
                                    id: doc.id,
                                    name: doc.data().firstName + " " + (doc.data().lastName || ""),
                                    studentId: doc.data().studentId,
                                    department: doc.data().department,
                                    studentStatus: "กำลังศึกษาอยู่",
                                    level: doc.data().level,
                                    room: doc.data().room,
                                    ranking: typeof (doc.data().stat) === 'undefined' || typeof (doc.data().stat.ranking) === 'undefined' ? 0 : doc.data().stat.ranking,
                                    totalScore: typeof (doc.data().stat) === 'undefined' || typeof (doc.data().stat.totalScore) === 'undefined' ? 0 : doc.data().stat.totalScore,
                                    totalStart: typeof (doc.data().stat) === 'undefined' || typeof (doc.data().stat.totalStart) === 'undefined' ? 0 : doc.data().stat.totalStart,
                                    totalComplete: typeof (doc.data().stat) === 'undefined' || typeof (doc.data().stat.totalComplete) === 'undefined' ? 0 : doc.data().stat.totalComplete,
                                    topChapter: typeof (doc.data().topChapter) === 'undefined' ? {} : doc.data().topChapter,
                                    dateJoined: typeof (doc.data().dateJoined) === 'undefined' ? '' : moment(doc.data().dateJoined).format('DD/MM/YYYY'),
                                    modified: typeof (doc.data().modified) === 'undefined' ? '' : moment(doc.data().modified).format('DD/MM/YYYY')
                                };

                                multiDataSet[0] = ({
                                    columns: ["", ""],
                                    data: [
                                        ["รหัสนักเรียน", student.studentId],
                                        ["ชื่อสกุล", student.name],
                                        ["คะแนนรวม", student.totalScore],
                                        ["ลำดับที่", student.ranking],
                                        ["จากลำดับทั้งหมด", totalUser],
                                        ["สถานะ", "กำลังศึกษาอยู่"],
                                        ["ชั้น", student.level],
                                        ["ห้อง", student.room],
                                        ["บทที่เรียนจบ", student.totalComplete],
                                        ["เริ่มเล่น", student.totalStart],
                                        ["เล่นจบ", student.totalComplete],
                                        ["เข้าใช้ครั้งแรก", student.dateJoined],
                                        ["เข้าใช้ครั้งล่าสุด", student.modified],
                                    ]
                                });


                                multiDataSet[1] = ({
                                    ySteps: 1,
                                    columns: ["", "chapter", "คะแนนที่ได้", "คะแนนเต็ม"],
                                    data: [
                                        [
                                            "บทเรียนที่ได้คะแนนดีสุด",
                                            student.topChapter.chapterName,
                                            student.topChapter.totalScore,
                                            student.topChapter.chapterScore,
                                        ]
                                    ]
                                });


                                await db.collection(CollectionConfig.ORGANIZATION)
                                    .doc(organizationId)
                                    .collection(CollectionConfig.STUDENT)
                                    .doc(userId)
                                    .collection(CollectionConfig.CHAPTER)
                                    .where("isCompleted", "==", true)
                                    .get()
                                    .then((querySnapshot) => {
                                        let data = [];
                                        querySnapshot.forEach((doc) => {
                                            var item;

                                            if (data.length == 0) {
                                                item = [
                                                    "บทที่เล่นจบแล้ว",
                                                    doc.data().chapterName,
                                                    doc.data().totalScore,
                                                    doc.data().chapterScore
                                                ];
                                            } else {
                                                item = [
                                                    doc.data().chapterName,
                                                    doc.data().totalScore,
                                                    doc.data().chapterScore
                                                ];
                                            }

                                            data.push(item);
                                        });

                                        let multiDataSet = self.state.multiDataSet;
                                        multiDataSet[2] = ({
                                            ySteps: 1,
                                            columns: ["", "chapter", "คะแนนที่ได้", "คะแนนเต็ม"],
                                            data: data
                                        });

                                        this.setState({
                                            multiDataSet: multiDataSet
                                        });
                                    });

                                await db.collection(CollectionConfig.ORGANIZATION)
                                    .doc(organizationId)
                                    .collection(CollectionConfig.STUDENT)
                                    .doc(userId)
                                    .collection(CollectionConfig.CHAPTER)
                                    .where("isCompleted", "==", false)
                                    .get()
                                    .then((querySnapshot) => {
                                        let data = [];
                                        querySnapshot.forEach((doc) => {
                                            var item;

                                            if (data.length == 0) {
                                                item = [
                                                    "บทที่ยังเล่นไม่จบ",
                                                    doc.data().chapterName,
                                                    doc.data().totalScore,
                                                    doc.data().chapterScore
                                                ];
                                            } else {
                                                item = [
                                                    doc.data().chapterName,
                                                    doc.data().totalScore,
                                                    doc.data().chapterScore
                                                ];
                                            }


                                            data.push(item);
                                        });

                                        let multiDataSet = self.state.multiDataSet;
                                        multiDataSet[3] = ({
                                            ySteps: 1,
                                            columns: ["", "chapter", "คะแนนที่ได้", "คะแนนเต็ม"],
                                            data: data
                                        });

                                        this.setState({
                                            multiDataSet: multiDataSet
                                        });
                                    });


                                this.setState({
                                    student: student,
                                    multiDataSet: multiDataSet
                                });

                            }


                            setTimeout(function () {
                                console.log(self.state.fileCount);

                                if (self.state.fileCount == 0) {

                                    let csvData = [];
                                    let multiDataSet = self.state.multiDataSet;
                                    multiDataSet.forEach(function (dataSet) {
                                        csvData.push(dataSet.columns)
                                        dataSet.data.forEach(function (data) {
                                            csvData.push(data)

                                        });

                                        csvData.push([""])
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
                    <ExcelFile filename={this.state.filename} element={<a id="exportXls" href="#" className="btn btn-download btn-sm ic-export mr-2">XLS</a>}>
                        <ExcelSheet dataSet={this.state.multiDataSet} name="ChallengeDetail">
                        </ExcelSheet>
                    </ExcelFile>

                    <CSVLink id="exportCSV" className="btn btn-download btn-sm ic-export"  data={this.state.csvData} filename={this.state.filename  + ".csv"}>CSV</CSVLink>

                </div>
            </div>

        );
    }
}

export default ExportUserDetail;