import React from "react";
import Header from "./Header";

import BaseSchoolPage from "../common/BaseSchoolPage";

import StudentPieChart from "../chart/StudentPieChart";
import GrowthLineChart from "../chart/GrowthLineChart";

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

import firebase from "../../firebase";
let db = firebase.firestore();

import swal from "sweetalert";
import ScoreBarChart from "../chart/ScoreBarChart";
import ScoreDoughnutChart from "../chart/ScoreDoughnutChart";

var moment = require('moment');
const CollectionConfig = require('../../config/collection.json');

class School extends BaseSchoolPage {
    constructor(props) {
        super(props);

        this.state = {
            organization: null,
            topUserChapter: [],
            lowScoreChapter: [],
            students: [],
            chapters: {},
            demographics: {labels: [], data: []},
            scoreRange: {labels: [], data: []},
            scoreXBar: {labels: [], data: []},
            courseCompletionGrowth: {labels: [], data: []},
            totalStudent: 0
        }

    }

    componentWillUpdate(nextProps, nextState) {

        var self = this;
        if (this.state.organization == null && nextState.user) {

            var organizationId = nextState.user.organizationId;
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        self.setState({
                            'organization':  doc.data(),
                        })

                    }
                })

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.STUDENT)
                .where("isDelete", "==", false)
                .get()
                .then((querySnapshot) => {
                    this.setState({
                        totalStudent: querySnapshot.size,
                    })
                });

            //
            // db.collection(CollectionConfig.ORGANIZATION)
            //     .doc(organizationId)
            //     .collection(CollectionConfig.STAT)
            //     .get()
            //     .then((querySnapshot) => {
            //         let stat = [];
            //         querySnapshot.forEach((doc) => {
            //             var item = {
            //                 id: doc.id,
            //                 totalUser: doc.data().totalUser,
            //                 totalInteraction: doc.data().totalInteraction,
            //                 totalCompletion: doc.data().totalCompletion,
            //                 created: doc.data().created,
            //             };
            //             stat.push(item);
            //         });
            //
            //         this.setState({
            //             stat: stat
            //         })
            //     });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.STUDENT)
                .where("isDelete", "==", false)
                .orderBy("totalScore", "desc").limit(5)
                .get()
                .then((querySnapshot) => {
                    let students = [];
                    querySnapshot.forEach((doc) => {
                        var item = {
                            id: doc.id,
                            firstName: doc.data().firstName,
                            lastName: doc.data().lastName,
                            level: doc.data().level,
                            room: doc.data().room,
                            department: doc.data().department,
                            studentId: doc.data().studentId,
                            avatarUrl: doc.data().avatarUrl,
                            totalScore: doc.data().totalScore,
                            isDelete: doc.data().isDelete
                        };
                        students.push(item);
                    });

                    this.setState({
                        students: students
                    })
                });

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .orderBy("totalUser", "desc").limit(5)
                .get()
                .then((querySnapshot) => {
                    let chapters = [];
                    querySnapshot.forEach((doc) => {
                        var item = {
                            id: doc.id,
                            chapterCode: doc.id,
                            stat: doc.data().stat,
                            totalUser: doc.data().totalUser,
                            avgScore: doc.data().avgScore,
                        };

                        chapters.push(item);

                        let chapterId = doc.id;
                        db.collection(CollectionConfig.CHAPTER)
                            .doc(chapterId)
                            .get()
                            .then((doc) => {

                                let chapters =  self.state.chapters;

                                chapters[doc.data().chapterCode] = {
                                    id: doc.id,
                                    subjectId: doc.data().subjectId,
                                    subjectName: doc.data().subjectName || doc.data().subjectId,
                                    chapterCode: doc.data().chapterCode,
                                    chapterName: doc.data().chapterName,
                                    chapterLevel: doc.data().chapterLevel,
                                    chapterScore: doc.data().chapterScore,
                                    chapterQuiz: doc.data().chapterQuiz,
                                    chapterObjective: doc.data().chapterObjective,
                                    chapterAssessment: doc.data().chapterAssessment,
                                    chapterCoverUrl: doc.data().chapterCoverUrl,
                                    totalChallenge: doc.data().totalChallenge,
                                    isDelete: doc.data().isDelete
                                };

                                this.setState({
                                    chapters: chapters
                                })
                            });

                    });

                    this.setState({
                        topUserChapter: chapters
                    })
                });

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.CHAPTER)
                .orderBy("avgScore").limit(5)
                .get()
                .then((querySnapshot) => {
                    let chapters = [];
                    querySnapshot.forEach((doc) => {
                        var item = {
                            id: doc.id,
                            chapterCode: doc.id,
                            stat: doc.data().stat,
                            totalUser: doc.data().totalUser,
                            avgScore: doc.data().avgScore,
                        };

                        chapters.push(item);

                        let chapterId = doc.id;
                        db.collection(CollectionConfig.CHAPTER)
                            .doc(chapterId)
                            .get()
                            .then((doc) => {

                                let chapters =  self.state.chapters;

                                chapters[doc.data().chapterCode] = {
                                    id: doc.id,
                                    subjectId: doc.data().subjectId,
                                    subjectName: doc.data().subjectName || doc.data().subjectId,
                                    chapterCode: doc.data().chapterCode,
                                    chapterName: doc.data().chapterName,
                                    chapterLevel: doc.data().chapterLevel,
                                    chapterScore: doc.data().chapterScore,
                                    chapterQuiz: doc.data().chapterQuiz,
                                    chapterObjective: doc.data().chapterObjective,
                                    chapterAssessment: doc.data().chapterAssessment,
                                    chapterCoverUrl: doc.data().chapterCoverUrl,
                                    totalChallenge: doc.data().totalChallenge,
                                    isDelete: doc.data().isDelete
                                };

                                this.setState({
                                    chapters: chapters
                                })
                            });
                    });

                    this.setState({
                        lowScoreChapter: chapters
                    })
                });


            // db.collection(CollectionConfig.ORGANIZATION)
            //     .doc(organizationId)
            //     .collection(CollectionConfig.ORGANIZATION_STAT)
            //     .doc('demographics')
            //     .get()
            //     .then((doc) => {
            //
            //         if (typeof(doc.data().values) !== 'undefined') {
            //             var item = {
            //                 labels: Object.keys(doc.data().values),
            //                 data: Object.values(doc.data().values),
            //             };
            //
            //             this.setState({
            //                 demographics: item
            //             })
            //         }
            //
            //     });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.STUDENT)
                .where('isDelete', '==', false)
                .get()
                .then((querySnapshot) => {


                    var data = {}
                    querySnapshot.forEach((doc) => {
                        let key = doc.data().totalScore+"";
                        if (key == 'undefined') { key = 0; }

                        if (typeof(data[key]) == "undefined") {
                            data[key] = 1
                        } else {
                            data[key] += 1
                        }
                    });

                    var labels = [];
                    var scoreData = [];
                    Object.keys(data).forEach(function (key) {
                        labels.push(key);
                        scoreData.push(data[key]);
                    });

                    this.setState({
                        scoreRange: {labels: labels, data: scoreData}
                    })

                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.DEPARTMENT)
                .get()
                .then((querySnapshot) => {


                    var labels = [];
                    var scoreData = [];

                    querySnapshot.forEach((doc) => {
                        labels.push(doc.id);
                        scoreData.push(doc.data().totalUser)

                    });

                    this.setState({
                        demographics: {labels: labels, data: scoreData}
                    })

                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.ORGANIZATION_STAT)
                .doc('scoreXBar')
                .get()
                .then((doc) => {
                    console.log('doc', doc.exists)

                    if (typeof(doc.data().values) !== 'undefined') {
                        var item = {
                            labels: Object.keys(doc.data().values),
                            data: Object.values(doc.data().values),
                        };

                        this.setState({
                            scoreXBar: item
                        })
                    }

                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.ORGANIZATION_STAT)
                .doc('courseCompletionGrowth')
                .collection(CollectionConfig.DATA)
                .orderBy('created')
                .get()
                .then((querySnapshot) => {
                    let data = [];
                    let labels = [];

                    let sum = 0;

                    querySnapshot.forEach((doc) => {
                        sum += doc.data().totalCompletion;
                        data.push(sum);
                        labels.push(moment(doc.data().created).format("DD/MM/YYYY"));
                    });

                    self.setState({
                        courseCompletionGrowth: {labels: labels, data: data}
                    })
                });



        }



    }

    render() {
        if (this.state.user == null || typeof(this.state.user) === "undefined") {
            return  super.render()
        }

        var  isUser = this.state != null && typeof(this.state) !== "undefined"
            && this.state.user != null && typeof(this.state.user) !== "undefined";

        var  isOrganization = this.state != null && typeof(this.state) !== "undefined"
            && this.state.organization != null && typeof(this.state.organization) !== "undefined";

        var  isStudent = this.state != null && typeof(this.state) !== "undefined"
            && this.state.students != null && typeof(this.state.students) !== "undefined";

        var  isChapter = this.state != null && typeof(this.state) !== "undefined"
            && this.state.chapters != null && typeof(this.state.chapters) !== "undefined";

        return (

            <div className="bg-light mh-100vh">
                <Header user={this.state.user} organization={this.state.organization} />
                <div> { isUser && isOrganization?
                    <div className="container pb-5">
                        <h2>School Dashboard</h2>
                        <div className="row">
                            <div className="col-lg-4">
                                <div className="card shadow-none mb-3">
                                    <div className="card-body ic-right ic-team">
                                        <div className="display-2">{ this.state.totalStudent}</div>
                                        <div>Total Users</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="card shadow-none mb-3">
                                    <div className="card-body ic-right ic-message">
                                        <div className="display-2">{ this.state.organization.stat.totalInteraction}</div>
                                        <div>Total Interactions</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4">
                                <div className="card shadow-none mb-3">
                                    <div className="card-body ic-right ic-complete">
                                        <div className="display-2">{ this.state.organization.stat.totalCompletion}</div>
                                        <div>Total Completions</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 d-none">
                                <div className="card shadow-none mb-3">
                                    <div className="card-body ic-right ic-coin">
                                        <div className="display-2">{ this.state.organization.organizationCredit}</div>
                                        <div>Credits Available</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card shadow-none mb-3">
                            <div className="card-body">
                                <h3 className="card-title ic-diamond d-flex align-items-center">Course Completion Growth</h3>
                                <div className="">
                                    <GrowthLineChart data={this.state.courseCompletionGrowth}/>
                                </div>
                                {/* Graph */}
                                <div className="_remark mt-3">เปิดใช้งานครั้งแรก <strong>{ typeof(this.state.organization.stat) === 'undefined' || typeof(this.state.organization.stat.created) === 'undefined'? '-':
                                    moment(this.state.organization.stat.created).format("DD MMMM YYYY") }</strong></div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-6 d-flex">
                                <div className="card shadow-none mb-3 flex-fill">
                                    <div className="card-body">
                                        <h3 className="card-title ic-diamond d-flex align-items-center">Demographics</h3>
                                        <div className="">
                                            {/*<img className="w-100" src="/static/images/mockup/img-piegraph.png" alt="sample"  />*/}
                                            <StudentPieChart data={this.state.demographics}/>
                                        </div>
                                        {/* Graph */}
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 d-flex">
                                <div className="card shadow-none mb-3 flex-fill">
                                    <div className="card-body">
                                        <h3 className="card-title ic-team d-flex align-items-center mb-0">
                                         Top 5<br />Best Performing Users</h3>
                                         <span className="ml-5">(with highest score)</span>
                                        <div className="mt-3">
                                            <ol className="order-list">
                                                {
                                                    isStudent?
                                                        this.state.students.map((student, i) =>
                                                        <li>
                                                            <Link to={`/user/${student.id}/detail`}>
                                                                <img className="rounded mr-2" width="35px"
                                                                     src="/static/images/default-user.png"
                                                                     src={typeof(student.avatarUrl) === 'undefined' || student.avatarUrl.indexOf('https') === -1 ? "/static/images/default-user.png": student.avatarUrl}
                                                                     alt={ student.firstName } />
                                                                <strong>{student.firstName} {student.lastName}</strong>
                                                            </Link>
                                                            <span className="float-right">{student.totalScore} scores</span>
                                                        </li>): <li></li>
                                                }
                                            </ol>

                                            {
                                                this.state.students.length == 0? <div className="text-center" style={{'padding-bottom': '20px'}}>ยังไม่มีข้อมูล</div>:<span></span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-6 d-flex">
                                <div className="card shadow-none mb-3 flex-fill">
                                    <div className="card-body">
                                        <h3 className="card-title ic-diamond d-flex align-items-center">Score Range</h3>
                                        <div className="">
                                            <ScoreBarChart  data={this.state.scoreRange}/>
                                        </div>
                                        {/* Graph */}
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 d-flex">
                                <div className="card shadow-none mb-3 flex-fill">
                                    <div className="card-body">
                                        <h3 className="card-title ic-game d-flex align-items-center mb-0">
                                         Top 5<br />Most Completed Chapters</h3>
                                         <span className="ml-5">(with highest number of users)</span>
                                        <div className="mt-3">
                                            <ol className="order-list">
                                                {
                                                    isChapter?
                                                        this.state.topUserChapter.map((chapter, i) =>
                                                            <li>
                                                                <Link to={`/chapter/${chapter.id}/detail`}>
                                                                    <img className="rounded mr-2" width="35px"
                                                                        src={typeof(this.state.chapters[chapter.id]) === 'undefined' || typeof(this.state.chapters[chapter.id].chapterCoverUrl) === 'undefined' || this.state.chapters[chapter.id].chapterCoverUrl.indexOf('https') === -1 ? "/static/images/default-chapter.png": this.state.chapters[chapter.id].chapterCoverUrl}/>
                                                                    {typeof(this.state.chapters[chapter.id]) !== 'undefined'? <strong>{this.state.chapters[chapter.id].chapterName}</strong>:<strong></strong>}
                                                                </Link>
                                                                <span className="float-right">{chapter.totalUser} user</span>

                                                            </li>): <li></li>
                                                }
                                            </ol>

                                            {
                                                this.state.topUserChapter.length == 0? <div className="text-center" style={{'padding-bottom': '20px'}}>ยังไม่มีข้อมูล</div>:<span></span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-lg-6 d-flex">
                                <div className="card shadow-none mb-3 flex-fill">
                                    <div className="card-body">
                                        <h3 className="card-title ic-team d-flex align-items-center">Score  X Bar</h3>
                                        <div className="">
                                            <ScoreDoughnutChart data={this.state.scoreXBar}/>
                                        </div>
                                        {/* Graph */}
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 d-flex">
                                <div className="card shadow-none mb-3 flex-fill">
                                    <div className="card-body">
                                        <h3 className="card-title ic-game d-flex align-items-center mb-0">
                                         Top 5<br />Most Difficult Chapters</h3>
                                         <span className="ml-5">(with lowest average scores)</span>
                                        <div className="mt-3">
                                            <ol className="order-list">
                                                {
                                                    isChapter?
                                                        this.state.lowScoreChapter.map((chapter, i) =>
                                                            <li>
                                                                <Link to={`/chapter/${chapter.id}/detail`}>
                                                                    {chapter.chapterCoverUrl}
                                                                    <img className="rounded mr-2" width="35px"
                                                                        src={typeof(this.state.chapters[chapter.id]) === 'undefined' || typeof(this.state.chapters[chapter.id].chapterCoverUrl) === 'undefined' || this.state.chapters[chapter.id].chapterCoverUrl.indexOf('https') === -1? "/static/images/default-chapter.png": this.state.chapters[chapter.id].chapterCoverUrl}/>
                                                                    {typeof(this.state.chapters[chapter.id]) !== 'undefined'? <strong>{this.state.chapters[chapter.id].chapterName}</strong>:<strong></strong>}
                                                                </Link>
                                                                <span className="float-right">{chapter.avgScore.toFixed(2)} scores</span>
                                                            </li>): <li></li>
                                                }
                                            </ol>
                                            {
                                                this.state.lowScoreChapter.length == 0? <div className="text-center" style={{'padding-bottom': '20px'}}>ยังไม่มีข้อมูล</div>:<span></span>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div> : <div></div>}

                </div>

            </div>
        );
    }
}

export default School;