import React from "react";


import {Line, Pie} from 'react-chartjs-2';
import BeatLoader from 'react-spinners/BeatLoader';

class StudentPieChart extends React.Component {
    constructor(props) {
        super(props);

        const data = {
            labels: [""],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#EEEEEE',
                    '#EEEEEE',
                    '#71C285',
                    '#F0C419',
                    '#F0785A',
                    '#556080',
                ],
                hoverBackgroundColor: [
                    '#EEEEEE',
                    '#EEEEEE',
                    '#71C285',
                    '#F0C419',
                    '#F0785A',
                    '#556080',
                ]
            }]
        };

        this.state = {
            data: data,
            isUpdate: false,
            isLoading: true,
            isShow: false
        }
    }

    componentDidUpdate() {
        var self = this;

        if (typeof(this.props.data.labels) == 'undefined'
            || this.props.data.labels.length == 0
            || this.state.isUpdate) {

            if (this.props.data.labels.length == 0 && this.state.isLoading) {
                this.setState({
                    isLoading: false,
                });
            }
            return;
        }

        var n = 200;

        var labels =  this.props.data.labels.slice(0, n);
        var data =  this.props.data.data.slice(0, n);

        let colors = [];
        for(var i = 0 ; i < n; i++) {
            colors[i] = [
                '#86E6D1',
                '#4E3E9F',
                '#71C285',
                '#F0C419',
                '#86E6D1',
                '#4E3E9F',
                '#71C285',
                '#F0C419',
                '#F0785A',
                '#556080',
            ][i % 10];
        }

        var data =  {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors,
                hoverBackgroundColor: colors
            }]
        };

        const legendOpts = {
            display: this.props.data.labels.length < 10
        };

        this.setState({
            data: data,
            legend: legendOpts,
            isUpdate: true,
            isLoading: false,
            isShow: this.props.data.data.length > 0
        });

    }

    render() {
        return (
            <div className=" align-items-center">
                {
                    this.state.isLoading ?
                        <div className="text-center" style={{'margin': '150px'}}>
                            <BeatLoader
                                sizeUnit={"px"}
                                size={30}
                                color={'#6c6c6d'}
                                loading={this.state.loading}
                            />
                        </div> : <div>{this.state.isShow ? <Pie data={this.state.data} legend={this.state.legend} /> :<div>ยังไม่มีข้อมูล</div>}</div>
                }

            </div>
        );
    }
}

export default StudentPieChart;