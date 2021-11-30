import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BoardComponent } from './board/board.component';
import { CellComponent } from './cell/cell.component';
import { InputButtonTrayComponent } from './input-button-tray/input-button-tray.component';
import { InputButtonComponent } from './input-button/input-button.component';
import { ProgressPieComponent } from './progress-pie/progress-pie.component';
import { RegionComponent } from './region/region.component';
import { DialogContentDirective } from './Directives/DialogContent.directive';
import { NewGameOptionsComponent } from './ModalComponents/new-game-options/new-game-options.component';
import { HeaderComponent } from './header/header.component';

@NgModule(
{
    declarations: 
    [
        AppComponent,
        BoardComponent,
        RegionComponent,
        CellComponent,
        InputButtonComponent,
        InputButtonTrayComponent,
        ProgressPieComponent,
        NewGameOptionsComponent,
        DialogContentDirective,
        HeaderComponent
    ],
    imports: 
    [
        BrowserModule
    ],
    providers: [],
    bootstrap: 
    [
        AppComponent
    ]
})
export class AppModule { }
