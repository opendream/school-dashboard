import React from "react";


import {Line} from 'react-chartjs-2';
import BeatLoader from 'react-spinners/BeatLoader';

class ScoreGrowthLineChart extends React.Component {
    constructor(props) {
        super(props);

        const data = {
            labels: [],
            datasets: [
                {
                    label: 'Dataset',
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: '#607AD3',
                    borderColor: '#607AD3',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#616161',
                    pointBackgroundColor: '#616161',
                    pointBorderWidth: 2,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#616161',
                    pointHoverBorderColor: '#616161',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                    data: []
                }
            ]
        };

        const legendOpts = {
            display: true
        };

        const options = {
            responsive: true,
            scales: {
                yAxes: [
                    {
                        ticks: {
                            min: 0,
                        }
                    }
                ],
            }
        };

        this.state = {
            isLoading: true,
            isShow: false,
            data: data,
            legend: legendOpts,
            options: options
        }
    }


    componentDidUpdate() {
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


        var data =  {
            labels: this.props.data.labels,
            datasets: [
                {
                    label: 'Score',
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: '#607AD3',
                    borderColor: '#607AD3',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: '#616161',
                    pointBackgroundColor: '#616161',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: '#616161',
                    pointHoverBorderColor: '#616161',
                    pointHoverBorderWidth: 2,
                    pointRadius: 5,
                    pointHitRadius: 10,
                    data: this.props.data.data
                }
            ]
        };

        console.log(data);

        this.setState({
            data: data,
            isLoading: false,
            isUpdate: true,
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
                    </div> : <div>{this.state.isShow ? <Line data={this.state.data} height={100} legend={this.state.legend} options={this.state.options}/> :<div>ยังไม่มีข้อมูล</div>}</div>
                }
            </div>
        );
    }
}

export default ScoreGrowthLineChart;