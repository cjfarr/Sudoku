import { Component, Input, OnInit } from '@angular/core';
import { SudokuService } from '../Services/Sudoku.service';

@Component(
{
    selector: 'app-region',
    templateUrl: './region.component.html',
    styleUrls: ['./region.component.css']
})

export class RegionComponent implements OnInit 
{
    @Input("Id") Id: number;
    public Cells: number[];

    constructor(private sudokuService: SudokuService) 
    {
        this.Cells = new Array();
    }

    ngOnInit(): void 
    {
        //need to figure this out by row with the entire board
        for (let index of this.sudokuService.GetCellIndexesByRegion(this.Id))
        {
            this.Cells.push(index);
        }
    }
}
