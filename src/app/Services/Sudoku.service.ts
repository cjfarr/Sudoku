import { DifficultyType } from "../Constants/Enums";
import { Injectable, Input } from "@angular/core";
import { BehaviorSubject, Subscription } from "rxjs";
import { SudokuContext } from "../Constants/Enums";

@Injectable(
{
    providedIn: 'root'
})

export class SudokuService
{
    RegionSize = 3;
    BoardSize = 9;
    ErrorViewsAllowed: number;
    IsUsingAutoNotes: boolean = false;

    private solvedBoard: number[];
    private currentBoard: number[];
    private originIndexByRegion: Map<number, number>;
    private selectedCell: number;
    private selectedCellChangedSubject: BehaviorSubject<number[]>;
    private inputGivenSubject: BehaviorSubject<number>;
    private contextChangedSubject: BehaviorSubject<SudokuContext>;
    private toggleErrorsSubject: BehaviorSubject<boolean>;
    private newBoardChangesSubject: BehaviorSubject<void>;
    private currentDifficulty: DifficultyType = DifficultyType.Empty;

    constructor()
    {
        this.originIndexByRegion = new Map<number, number>();
        this.originIndexByRegion.set(1, 0);
        this.originIndexByRegion.set(2, 3);
        this.originIndexByRegion.set(3, 6);

        this.originIndexByRegion.set(4, 27);
        this.originIndexByRegion.set(5, 30);
        this.originIndexByRegion.set(6, 33);

        this.originIndexByRegion.set(7, 54);
        this.originIndexByRegion.set(8, 57);
        this.originIndexByRegion.set(9, 60);

        this.selectedCell = 0;
        let selectedCellMap: number[] =
        [
            2, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 1, 1, 0, 0, 0, 0, 0, 0,
            1, 1, 1, 0, 0, 0, 0, 0, 0,

            1, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 0, 0, 0,

            1, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 0, 0, 0,
            1, 0, 0, 0, 0, 0, 0, 0, 0
        ];
        this.selectedCellChangedSubject = new BehaviorSubject<number[]>(selectedCellMap);
        this.inputGivenSubject = new BehaviorSubject<number>(-1);
        this.contextChangedSubject = new BehaviorSubject<SudokuContext>(SudokuContext.Input);
        this.toggleErrorsSubject = new BehaviorSubject<boolean>(false);
        this.newBoardChangesSubject = new BehaviorSubject<void>(null);
        this.ErrorViewsAllowed = 2;
    }

    public GenerateBoard(difficulty: DifficultyType) : void
    {
        this.currentDifficulty = difficulty;
        let emptyCellCount = 81;
        this.ErrorViewsAllowed = 2;

        switch (difficulty)
        {
            case DifficultyType.Easy:
                emptyCellCount = 30;
                this.ErrorViewsAllowed = 4;
                break;
            case DifficultyType.Medium:
                emptyCellCount = 40;
                this.ErrorViewsAllowed = 3;
                break;
            case DifficultyType.Hard:
                emptyCellCount = 50;
                break;
        }

        let seeds: number[] = [ 1, 2, 3, 4, 5, 6, 7, 8, 9 ];

        let seededBoard: number[] =
        [
            5, 3, 4, 6, 7, 8, 9, 1, 2,
            6, 7, 2, 1, 9, 5, 3, 4, 8,
            1, 9, 8, 3, 4, 2, 5, 6, 7,

            8, 5, 9, 7, 6, 1, 4, 2, 3,
            4, 2, 6, 8, 5, 3, 7, 9, 1,
            7, 1, 3, 9, 2, 4, 8, 5, 6,

            9, 6, 1, 5, 3, 7, 2, 8, 4,
            2, 8, 7, 4, 1, 9, 6, 3, 5,
            3, 4, 5, 2, 8, 6, 1, 7, 9
        ];
        
        //randomly generate a map to re-seed a new board
        let seedMap = new Map<number, number>();
        let key: number;

        for (key = 1; key < 10; key++)
        {
            let assignment = this.GetRandomInt(1, 9);

            while (seeds.indexOf(assignment) === -1)
            {
                assignment = this.GetRandomInt(1, 9);
            }

            seedMap.set(key, assignment);
            seeds = seeds.filter(s => s !== assignment);
        }

        if (difficulty !== DifficultyType.Empty)
        {
            for (key = 1; key < 10; key++)
            {
                console.log("Key: " + key.toString() + " = " + seedMap.get(key).toString());
            }
        }

        this.solvedBoard = new Array();
        let boardTotal = this.BoardSize * this.BoardSize;
        ////This will build the solution board.
        for (let index: number = 0; index < boardTotal; index++)
        {
            let mapped: number = seedMap.get(seededBoard[index]);
            this.solvedBoard.push(mapped);
        }
        
        ////blank out random cells for the current board that will be played
        this.currentBoard = Array.from(this.solvedBoard);
        let emptyCells: number[] = new Array();

        for (let index: number = 0; index < emptyCellCount; index++)
        {
            let cellIndex = this.GetRandomInt(0, boardTotal - 1);
            while (emptyCells.indexOf(cellIndex) !== -1)
            {
                cellIndex = this.GetRandomInt(0, boardTotal - 1);
            }

            emptyCells.push(cellIndex);
            this.currentBoard[cellIndex] = -1;
        }
    }

    public GetSolutionCellValue(cellId: number): number
    {
        return this.solvedBoard[cellId];
    }

    public GetCurrentCellValue(cellId: number): number
    {
        return this.currentBoard[cellId];
    }

    public GetSelectedCell(): number
    {
        return this.selectedCell;
    }

    public UpdateSelectedCell(cellId: number, regionId: number) : void
    {
        this.selectedCell = cellId;
        let selectedCellMap: number[] = this.selectedCellChangedSubject.getValue();

        ////clear the map
        for (let index: number = 0; index < selectedCellMap.length; index++)
        {
            selectedCellMap[index] = 0;
        }

        for (let rowIndex of this.GetAllRowIndexes(cellId))
        {
            selectedCellMap[rowIndex] = 1;
        }

        for (let columnIndex of this.GetAllColumnIndexes(cellId))
        {
            selectedCellMap[columnIndex] = 1;
        }

        for (let regionIndex of this.GetCellIndexesByRegion(regionId))
        {
            selectedCellMap[regionIndex] = 1;
        }

        selectedCellMap[cellId] = 2;

        this.selectedCellChangedSubject.next(selectedCellMap);
    }

    public SubscribeToCellChangedEvent(callback: (map: number[]) => void) : Subscription
    {
        return this.selectedCellChangedSubject.subscribe(callback);
    }

    public GiveInput(input: number) : void
    {
        if (this.currentBoard[this.selectedCell] === input)
        {
            ////treat this as an undo
            input = 0;
        }

        if (this.GetCurrentContext() == SudokuContext.Input)
        {
            this.currentBoard[this.selectedCell] = input;
        }

        this.inputGivenSubject.next(input);
    }

    public GetMissingCount(input: number) : number
    {
        let count: number = 0;
        for (let cell of this.currentBoard)
        {
            if (cell === input)
            {
                count++;
            }
        }

        return this.BoardSize - count;
    }

    public SubscribeToInputGivenEvent(callback: (input: number) => void) : Subscription
    {
        return this.inputGivenSubject.subscribe(callback);
    }

    public GetCellIndexesByRegion(regionId: number) : number[]
    {
        let indexes: number[] = new Array();
        let row: number;
        let rowSeed: number = this.originIndexByRegion.get(regionId);

        for (row = 0; row < 3; row++)
        {
            let cell: number;
            for (cell = rowSeed; cell < rowSeed + 3; cell++)
            {
                indexes.push(cell);
            }

            rowSeed += 9;
        }

        return indexes;
    }

    public GetAllRowIndexes(cellId: number) : number[]
    {
        let row: number[] = new Array();
        let mod = cellId % this.BoardSize;

        for (let index: number = cellId - mod; index < (cellId - mod) + this.BoardSize; index++)
        {
            row.push(index);
        }

        return row;
    }

    public GetAllColumnIndexes(cellId: number) : number[]
    {
        let column: number[] = new Array();

        for (let columnIndex = cellId % this.BoardSize; columnIndex < this.BoardSize * this.BoardSize; columnIndex += 9)
        {
            column.push(columnIndex)
        }

        return column;
    }

    public GetRegionIdOfCell(cellId: number) : number
    {
        let rowMod: number = cellId % this.BoardSize;
        let rowSeedCell: number = cellId - rowMod;

        let boardRow: number = rowSeedCell / this.BoardSize;
        let regionRowMod: number = boardRow % this.RegionSize;
        let regionRow: number = boardRow - regionRowMod;

        let regionColumnMod: number = rowMod % this.RegionSize;
        let regionColumn: number = rowMod - regionColumnMod;
        regionColumn /= this.RegionSize;

        return regionRow + regionColumn + 1;
    }

    public CheckIfAllCellsAreFilled() : boolean
    {
        for (let index: number = 0; index < this.currentBoard.length; index++)
        {
            if (this.currentBoard[index] < 1)
            {
                console.log("Not filled at cell " + index.toString() + " val " + this.currentBoard[index].toString());
                return false;
            }
        }

        return true;
    }

    public CheckIfBoardWasSolved() : boolean
    {
        for (let index: number = 0; index < this.currentBoard.length; index++)
        {
            if (this.currentBoard[index] !== this.solvedBoard[index])
            {
                return false;
            }
        }

        return true;
    }

    public ToggleShowErrors() : void
    {
        let value = !this.toggleErrorsSubject.getValue();
        console.log("Sending " + value.toString() + " as ShowError");
        this.toggleErrorsSubject.next(value);
    }

    public SubscribeToToggleErrors(callback: (showErrors: boolean) => void) : Subscription
    {
        return this.toggleErrorsSubject.subscribe(callback);
    }

    public GetCurrentContext() : SudokuContext
    {
        return this.contextChangedSubject.getValue();
    }

    public UpdateContext(context: SudokuContext) : void
    {
        if (context !== this.contextChangedSubject.getValue())
        {
            this.contextChangedSubject.next(context);
        }
    }

    public SubscribeToContextChanged(callback: (context: SudokuContext) => void) : Subscription
    {
        return this.contextChangedSubject.subscribe(callback);
    }

    public PublishNewBoardChanges() : void
    {
        this.newBoardChangesSubject.next();
    }

    public SubscribeToNewBoardChanges(callback: () => void) : Subscription
    {
        return this.newBoardChangesSubject.subscribe(callback);
    }

    public GetCurrentDifficulty() : DifficultyType
    {
        return this.currentDifficulty;
    }

    private GetRandomInt(min: number, max: number) : number
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}