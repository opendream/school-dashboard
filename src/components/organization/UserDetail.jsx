import React from "react";
import Header from "./Header";
import BaseSchoolPage from "../common/BaseSchoolPage";


import firebase from "../../firebase";

let db = firebase.firestore();

import swal from "sweetalert";
import ScoreGrowthLineChart from "../chart/ScoreGrowthLineChart";

var ReactRouter = require('react-router');
var Link = ReactRouter.Link;

var moment = require('moment');

const CollectionConfig = require('../../config/collection.json');

class UserDetail extends BaseSchoolPage {
    constructor(props) {
        super(props);

        let userId = this.props.params.userId;
        console.log('userId', userId);

        this.state = {
            organization: null,
            userId: userId,
            student: {
                stat: {}
            },
            chapters: {},
            currentQuiz: {},
            scoreGrowth: {labels: [], data: []}
        }

    }

    componentWillUpdate(nextProps, nextState) {


        var self = this;


        if (this.state.organization == null && nextState.user) {


            $('.accordian-body').on('show.bs.collapse', function () {
                $(this).closest("table")
                    .find(".collapse.in")
                    .not(this)
                    .collapse('toggle')
            })


            var organizationId = nextState.user.organizationId;
            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        self.setState({
                            'organization': doc.data(),
                        })

                    }
                })


            let userId = this.state.userId;

            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.STUDENT)
                .doc(userId)
                .get()
                .then((doc) => {
                    if (doc.exists) {
                        let student = {
                            id: doc.id,
                            firstName: doc.data().firstName,
                            lastName: doc.data().lastName,
                            level: doc.data().level,
                            room: doc.data().room,
                            department: doc.data().department,
                            status: doc.data().status,
                            studentId: doc.data().studentId,
                            stat: doc.data().stat,
                            avatarUrl: doc.data().avatarUrl,
                            isDelete: doc.data().isDelete,
                            totalScore: doc.data().totalScore,
                            dateJoined: doc.data().dateJoined,
                            topChapter: doc.data().topChapter,
                        };

                        this.setState({
                            student: student
                        });


                        if (typeof(student.stat) !== "undefined" && typeof(student.stat.ranking) !== "undefined") {


                            db.collection(CollectionConfig.ORGANIZATION).doc(organizationId)
                                .collection(CollectionConfig.STUDENT)
                                .where('totalScore', '>', student.totalScore).get().then((querySnapshot) => {

                                var ranking = querySnapshot.size + 1;

                                if (ranking !== student.ranking) {
                                    db.collection(CollectionConfig.ORGANIZATION).doc(organizationId)
                                        .collection(CollectionConfig.STUDENT).doc(student.id)
                                        .update({
                                            ranking: ranking,
                                            'stat.ranking': ranking,
                                        }).then(function () {
                                    });

                                    student['stat']['ranking'] = ranking;

                                    self.setState({
                                        student: student
                                    });
                                }


                            });
                        }

                    }
                });


            db.collection(CollectionConfig.ORGANIZATION)
                .doc(organizationId)
                .collection(CollectionConfig.STUDENT)
                .doc(userId)
                .collection(CollectionConfig.CHAPTER)
                .get()
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        let chapterId = doc.id;

                        let chapter = {
                            id: doc.id,
                            challenges: {},
                        };

                        let chapters = self.state.chapters;
                        chapters[doc.id] = (chapter);

                        db.collection(CollectionConfig.CHAPTER)
                            .doc(chapterId)
                            .get()
                            .then((doc) => {

                                let chapters = self.state.chapters;
                                chapter  = chapters[chapterId];

                                chapter['subjectId'] = doc.data().subjectId;
                                chapter['subjectName'] = doc.data().subjectName || doc.data().subjectId;
                                chapter['chapterCode'] = doc.data().chapterCode;
                                chapter['chapterName'] = doc.data().chapterName;
                                chapter['chapterScore'] = doc.data().chapterScore;
                                chapter['chapterQuiz'] = doc.data().chapterQuiz;
                                chapter['chapterObjective'] = doc.data().chapterObjective;
                                chapter['chapterAssessment'] = doc.data().chapterAssessment;
                                chapter['totalChallenge'] = doc.data().totalChallenge;
                                chapter['isDelete'] = doc.data().isDelete;
                                chapter['chapterCoverUrl'] = doc.data().chapterCoverUrl;
                                chapter['challenges'] = {};

                                self.setState({
                                    chapters: chapters
                                })

                            });


                        db.collection(CollectionConfig.ORGANIZATION)
                            .doc(organizationId)
                            .collection(CollectionConfig.STUDENT)
                            .doc(userId)
                            .collection(CollectionConfig.CHAPTER)
                            .doc(chapterId)
                            .collection(CollectionConfig.CHALLENGE)
                            .get()
                            .then((querySnapshot) => {

                                let challenges = {};

                                querySnapshot.forEach((doc) => {
                                    var challengeId = doc.id;

                                    var stat = doc.data().stat;
                                    var totalScore = doc.data().totalScore;

                                    challenges[doc.id] = {
                                        stat: doc.data().stat,
                                        quiz: [],
                                        totalScore: totalScore
                                    };

                                    db.collection(CollectionConfig.CHAPTER)
                                        .doc(chapterId)
                                        .collection(CollectionConfig.CHALLENGE)
                                        .doc(challengeId)
                                        .get()
                                        .then((doc) => {
                                            let chapters = self.state.chapters;
                                            let challenges = chapters[chapterId]['challenges'];

                                            challenges[doc.id] = {
                                                id: doc.id,
                                                chapterId: doc.data().chapterId,
                                                subjectId: doc.data().subjectId,
                                                challengeCode: doc.data().challengeCode,
                                                challengeName: doc.data().challengeName,
                                                challengeLevel: doc.data().challengeLevel,
                                                challengeScore: doc.data().challengeScore,
                                                challengeQuiz: doc.data().challengeQuiz,
                                                challengeObjective: doc.data().challengeObjective,
                                                challengeAssessment: doc.data().challengeAssessment,
                                                challengeCoverUrl: doc.data().challengeCoverUrl,
                                                isDelete: doc.data().isDelete,
                                                stat: stat,
                                                totalScore: totalScore
                                            };

                                            console.log('stat', stat)

                                            self.setState({
                                                chapters: chapters
                                            })





                                        });


                                    let chapters = self.state.chapters;
                                    chapter  = chapters[chapterId];

                                    chapter['challenges'] = challenges;

                                    db.collection(CollectionConfig.ORGANIZATION)
                                        .doc(organizationId)
                                        .collection(CollectionConfig.STUDENT)
                                        .doc(userId)
                                        .collection(CollectionConfig.CHAPTER)
                                        .doc(chapterId)
                                        .collection(CollectionConfig.CHALLENGE)
                                        .doc(challengeId)
                                        .collection(CollectionConfig.QUIZ)
                                        .get()
                                        .then((querySnapshot) => {

                                            var quiz = []
                                            querySnapshot.forEach((doc) => {
                                                var item = {
                                                    correctChoice: doc.data().correctChoice,
                                                    latestChoice: doc.data().latestChoice,
                                                    correctChoiceName: doc.data().correctChoiceName,
                                                    latestChoiceName: doc.data().latestChoiceName,
                                                    question: doc.data().question,
                                                    totalScore: doc.data().totalScore,
                                                };

                                                quiz.push(item)
                                            })
                                            let chapters = self.state.chapters;
                                            let challenges = chapters[chapterId]['challenges'];
                                            challenges[challengeId]['quiz'] = quiz;

                                            self.setState({
                                                chapters: chapters
                                            })


                                        });


                                    self.setState({
                                        chapters: chapters
                                    })


                                });

                            });


                        self.setState({
                            chapters: chapters
                        })



                    });

                });


            db.collection(CollectionConfig.ORGANIZATION).doc(organizationId)
                .collection(CollectionConfig.ORGANIZATION_STAT)
                .doc('studentScoreGrowth')
                .collection(CollectionConfig.DATA)
                .where('studentId', '==',userId)
                .orderBy('created')
                .get()
                .then((querySnapshot) => {
                    let data = [];
                    let labels = [];

                    querySnapshot.forEach((doc) => {
                        data.push(doc.data().totalScore);
                        labels.push(moment(doc.data().created).format("MMM Do YY"));
                    });


                    self.setState({
                        scoreGrowth: {labels: labels, data: data}
                    })

                });

            // db.collection(CollectionConfig.ORGANIZATION)
            //     .doc(organizationId)
            //     .collection(CollectionConfig.STUDENT)
            //     .doc(userId)
            //     .collection(CollectionConfig.STUDENT_STAT)
            //     .doc('scoreGrowth')
            //     .collection(CollectionConfig.DATA)
            //     .orderBy('created')
            //     .get()
            //     .then((querySnapshot) => {
            //         let data = [];
            //         let labels = [];
            //
            //         var maxScore = 0;
            //         querySnapshot.forEach((doc) => {
            //             if (doc.data().totalScore> maxScore)
            //                 maxScore = doc.data().totalScore;
            //
            //             data.push(maxScore);
            //             labels.push(moment(doc.data().created).format("MMM Do YY"));
            //         });
            //
            //
            //         self.setState({
            //             scoreGrowth: {labels: labels, data: data}
            //         })
            //     });


        }

    }

    renderCurrentQuiz(quiz) {

        this.setState({
            currentQuiz: quiz
        })
    }

    render() {
        if (this.state.user == null || typeof(this.state.user) === "undefined") {
            return  super.render()
        }

        var isStudent = this.state != null && typeof (this.state) !== "undefined"
            && this.state.student != null && typeof (this.state.student) !== "undefined";


        return (
            <div className="bg-light mh-100vh">
                <Header user={this.state.user} organization={this.state.organization} />
                {isStudent ?
                    (<div>
                            <div className="container">
                                <div className="row justify-content-between">
                                    <div className="col-lg-9">
                                        <nav aria-label="breadcrumb">
                                            <ol className="breadcrumb">
                                                <li className="breadcrumb-item"><Link to={`/user/`}>รวมนักเรียน ({this.state.organization !=null && typeof(this.state.organization.stat) != 'undefined' ? <span>{this.state.organization.stat.totalUser}</span>:<span></span>})</Link></li>
                                                <li className="breadcrumb-item"><Link to={`/user/?department=${this.state.student.department}`}>{this.state.student.department}</Link></li>
                                                <li className="breadcrumb-item"><Link to={`/user/?department=${this.state.student.department}&level=${this.state.student.level}`}>ม.{this.state.student.level}</Link></li>
                                                <li className="breadcrumb-item"><Link to={`/user/?department=${this.state.student.department}&level=${this.state.student.level}&room=${this.state.student.room}`}>ห้อง {this.state.student.room}</Link></li>
                                                <li className="breadcrumb-item active"
                                                    aria-current="page">{this.state.student.firstName} {this.state.student.lastName}</li>
                                            </ol>
                                        </nav>
                                    </div>
                                    <div className="col-lg-3">
                                        <div className="float-right">
                                            <Link to={`/user/${this.state.userId}/export/?file=xls`} target="_blank" className="btn btn-download btn-sm ic-export mr-2">
                                                XLS</Link>
                                            <Link to={`/user/${this.state.userId}/export/?file=csv`} target="_blank"  className="btn btn-download btn-sm ic-export">
                                                CSV</Link>
                                        </div>

                                    </div>
                                </div>
                            </div>
                            <div className="bg-white py-4 mb-3">
                                <div className="container">
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div className="row">
                                                <div className="col-lg-4">
                                                    <img className="img-cover"
                                                         width="150"
                                                         src="/static/images/default-user.png"
                                                         src={typeof(this.state.student.avatarUrl) === 'undefined' || this.state.student.avatarUrl.indexOf('https') === -1 ? "/static/images/default-user.png": this.state.student.avatarUrl}
                                                         alt={ this.state.student.firstName } />
                                                </div>
                                                <div className="col-lg-8">
                                                    <h3>{this.state.student.firstName} {this.state.student.lastName}</h3>
                                                    <div><strong>รหัสนักเรียน:</strong> {this.state.student.studentId}
                                                    </div>
                                                    <div><strong>สายการเรียน:</strong> {this.state.student.department}
                                                    </div>
                                                    <div><strong>ระดับชั้น:</strong> ม.{this.state.student.level}</div>
                                                    <div><strong>ห้อง:</strong> {this.state.student.room}</div>
                                                    <div><strong>สถานะ:</strong> { this.state.student.status === 'active'? 'กำลังศึกษาอยู่': 'จบแล้ว' }</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="row">
                                                <div className="col-lg-6">
                                                    <div className="icon-item icon-star">
                                                        <strong>คะแนนรวม</strong>
                                                        <span>{ typeof(this.state.student.stat)!== 'undefined'&& typeof(this.state.student.stat.totalScore)!== 'undefined'?
                                                            <span>{this.state.student.stat.totalScore}</span>:
                                                            <span>0</span>
                                                        } คะแนน </span>
                                                    </div>
                                                    <div className="icon-item icon-muscle">
                                                        <strong>บทที่เรียนจบ</strong>
                                                        <span>{ typeof(this.state.student.stat)!== 'undefined' && typeof(this.state.student.stat.totalComplete)!== 'undefined'?
                                                            <span>{this.state.student.stat.totalComplete}</span>:
                                                            <span>-</span>
                                                        } บท </span>
                                                    </div>
                                                    <div className="icon-item icon-rocket">
                                                        <strong>อันดับ (ระดับชั้น)</strong>
                                                        <span>{ typeof(this.state.student.stat)!== 'undefined'&& typeof(this.state.student.stat.ranking)!== 'undefined'?
                                                            <span>{this.state.student.stat.ranking}</span>:
                                                            <span>-</span>
                                                        } </span>
                                                    </div>
                                                </div>
                                                <div className="col-lg-6">
                                                    <div className="icon-item icon-start">
                                                        <strong>เข้าใช้งานครั้งแรก</strong>
                                                        <span>{moment(this.state.student.dateJoined).format("DD/MM/YYYY")}</span>
                                                    </div>
                                                    <div className="icon-item icon-top">
                                                        <strong>บทเรียนที่ได้คะแนนดีสุด</strong>
                                                        {typeof(this.state.student.topChapter) == 'undefined'? <span>-</span>:
                                                            <span>{this.state.student.topChapter.chapterName}<br/>
                                                            {this.state.student.topChapter.totalScore} / {this.state.student.topChapter.chapterScore} คะแนน</span>}
                                                    </div>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="container">
                                <div className="card shadow-none mb-5">
                                    <div className="card-body">
                                        <h3 className="card-title ic-diamond d-flex align-items-center">คะแนนรวมสะสม</h3>
                                        <div className="">
                                            <ScoreGrowthLineChart data={this.state.scoreGrowth}/>
                                        </div>
                                        {/* Graph */}
                                        {/* <div className="_remark mt-3">เปิดใช้งานครั้งแรก <strong>27 ธันวาคม 2019</strong></div> */}
                                    </div>
                                </div>

                                {
                                    Object.keys(this.state.chapters).map((key, i) =>
                                <div className="pb-5">
                                    <div className="row">
                                        <div className="col-lg-8">
                                            <div className="row">
                                                <div className="col-lg-2">
                                                    <img
                                                        className="img-fluid rounded"
                                                        src={typeof(this.state.chapters[key].chapterCoverUrl) === 'undefined' || this.state.chapters[key].chapterCoverUrl.indexOf('https') === -1 ? "/static/images/default-chapter.png": this.state.chapters[key].chapterCoverUrl}
                                                        alt={this.state.chapters[key].chapterName} />
                                                </div>
                                                <div className="col-lg-8">
                                                    <h3>{this.state.chapters[key].chapterName}</h3>
                                                    <div><strong>ระดับความรู้:</strong> {this.state.chapters[key].chapterLevel}</div>
                                                    <div>{this.state.chapters[key].chapterObjective}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {
                                        typeof (this.state.chapters[key]) == 'undefined' ||
                                        typeof (this.state.chapters[key].challenges) == 'undefined' ? <div></div> :
                                            <table className="table mt-0 mb-0 pb-2">
                                                <thead>
                                                <tr>
                                                    <th></th>
                                                    <th className="w-50"></th>
                                                    <th className="text-center">คะแนนเต็ม</th>
                                                    <th className="text-center">คะแนนที่ได้</th>
                                                    <th className="text-center">จำนวนครั้งที่เรียน</th>
                                                    <th className="text-center">เรียนจบเมื่อ</th>
                                                    <th style={{width: '6%'}}></th>
                                                </tr>
                                                </thead>
                                                <tbody>

                                                {
                                                    Object.keys(this.state.chapters[key].challenges).map((challengeKey, i) =>

                                                        [
                                                            <tr data-toggle="collapse" data-target="#chapter01"
                                                                className="accordion-toggle">
                                                                <td><img
                                                                    className="img-cover"
                                                                    src={typeof(this.state.chapters[key].challenges[challengeKey].challengeCoverUrl) === 'undefined' || this.state.chapters[key].challenges[challengeKey].challengeCoverUrl.indexOf('https') === -1 ? "/static/images/default-chapter.png": this.state.chapters[key].challenges[challengeKey].challengeCoverUrl}
                                                                    alt={this.state.chapters[key].challenges[challengeKey].challengeName} /></td>
                                                                <td>{this.state.chapters[key].challenges[challengeKey].challengeName}</td>
                                                                <td className="text-center">{this.state.chapters[key].challenges[challengeKey].challengeScore}</td>
                                                                <td className="text-center">{this.state.chapters[key].challenges[challengeKey].totalScore}</td>
                                                                <td className="text-center">{this.state.chapters[key].challenges[challengeKey].stat.totalRound}</td>
                                                                <td className="text-center">{moment(this.state.chapters[key].challenges[challengeKey].stat.latestAt).format("DD/MM/YYYY")}</td>
                                                                <td className="text-center"><i className="fa fa-2x"
                                                                                               aria-hidden="true"></i>
                                                                </td>
                                                            </tr>,
                                                            <tr>


                                                                <td colSpan="7" className="hiddenRow p-0">
                                                                    <div id="chapter01"
                                                                         className="accordian-body collapse">
                                                                        {typeof (this.state.chapters[key].challenges[challengeKey].quiz) == 'undefined' ?
                                                                            <table></table> :
                                                                            <table className="table table-active m-0">
                                                                                <tbody>
                                                                                {this.state.chapters[key].challenges[challengeKey].quiz.map((quiz, i) =>
                                                                                    <tr>
                                                                                        <td>{i + 1}</td>
                                                                                        <td className="w-50">{quiz.question}
                                                                                        </td>
                                                                                        <td colSpan="2"
                                                                                            className="text-primary text-right p-0"
                                                                                            style={{width: '13%'}}>
                                                                                            <strong>{quiz.totalScore}</strong></td>
                                                                                        <td colSpan="3"
                                                                                            className="float-right">
                                                                                            <a href="#"
                                                                                               className="btn btn-light ic-view mr-2"
                                                                                               data-toggle="modal"
                                                                                               data-target="#view-stat" onClick={(e) => this.renderCurrentQuiz(quiz)}>ข้อที่เลือก</a>
                                                                                            <a href="#"
                                                                                               className="btn btn-light ic-view"
                                                                                               data-toggle="modal"
                                                                                               data-target="#view-stat" onClick={(e) => this.renderCurrentQuiz(quiz)}>ข้อที่ถูก</a>

                                                                                        </td>
                                                                                    </tr>
                                                                                )}

                                                                                </tbody>
                                                                            </table>
                                                                        }
                                                                    </div>
                                                                </td>
                                                            </tr>

                                                        ]
                                                    )}

                                                </tbody>
                                            </table>
                                    }

                                </div>

                                    )
                                }

                                {
                                    typeof (this.state.currentQuiz) !== 'undefined'?
                                        <div className="modal fade" id="view-stat">
                                            <div className="modal-dialog modal-lg modal-dialog-centered">
                                                <div className="modal-content">
                                                    <div className="modal-header">
                                                        <h2 className="card-title text-primary mb-0">
                                                            {this.state.currentQuiz.question}</h2>
                                                        <button type="button" className="close" data-dismiss="modal">×
                                                        </button>
                                                    </div>
                                                    <div className="modal-body">
                                                        <div className="row justify-content-between">
                                                            <div className="col-lg-5">
                                                                <h3 className="text-success">Choice ที่ถูกต้อง</h3>
                                                                <p> {this.state.currentQuiz.correctChoiceName}</p>

                                                            </div>
                                                            <div className="col-lg-5">
                                                                <h3 className="text-gray">Choice ที่เลือก</h3>
                                                                <p> {this.state.currentQuiz.latestChoiceName}</p>
                                                            </div>

                                                        </div>


                                                    </div>
                                                </div>
                                            </div>
                                        </div>: <div></div>
                                }

                                </div>

                            </div>
                    ) : <div></div>
                }

            </div>
        );
    }
}

export default UserDetail;