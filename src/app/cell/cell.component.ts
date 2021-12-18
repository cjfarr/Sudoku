import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DifficultyType, SudokuContext } from '../Constants/Enums';
import { SudokuService } from '../Services/Sudoku.service';

@Component(
{
    selector: 'app-cell',
    templateUrl: './cell.component.html',
    styleUrls: ['./cell.component.css']
})

export class CellComponent implements OnInit, OnDestroy
{
    @Input("Id") Id: number;
    @Input("RegionId") RegionId: number;
  
    DisplayValue: string;
    IsSolved: boolean;
    InError: boolean;
    ShowError: boolean;
    Background: string;
    Foreground: string;
    Notes: string[];

    private solutionNumber: number;
    private isLocked: boolean;
    private isInSelectionMap: boolean;
    private selectedCellChangedSubscription: Subscription;
    private inputGivenSubscription: Subscription;
    private toggleErrorsSubscription: Subscription;
    private newBoardChangesSubscription: Subscription;

    constructor(private sudokuService: SudokuService) 
    {
        this.Background = "#FFFFFF";
        this.Foreground = "#000000";
        this.isLocked = false;
        this.IsSolved = true;
        this.InError = false;
        this.Notes = new Array(this.sudokuService.BoardSize);
    }

    ngOnInit(): void 
    {
        this.OnNewBoardChanged();

        this.selectedCellChangedSubscription = this.sudokuService.SubscribeToCellChangedEvent(this.OnSelectedCellChanged.bind(this));
        this.inputGivenSubscription = this.sudokuService.SubscribeToInputGivenEvent(this.OnInputGiven.bind(this));
        this.toggleErrorsSubscription = this.sudokuService.SubscribeToToggleErrors(this.OnToggleShowError.bind(this));
        this.newBoardChangesSubscription = this.sudokuService.SubscribeToNewBoardChanges(this.OnNewBoardChanged.bind(this));
    }

    OnClickEvent() : void
    {
        if (this.Id !== this.sudokuService.GetSelectedCell())
        {
            this.sudokuService.UpdateSelectedCell(this.Id, this.RegionId);
        }
    }

    private OnNewBoardChanged() : void
    {

        this.solutionNumber = this.sudokuService.GetSolutionCellValue(this.Id);
        if ((this.IsSolved = this.sudokuService.GetCurrentCellValue(this.Id) !== -1))
        {
            this.isLocked = true;
            this.DisplayValue = this.solutionNumber.toString();
        }
        else
        {
            this.isLocked = false;
            this.DisplayValue = "";
        }

        for (let index: number = 0; index < this.Notes.length; index++)
        {
            this.Notes[index] = "";
        }
        
        if (this.sudokuService.IsUsingAutoNotes && 
            !this.IsSolved && 
            this.sudokuService.GetCurrentDifficulty() !== DifficultyType.Empty)
        {
            ////auto assign notes
            let solvedMap: Map<number, boolean> = new Map<number, boolean>();
            for (let index = 1; index <= this.sudokuService.BoardSize; index++)
            {
                ////assume the note is missing until found
                solvedMap.set(index, false);
            }

            for (let columnId of this.sudokuService.GetAllColumnIndexes(this.Id))
            {
                this.CheckIfAnotherCellIsSolved(columnId, solvedMap);
            }

            for (let rowId of this.sudokuService.GetAllRowIndexes(this.Id))
            {
                this.CheckIfAnotherCellIsSolved(rowId, solvedMap);
            }

            for (let localCellId of this.sudokuService.GetCellIndexesByRegion(this.RegionId))
            {
                this.CheckIfAnotherCellIsSolved(localCellId, solvedMap);
            }

            for (let index = 0; index < this.sudokuService.BoardSize; index++)
            {  
                if (!solvedMap[index + 1])
                {
                    this.Notes[index] = (index + 1).toString();
                }
            }
        }
    }

    private CheckIfAnotherCellIsSolved(cellId: number, solvedMap: Map<number, boolean>) : void
    {
        let currentValue: number = this.sudokuService.GetCurrentCellValue(cellId);
        if (currentValue !== -1)
        {   
            let solutionValue: number = this.sudokuService.GetSolutionCellValue(cellId);
            solvedMap[solutionValue] = true;
        }
    }

    private OnSelectedCellChanged(map: number[]) : void
    {
        switch (map[this.Id])
        {
            case 0:
                this.Background = "white";
                this.Foreground = this.isLocked ? "#888888" : "#000000";
            break;
            case 2:
                this.Background = "#FFEDAD";
                this.Foreground = this.isLocked ? "#5788AF" : "#000000";
            break;
            case 1:
                this.Background = "#EFF8FF";
                this.Foreground = this.isLocked ? "#5788AF" : "#000000";
            break;
        }

        this.isInSelectionMap = map[this.Id] > 0;
    }

    private OnInputGiven(input: number) : void
    {   
        if (!this.isLocked)
        {
            if (this.Id == this.sudokuService.GetSelectedCell() && input !== -1)
            {
                switch (this.sudokuService.GetCurrentContext())
                {
                    case SudokuContext.Input:
                        ////If they click the same number again we process that as an undo action.
                        this.IsSolved = input !== 0;
                        this.DisplayValue = this.IsSolved ? input.toString() : "";
                        this.InError = this.IsSolved && this.solutionNumber.toString() != this.DisplayValue;

                    break;
                    case SudokuContext.Notes:
                        if (!this.IsSolved)
                        {
                            let index: number = input - 1;
                            ////treat a second click of the same number as an undo
                            this.Notes[index] = this.Notes[index] === input.toString() ? "" : input.toString();
                        }
                    break;
                }
            }
            else if (this.sudokuService.GetCurrentContext() == SudokuContext.Input && this.isInSelectionMap)
            {
                ////clear out notes that would be invalidated.
                for (let index = 0; index < this.Notes.length; index++)
                {
                    if (this.Notes[index] == input.toString())
                    {
                        this.Notes[index] = "";
                        break;
                    }
                }
            }
        }
    }

    private OnToggleShowError(showError: boolean) : void
    {
        if (this.isLocked || !this.InError)
        {
            this.ShowError = false;
            return;
        }

        console.log("ShowError = " + showError.toString() + " for " + this.Id.toString());
        this.ShowError = showError;
    }

    ngOnDestroy(): void
    {
        this.selectedCellChangedSubscription.unsubscribe();
        this.inputGivenSubscription.unsubscribe();
        this.toggleErrorsSubscription.unsubscribe();
        this.newBoardChangesSubscription.unsubscribe();
    }
}
