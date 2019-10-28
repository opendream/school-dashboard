import React from "react";
import Header from "./Header";

import BaseSchoolPage from "../common/BaseSchoolPage";


import firebase from "../../firebase";
let db = firebase.firestore();

import queryString from 'query-string'

import swal from "sweetalert";
import ExportChapter from "../export/ExportChapter";

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

const CollectionConfig = require('../../config/collection.json');


class Chapters extends BaseSchoolPage {
    constructor(props) {
        super(props);

        const values = queryString.parse(this.props.location.search)
        const subjectId = (values.subjectId);
        const name = (values.name);

        this.state = {
            organization: null,
            currentChapter: 0,
            totalChapter: 0,
            latestId: "",
            chapters: [],
            subjectId: subjectId,
            name: name,
        }
    }

    componentWillUpdate(nextProps, nextState) {

        var self = this;

        const values = queryString.parse(this.props.location.search)
        const subjectId = (values.subjectId);
        const name = (values.name);

        if (this.state.organization == null && nextState.user) {


            var organizationId = nextState.user.organizationId;
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        self.setState({
                            'organization':  doc.data(),
                            'subjectId': subjectId
                        })

                    }
                })

            db.collection(CollectionConfig.CONTENT)
                .where("isDelete", "==", false)
                .orderBy("subjectCode")
                .get()
                .then((querySnapshot) => {
                    let subjects = [];
                    querySnapshot.forEach((doc) => {
                        var item = {
                            id: doc.id,
                            subjectName: doc.data().subjectName,
                            subjectCode: doc.data().subjectCode,
                            stat: doc.data().stat,
                            isDelete: doc.data().isDelete
                        };
                        subjects.push(item);
                    });


                    this.setState({
                        subjects: subjects
                    })
                });

            var query = db.collection(CollectionConfig.CHAPTER)
                .where("isDelete", "==", false);

            if (typeof(subjectId) !== 'undefined' && subjectId !== '') {
                query = query.where("subjectId", "==", subjectId);
            }

            if (typeof(name) !== 'undefined' && name !== '') {
                query = query.orderBy('chapterName').where("chapterName" ,'>=',name).where("chapterName" ,'<=', name + "\uf8ff");
            }

            query.get().then((querySnapshot) => {
                this.setState({
                    totalChapter: querySnapshot.size
                })
            });

            query.orderBy('chapterCode')
                .limit(5)
                .get().then((querySnapshot) => {
                    let chapters = [];
                    let exportData = [];
                    let latestId = "";

                    querySnapshot.forEach((doc) => {
                        chapters[doc.data().chapterCode] = {
                            id: doc.id,
                            chapterName: doc.data().chapterName,
                            chapterCode: doc.data().chapterCode,
                            subjectName: doc.data().subjectName,
                            subjectCode: doc.data().subjectCode,
                            chapterScore: doc.data().chapterScore,
                            chapterCoverUrl: doc.data().chapterCoverUrl,
                            stat: {
                                totalChallenge: doc.data().stat.totalChallenge,
                                avgScore: 0,
                                totalUser: 0
                            },
                            isDelete: doc.data().isDelete,
                        };

                        latestId = doc.id;
                    });

                    this.setState({
                        latestId: latestId,
                        currentChapter: 5,
                        chapters: chapters
                    });

                    db.collection(CollectionConfig.ORGANIZATION)
                        .doc(organizationId)
                        .collection(CollectionConfig.CHAPTER)
                        .get()
                        .then((querySnapshot) => {
                            let chapters = self.state.chapters;

                            querySnapshot.forEach((doc) => {


                                if (typeof(chapters[doc.id]) === "undefined") return;

                                if (typeof(doc.data()) !== "undefined" && typeof(doc.data().stat) !== "undefined") {
                                    chapters[doc.id]['stat']['avgScore'] = doc.data().stat.avgScore;
                                    chapters[doc.id]['stat']['totalUser'] = doc.data().stat.totalUser;
                                } else {
                                    chapters[doc.id]['stat']['avgScore'] = 0;
                                    chapters[doc.id]['stat']['totalUser'] = 0;
                                }
                            });

                            this.setState({
                                chapters: chapters
                            })
                        });

                });



        }



    }


    gotoFilterPage(subjectId) {
        if (subjectId == '') window.location.href = '/chapter';

        window.location.href = '/chapter?subjectId=' + subjectId;
    }

    loadMore() {
        var self = this;

        const organizationId = this.state.organization.organizationCode;
        const values = queryString.parse(this.props.location.search)
        const subjectId = (values.subjectId);
        const name = (values.name);

        var query = db.collection(CollectionConfig.CHAPTER)
            .where("isDelete", "==", false);

        if (typeof(subjectId) !== 'undefined' && subjectId !== '') {
            query = query.where("subjectId", "==", subjectId);
        }


        if (typeof(name) !== 'undefined' && name !== '') {
            query = query.orderBy('chapterName').where("chapterName" ,'>=',name).where("chapterName" ,'<=', name + "\uf8ff");
        }

        query.get().then((querySnapshot) => {
            this.setState({
                totalChapter: querySnapshot.size
            })
        });

        query.orderBy('chapterCode')
            .where("chapterCode", ">", this.state.latestId)
            .limit(5)
            .get().then((querySnapshot) => {
            let chapters = this.state.chapters;
            let latestId = "";

            var currentChapter = this.state.currentChapter;

            querySnapshot.forEach((doc) => {
                chapters[doc.id] = {
                    id: doc.id,
                    chapterName: doc.data().chapterName,
                    chapterCode: doc.data().chapterCode,
                    subjectName: doc.data().subjectName,
                    subjectCode: doc.data().subjectCode,
                    chapterScore: doc.data().chapterScore,
                    chapterCoverUrl: doc.data().chapterCoverUrl,
                    stat: {
                        totalChallenge: doc.data().stat.totalChallenge,
                        avgScore: 0,
                        totalUser: 0
                    },
                    isDelete: doc.data().isDelete,
                };

                currentChapter += 1;
                latestId = doc.id;
            });

            this.setState({
                latestId: latestId,
                currentChapter: currentChapter,
                chapters: chapters
            });

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .get()
                .then((querySnapshot) => {
                    let chapters = self.state.chapters;

                    querySnapshot.forEach((doc) => {

                        if (typeof(chapters[doc.id]) === "undefined") return;

                        if (typeof(doc.data()) !== "undefined" && typeof(doc.data().stat) !== "undefined") {
                            chapters[doc.id]['stat']['avgScore'] = doc.data().stat.avgScore;
                            chapters[doc.id]['stat']['totalUser'] = doc.data().stat.totalUser;
                        } else {
                            chapters[doc.id]['stat']['avgScore'] = 0;
                            chapters[doc.id]['stat']['totalUser'] = 0;
                        }
                    });

                    this.setState({
                        chapters: chapters
                    })
                });

        });


    }

    onChange(e) {
        const { name, value } = e.target

        this.setState({
            [name]: value
        })
    }

    render() {
        if (this.state.user == null || typeof(this.state.user) === "undefined") {
            return  super.render()
        }

        var  isSubject = this.state != null && typeof(this.state) !== "undefined"
            && this.state.subjects != null && typeof(this.state.subjects) !== "undefined";

        var  isChapter = this.state != null && typeof(this.state) !== "undefined"
            && this.state.chapters != null && typeof(this.state.chapters) !== "undefined";

        const values = queryString.parse(this.props.location.search)
        const subjectId = (values.subjectId);

        const name = (this.state.name);

        return (
            <div className="bg-light mh-100vh">
                <Header user={this.state.user} organization={this.state.organization} />
                <div className="container pb-5">
                    <div className="header-group">
                        <div className="row">
                            <div className="col-2">
                                <button className={"btn btn-radius mb-1 " + (typeof(subjectId) === 'undefined' || "" === subjectId? ' active': '')} onClick={(e) => this.gotoFilterPage('')}>รวม Chapters</button>
                            </div>
                            <div className="col-10">
                                {
                                    isSubject?
                                        this.state.subjects.map((subject, i) =>
                                            <button className={"btn btn-radius " + (subject.subjectCode === subjectId? ' active': '')} onClick={(e) => this.gotoFilterPage(subject.subjectCode)}>{subject.subjectName} ({subject.stat.totalChapter})</button>): <div></div>
                                }
                            </div>
                        </div>
                    </div>
                    <div className="search-group float-right mt-4">
                        <div className="form-inline">
                            <form>
                                <input className="form-control mr-sm-2" name="name" onChange={(e) => this.onChange(e)} type="search" placeholder="ค้นหา (บทเรียน)" aria-label="Search" value={this.state.name}/>
                                <input className="form-control mr-sm-2" type="hidden" name="subjectId" value={subjectId} />
                                <Link to={`/chapter/?subjectId=${subjectId || ""}&name=${name || ""}`} target="_self" className="">
                                    <button className="btn btn-search-inline" type="button" >search</button></Link>
                            </form>

                            <Link to={`/chapter/export/?file=xls&name=${name || ""}&subjectId=${subjectId || ""}`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                XLS</Link>
                            <Link to={`/chapter/export/?file=csv&name=${name || ""}&subjectId=${subjectId || ""}`} target="_blank"  className="btn btn-download btn-sm ic-export">
                                CSV</Link>

                        </div>
                    </div>
                    <div className="clearfix"></div>
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead>
                                <tr>
                                <th scope="col">ลำดับ</th>
                                <th scope="col"></th>
                                <th scope="col" className="w-25">Chapter</th>
                                <th scope="col">วิชา</th>
                                <th scope="col">จำนวนชาเล้นจ์</th>
                                <th scope="col">คะแนนเต็ม</th>
                                <th scope="col">คะแนนเฉลี่ย</th>
                                <th scope="col">จำนวนนักเรียน</th>
                                <th scope="col"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    isChapter?
                                        Object.keys(this.state.chapters).map((key, i) =>
                                            <tr>
                                                <td>
                                                    <div className="img-thumb"><img
                                                    width="44"
                                                    src={typeof(this.state.chapters[key].chapterCoverUrl) === 'undefined' || this.state.chapters[key].chapterCoverUrl.indexOf('https') === -1? "/static/images/default-chapter.png": this.state.chapters[key].chapterCoverUrl}
                                                    alt={this.state.chapters[key].chapterName} />
                                                    </div>
                                                </td>
                                                <td>#{i+1}</td>
                                                <td>{this.state.chapters[key].chapterName}</td>
                                                <td>{this.state.chapters[key].subjectName}</td>
                                                <td className="text-center">{this.state.chapters[key].stat.totalChallenge}</td>
                                                <td className="text-center">{this.state.chapters[key].chapterScore}</td>
                                                <td className="text-center">{typeof(this.state.chapters[key].stat.avgScore) === 'undefined'? '-': this.state.chapters[key].stat.avgScore.toFixed(2)}</td>
                                                <td className="text-center">{this.state.chapters[key].stat.totalUser}</td>
                                                <td className="text-center">
                                                    <Link to={`/chapter/${this.state.chapters[key].id}/detail`} className="btn btn-outline btn-sm">
                                                       อ่านเพิ่ม</Link>
                                                </td>
                                            </tr>): <tr></tr>
                                }
                            </tbody>
                        </table>
                        {
                            Object.keys(this.state.chapters).length == 0? <div className="text-center" style={{'padding-bottom': '20px'}}>ยังไม่มีข้อมูล</div>:<span></span>
                        }
                        <div className={"text-center " + (this.state.currentChapter >= this.state.totalChapter ? 'd-none' : '')}>
                            <button className="btn btn-radius mb-1" onClick={(e) => this.loadMore()}>See more</button>
                        </div>
                    </div>

                </div>

            </div>
        );
    }
}

export default Chapters;
