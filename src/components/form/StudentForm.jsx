import React from "react";


class StudentForm extends React.Component {
    constructor(props) {
        super(props);

        let newChapter = this.props.newChapter;

        this.state = {
            newChapter: newChapter,
            errors: '',
        }
    }

    componentWillReceiveProps(props) {
        let newStudent = props.newStudent;
        console.log(newStudent);

        this.state = {
            'newStudent': newStudent,
            'newStudent.firstName': newStudent.firstName || "",
            'newStudent.studentId': newStudent.studentId || "",
            'newStudent.department': newStudent.department || "",
            'newStudent.level': newStudent.level || "",
            'newStudent.room': newStudent.room || "",
            'newStudent.subjectId': newStudent.subjectId || "",
            'errors': '',
        }
    }

    onChange(e) {
        const { name, value } = e.target;

        this.setState({
            [name]: value
        })
    }

    onSubmitStudent(e) {
        e.preventDefault()


        let student = {
            firstName: this.state['newStudent.firstName'],
            studentId: this.state['newStudent.studentId'],
            department: this.state['newStudent.department'],
            level: this.state['newStudent.level'],
            room: this.state['newStudent.room'],
            status: this.state['newStudent.status'] || 'active',
            isDelete: false
        };

        var errors = [];

        if (typeof(student.firstName) === 'undefined' || student.firstName === '') {
            errors.push('name is required.')
        }

        if (typeof(student.studentId) === 'undefined' || student.studentId === '') {
            errors.push('studentId is required.')
        }

        if (typeof(student.department) === 'undefined' || student.department === '') {
            errors.push('department is required.')
        }

        if (typeof(student.level) === 'undefined' || student.level === '') {
            errors.push('level is required.')
        }

        if (typeof(student.room) === 'undefined' || student.room === '') {
            errors.push('room is required.')
        }

        if (typeof(student.status) === 'undefined' || student.status === '') {
            errors.push('room is required.')
        }


        if (errors.length > 0) {
            this.setState({
                'errors': errors,

            });
            return true;
        }


        this.props.onSubmitStudent(e, student);
        return true
    }


    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        { this.state.errors.length > 0?  <ul className="alert alert-warning">
                            {this.state.errors.map((error, i) => <li>{ error }</li>)}
                        </ul>: <ul></ul>}
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="">Student Name</label>
                            <input type="text" className="form-control" id="" value={this.state['newStudent.firstName']} name="newStudent.firstName" onChange={(e) =>this.onChange(e)} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="">Student ID</label>
                            <input type="text" className="form-control" id="" value={this.state['newStudent.studentId']} name="newStudent.studentId" onChange={(e) =>this.onChange(e)}/>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="">Department</label>
                            <input type="text" className="form-control" id="" value={this.state['newStudent.department']} name="newStudent.department" onChange={(e) =>this.onChange(e)} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="">Level</label>
                            <input type="number" className="form-control" id="" value={this.state['newStudent.level']} name="newStudent.level" onChange={(e) =>this.onChange(e)} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="">Room</label>
                            <input type="number" className="form-control" id="" value={this.state['newStudent.room']} name="newStudent.room" onChange={(e) =>this.onChange(e)} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="">Status</label>
                            <select className="form-control" id="selectStatus" value={this.state['newStudent.status']} name="newStudent.status" onChange={(e) =>this.onChange(e)} >
                                <option value="active">กำลังเรียนอยู่</option>
                                <option value="inactive">จบแล้ว</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary"  onClick={(e) => this.onSubmitStudent(e)} >บันทึก</button>
            </div>
        );
    }
}

export default StudentForm;
