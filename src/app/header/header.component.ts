import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { SudokuContext } from '../Constants/Enums';
import { SudokuService } from '../Services/Sudoku.service';

@Component(
{
    selector: 'header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit 
{
    @Output() RestartGame: EventEmitter<void> = new EventEmitter<void>();

    constructor(private sudokuService: SudokuService) 
    {
    }

    ngOnInit(): void 
    {
    }

    OnRestartGame() : void
    {
        this.sudokuService.UpdateContext(SudokuContext.GameOver);
        this.RestartGame.emit(null);
    }
}
