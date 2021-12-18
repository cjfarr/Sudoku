import { Component, OnInit, Output, EventEmitter, HostListener } from '@angular/core';
import { Subscription } from 'rxjs';
import { SudokuContext } from '../Constants/Enums';
import { SimpleMessageArgs } from '../ModalComponents/simple-message/SimpleMessageArgs';
import { SudokuService } from '../Services/Sudoku.service';

@Component(
{
    selector: 'input-button-tray',
    templateUrl: './input-button-tray.component.html',
    styleUrls: ['./input-button-tray.component.css']
})

export class InputButtonTrayComponent implements OnInit 
{
    @Output() AttemptSolve: EventEmitter<SimpleMessageArgs> = new EventEmitter<SimpleMessageArgs>();
    @Output() PlayAgain: EventEmitter<void> = new EventEmitter<void>();

    ButtonCount: number[];
    ErrorTimerProgress: number;
    IsViewingErrors: boolean;
    CanViewErrors: boolean;
    ErrorProgressViewBoxSize: number;
    ErrorProgressRadius: number;

    private errorInterval;
    private errorTick: number;
    private contextChangedSubscription: Subscription;

    constructor(private sudokuService: SudokuService) 
    {
        this.ButtonCount = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];

        this.ErrorTimerProgress = 0;
        this.errorTick = 0;
        this.IsViewingErrors = false;
        this.CanViewErrors = true;

        this.ErrorProgressViewBoxSize = 40;
        this.ErrorProgressRadius = 10;
        this.OnScreenSizeChanged();
    }

    ngOnInit(): void 
    {
        ////I only need to listen for the game over part just in case I need to reset the error viewing bool.
        ////There is a new game button in the nav bar header that this component won't know about.
        this.contextChangedSubscription = this.sudokuService.SubscribeToContextChanged((c) =>
        {
            if (c == SudokuContext.GameOver)
            {
                this.CanViewErrors = true;
            }
        })
    }

    OnAttemptSolve()
    {
        let message: SimpleMessageArgs = new SimpleMessageArgs();
        if (this.sudokuService.CheckIfAllCellsAreFilled())
        {
            if (this.sudokuService.CheckIfBoardWasSolved())
            {
                message.Title = "Congratulations!";
                message.Message = "You solved the puzzle!";
                this.sudokuService.UpdateContext(SudokuContext.GameOver);
            }
            else
            {
                message.Title = "Keep Trying";
                message.Message = "Part of the puzzle is incorrect.  Keep trying.";
            }
        }
        else
        {
            message.Title = "Keep Trying";
            message.Message = "You must fill in all cells to solve the puzzle.";
        }

        this.AttemptSolve.emit(message);
    }

    OnPlayAgain()
    {
        this.CanViewErrors = true;
        this.PlayAgain.emit();
    }

    OnContextChanged()
    {
        switch (this.sudokuService.GetCurrentContext())
        {
            case SudokuContext.Input:
                this.sudokuService.UpdateContext(SudokuContext.Notes);
            break;
            case SudokuContext.Notes:
                this.sudokuService.UpdateContext(SudokuContext.Input);
            break;
        }
    }

    OnToggleError()
    {
        this.sudokuService.ToggleShowErrors();
        this.errorTick = 100;
        this.IsViewingErrors = true;
        this.sudokuService.ErrorViewsAllowed--;
        this.errorInterval = setInterval(() =>
        {
            this.ErrorTimerProgress = this.errorTick * .01;
            this.errorTick--;
      
            if (this.errorTick < 0)
            {
                this.sudokuService.ToggleShowErrors();
                this.CanViewErrors = this.sudokuService.ErrorViewsAllowed > 0;
                this.IsViewingErrors = false;
                clearInterval(this.errorInterval);
            }
        },
        50);
    }

    @HostListener('window:resize', ['$event'])
    OnScreenSizeChanged(event?)
    {
        console.log("Got window width: " + window.innerWidth.toString());
        if (window.innerWidth <= 375)
        {
            this.ErrorProgressRadius = 8;
            this.ErrorProgressViewBoxSize = 32;
        }
    }

    public GetCurrentContext() : string
    {
        return this.sudokuService.GetCurrentContext().toString();
    }

    public GetErrorViewingsLeft() : number
    {
        return this.sudokuService.ErrorViewsAllowed;
    }

    ngOnDestroy(): void
    {
        this.contextChangedSubscription.unsubscribe();
    }
}
