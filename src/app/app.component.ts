import { Component, ComponentFactoryResolver, ComponentRef, HostListener, ViewChild } from '@angular/core';
import { SudokuService } from './Services/Sudoku.service';
import * as bootstrap from 'bootstrap';
import { NewGameOptionsComponent } from './ModalComponents/new-game-options/new-game-options.component';
import { DialogContentDirective } from './Directives/DialogContent.directive';
import { Subscription } from 'rxjs';
import { SimpleMessageComponent } from './ModalComponents/simple-message/simple-message.component';
import { DifficultyType, SudokuContext } from './Constants/Enums';
import { SimpleMessageArgs } from './ModalComponents/simple-message/SimpleMessageArgs';

@Component(
{
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent 
{
    @ViewChild(DialogContentDirective, { static: false }) dialogContentHost: DialogContentDirective;

    title = 'Sudoku';
    DialogTitle: string;
    genericModalDialog: bootstrap.Modal | undefined;

    private newBoardChangesSubscription: Subscription;

    constructor(
        private sudokuService: SudokuService,
        private componentFactoryResolver: ComponentFactoryResolver)
    {
        this.DialogTitle = "Choose difficulty";
    }

    ngOnInit(): void
    {
        this.newBoardChangesSubscription = this.sudokuService.SubscribeToNewBoardChanges(this.OnNewBoardChanges.bind(this));
    }

    ngAfterViewInit() : void
    {
        this.ShowNewGameDialog();
    }

    OnAttemptSolve(message: SimpleMessageArgs) : void
    {
        this.DialogTitle = message.Title;

        const hostViewContainer = this.dialogContentHost.viewContainerRef;
        hostViewContainer.clear();

        const simpleMessageFactory = this.componentFactoryResolver.resolveComponentFactory(SimpleMessageComponent);
        let component: ComponentRef<SimpleMessageComponent> = hostViewContainer.createComponent(simpleMessageFactory);
        component.instance.Message = message.Message;
        component.instance.Callback = this.OnSimpleMessageCallback.bind(this);

        this.genericModalDialog = new bootstrap.Modal(document.getElementById('GenericDialog'));
        this.genericModalDialog?.show();
    }

    OnPlayAgain() : void
    {
        this.DialogTitle = "Choose difficulty";
        this.sudokuService.UpdateContext(SudokuContext.Input);
        this.sudokuService.GenerateBoard(DifficultyType.Empty);
        this.sudokuService.PublishNewBoardChanges();
        
        this.ShowNewGameDialog();
    }

    private OnSimpleMessageCallback() : void
    {
        if (this.genericModalDialog !== undefined)
        {
            this.genericModalDialog.hide();
        }
    }

    private ShowNewGameDialog() : void
    {
        const hostViewContainer = this.dialogContentHost.viewContainerRef;
        hostViewContainer.clear();

        const gameOptionsFactory = this.componentFactoryResolver.resolveComponentFactory(NewGameOptionsComponent);
        hostViewContainer.createComponent(gameOptionsFactory);

        this.genericModalDialog = new bootstrap.Modal(document.getElementById('GenericDialog'));
        this.genericModalDialog?.show();
    }

    private OnNewBoardChanges(): void
    {
        if (this.genericModalDialog !== undefined)
        {
            this.genericModalDialog.hide();
        }
    }

    @HostListener('window:keyup', ['$event'])
    OnKeyUp(event: KeyboardEvent) : void
    {
        console.log(event.code);
        if (event.code.startsWith("Digit") || event.code.startsWith("Numpad"))
        {
            try
            {
                let digit: string = event.code.substring(event.code.length - 1);
                this.sudokuService.GiveInput(parseInt(digit, 10));
            }
            catch
            {
                console.log("Couldn't process key up event");
            }
        }
        else if (event.code.startsWith("Arrow"))
        {
            let direction: string = event.code.substring(5);
            let currentCell: number = this.sudokuService.GetSelectedCell();

            switch (direction)
            {
                case "Left":
                    if (this.CheckIfNextMoveWouldGoOffBoard(currentCell, currentCell - 1))
                    {
                        return;
                    }

                    currentCell--;
                break;
                case "Right":
                    if (this.CheckIfNextMoveWouldGoOffBoard(currentCell, currentCell + 1))
                    {
                        return;
                    }

                    currentCell++;
                break;
                case "Up":
                    if (currentCell < this.sudokuService.BoardSize)
                    {
                        return;
                    }

                    currentCell -= this.sudokuService.BoardSize;
                break;
                case "Down":
                    if (currentCell >= (this.sudokuService.BoardSize * this.sudokuService.BoardSize) - this.sudokuService.BoardSize)
                    {
                        return;
                    }

                    currentCell += this.sudokuService.BoardSize;
                break;
            }

            console.log("updating cell");

            let regionId: number = this.sudokuService.GetRegionIdOfCell(currentCell);
            this.sudokuService.UpdateSelectedCell(currentCell, regionId);
        }
    }

    private CheckIfNextMoveWouldGoOffBoard(cellId: number, nextCell: number) : boolean
    {
        let rowMod: number = cellId % this.sudokuService.BoardSize;
        if ((rowMod === 0 && nextCell < cellId) || (rowMod === this.sudokuService.BoardSize - 1 && nextCell > cellId))
        {
            return true;
        }

        return false;
    }

    ngOnDestroy(): void
    {
        this.newBoardChangesSubscription.unsubscribe();
    }
}
