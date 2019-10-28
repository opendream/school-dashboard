import React from "react";
import ReactExport from "react-data-export";
import BaseSchoolPage from "../common/BaseSchoolPage";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

import {CSVLink} from "react-csv";
import queryString from 'query-string'

import firebase from "../../firebase";
import Header from "../organization/Header";

let db = firebase.firestore();

var moment = require('moment');
import BeatLoader from 'react-spinners/BeatLoader';

const CollectionConfig = require('../../config/collection.json');

class ExportUser extends BaseSchoolPage {

    constructor(props) {
        super(props);

        const values = queryString.parse(this.props.location.search)
        const file = (values.file);


        this.state = {
            data: [],
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
        const department = (values.department);
        const level = (values.level);
        const room = (values.room);
        const name = (values.name);

        const file = (values.file);

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
                });

            var query = db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.STUDENT)
                .where("isDelete", "==", false)

            if (typeof (department) !== 'undefined' && department !== '') {
                query = query.where("department", "==", department);
            }

            if (typeof (level) !== 'undefined' && level !== '') {
                query = query.where("level", "==", level);
            }

            if (typeof (room) !== 'undefined' && room !== '') {
                query = query.where("room", "==", room);
            }

            if (typeof (name) !== 'undefined' && name !== '') {
                query = query.orderBy('firstName').where("firstName", '>=', name).where("firstName", '<=', name + "\uf8ff");
            }

            await query.get()
                .then((querySnapshot) => {
                    console.log(querySnapshot.size);
                    this.setState({
                        totalStudent: querySnapshot.size,
                    })
                });

            await query.orderBy("totalScore", 'desc')
                .get()
                .then(async (querySnapshot) => {

                    await db.collection(CollectionConfig.ORGANIZATION)
                        .doc(organizationId)
                        .get()
                        .then((doc) => {

                            self.setState({
                                filename: moment().format('YYYYMMDD') + ' User Dashboard ' + doc.data().organizationName + " " + querySnapshot.size
                            })
                        });


                    let exportData = [];

                    var i = 1;
                    await querySnapshot.forEach((doc) => {

                        let data = {
                            id: i,
                            name: doc.data().firstName + " " + (doc.data().lastName || ""),
                            studentId: doc.data().studentId,
                            department: doc.data().department,
                            studentStatus: "กำลังศึกษาอยู่",
                            level: doc.data().level,
                            room: doc.data().room,
                            totalScore: typeof (doc.data().stat) === 'undefined' || typeof (doc.data().stat.totalScore) === 'undefined' ? 0 : doc.data().stat.totalScore,
                            totalStart: typeof (doc.data().stat) === 'undefined' || typeof (doc.data().stat.totalStart) === 'undefined' ? 0 : doc.data().stat.totalStart,
                            totalComplete: typeof (doc.data().stat) === 'undefined' || typeof (doc.data().stat.totalComplete) === 'undefined' ? 0 : doc.data().stat.totalComplete,
                            topChapter: typeof (doc.data().topChapter) === 'undefined' ? '' : doc.data().topChapter.chapterName + '(' + doc.data().topChapter.totalScore + '/' + doc.data().topChapter.chapterScore + ')',
                            dateJoined: typeof (doc.data().dateJoined) === 'undefined' ? '' : moment(doc.data().dateJoined).format('DD/MM/YYYY'),
                            modified: typeof (doc.data().modified) === 'undefined' ? '' : moment(doc.data().modified).format('DD/MM/YYYY')
                        };
                        i += 1;
                        exportData.push(data);
                    });

                    self.setState({
                        data: exportData,
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
                <Header user={this.state.user} organization={this.state.organization}/>
                <div className={"text-center " + (this.state.isDone ? " d-none" : "")} style={{'margin': '150px'}}>
                    <BeatLoader
                        sizeUnit={"px"}
                        size={30}
                        color={'#6c6c6d'}
                        loading={this.state.loading}
                    />
                </div>

                <div className={"container" + (!this.state.isDone ? " d-none" : "")}>
                    <div className="card text-center card-download-complete">
                        <div className="card-body">
                            <img className="mb-4" src="/static/images/download.png" alt="icon download"/>
                            <div
                                className="file-name">{this.state.filename}{this.state.file === 'csv' ? '.csv' : this.state.file === 'xls' ? '.xlsx' : ''}</div>
                            <h5 className="card-title">คุณได้ดาวน์โหลดไฟล์เรียบร้อยแล้ว</h5>
                        </div>
                    </div>
                </div>


                <div className="d-none">
                    <ExcelFile filename={this.state.filename} element={<a href="#" id="exportXls"
                                                                          className="btn btn-download btn-sm ic-export mr-2">XLS</a>}>
                        <ExcelSheet data={this.state.data} name="Student">
                            <ExcelColumn label="อันดับ (จากคะแนนรวม)" value="id"/>
                            <ExcelColumn label="ชื่อนักเรียน" value="name"/>
                            <ExcelColumn label="รหัสนักเรียน" value="studentId"/>
                            <ExcelColumn label="สายการเรียน" value="department"/>
                            <ExcelColumn label="สถานะ" value="studentStatus"/>
                            <ExcelColumn label="ชั้น" value="level"/>
                            <ExcelColumn label="ห้อง" value="room"/>
                            <ExcelColumn label="คะแนนรวม" value="totalScore"/>
                            <ExcelColumn label="บทที่เรียนจบ" value="totalComplete"/>
                            <ExcelColumn label="เริ่มเล่น (บท)" value="totalStart"/>
                            <ExcelColumn label="เล่นจบ (บท)" value="totalComplete"/>
                            <ExcelColumn label="บทเรียนที่ได้คะแนนดีสุด" value="topChapter"/>
                            <ExcelColumn label="เข้าใช้ครั้งแรก" value="dateJoined"/>
                            <ExcelColumn label="เข้าใช้ครั้งล่าสุด" value="modified"/>
                        </ExcelSheet>
                    </ExcelFile>

                    <CSVLink id="exportCSV" className="btn btn-download btn-sm ic-export" data={this.state.data}
                             filename={this.state.filename + ".csv"}>CSV</CSVLink>

                </div>
            </div>

        );
    }
}

export default ExportUser;