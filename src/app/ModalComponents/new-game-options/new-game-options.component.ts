import { Component, OnInit } from '@angular/core';
import { SudokuService } from 'src/app/Services/Sudoku.service';
import { DifficultyType } from 'src/app/Constants/Enums';

@Component(
{
    selector: 'new-game-options',
    templateUrl: './new-game-options.component.html',
    styleUrls: ['./new-game-options.component.css']
})

export class NewGameOptionsComponent implements OnInit 
{
    RequestedDifficulty: DifficultyType;

    constructor(private sudokuService: SudokuService) 
    {
        this.RequestedDifficulty = DifficultyType.Easy;
    }

    ngOnInit(): void 
    {
        this.sudokuService.IsUsingAutoNotes = false;
    }

    OnDifficultyChanged(difficultyType: string) : void
    {
        try
        {
            this.RequestedDifficulty = DifficultyType[difficultyType];
        }
        catch
        {
            this.RequestedDifficulty = DifficultyType.Easy;
        }
    }

    OnAutoNotesChanged(useAutoNotes: any) : void
    {
        console.log("Auto Notes setting: " + useAutoNotes.target.checked.toString());

        this.sudokuService.IsUsingAutoNotes = useAutoNotes.target.checked;
    }

    OnStartNewGame() : void
    {
        this.sudokuService.GenerateBoard(this.RequestedDifficulty);
        this.sudokuService.PublishNewBoardChanges();
    }
}
