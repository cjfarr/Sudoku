import { Component, Input, OnInit } from '@angular/core';

@Component(
{
    selector: 'progress-pie',
    templateUrl: './progress-pie.component.html',
    styleUrls: ['./progress-pie.component.css']
})

export class ProgressPieComponent implements OnInit 
{
    @Input() ViewBoxSize: number;
    @Input() Radius: number;
    @Input() Progress: number;
    @Input() Color: string;

    Circumference: number;

    constructor() 
    {
    }

    ngOnInit(): void 
    {
        this.Circumference = 2 * Math.PI * this.Radius;
    }

    public GetProgressCircumference() : number
    {
        return this.Circumference * this.Progress;
    }
}
