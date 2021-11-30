import { Component, OnInit } from '@angular/core';
import { DifficultyType } from '../Constants/Enums';
import { SudokuService } from '../Services/Sudoku.service';

@Component(
{
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.css']
})

export class BoardComponent implements OnInit 
{
    Regions: number[];

    constructor(private sudokuService: SudokuService)
    { 
    }

    ngOnInit(): void 
    {
        ////create an empty board while user picks the game type
        this.sudokuService.GenerateBoard(DifficultyType.Empty);

        this.Regions = new Array();
        for (let index = 1; index <= this.sudokuService.BoardSize; index++)
        {
            this.Regions.push(index);
        }
    }
}
