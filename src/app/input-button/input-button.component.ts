import { Component, Input, OnInit } from '@angular/core';
import { SudokuService } from '../Services/Sudoku.service';
import { SudokuContext } from '../Constants/Enums';
import { Subscription } from 'rxjs';

@Component(
{
    selector: 'input-button',
    templateUrl: './input-button.component.html',
    styleUrls: ['./input-button.component.css']
})

export class InputButtonComponent implements OnInit 
{
    @Input("InputNumber") InputNumber: number;

    MissingCount: number;

    private newBoardChangesSubscription: Subscription;
    private inputGivenSubscription: Subscription;

    constructor(private sudokuService: SudokuService) 
    {
        this.MissingCount = 0;
    }

    ngOnInit(): void 
    {
        this.UpdateMissingCount();
        this.newBoardChangesSubscription = this.sudokuService.SubscribeToNewBoardChanges(this.UpdateMissingCount.bind(this));
        this.inputGivenSubscription = this.sudokuService.SubscribeToInputGivenEvent(((n) =>
        {
            this.UpdateMissingCount();
        }).bind(this));
    }

    OnInputClick()
    {
        this.sudokuService.GiveInput(this.InputNumber);
    }

    public GetCurrentContext() : SudokuContext
    {
        return this.sudokuService.GetCurrentContext();
    }

    private UpdateMissingCount() : void
    {
        if (this.sudokuService.GetCurrentContext() === SudokuContext.Input)
        {
            this.MissingCount = this.sudokuService.GetMissingCount(this.InputNumber);
        }
    }

    ngOnDestroy() : void
    {
        this.newBoardChangesSubscription.unsubscribe();
        this.inputGivenSubscription.unsubscribe();
    }
}
