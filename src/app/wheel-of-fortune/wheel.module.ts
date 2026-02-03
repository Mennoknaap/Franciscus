import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { Title } from "../components/title";
import { Wheel, WinnerDialog } from "./wheel";
import { WheelDataService } from "./wheel-data";

@NgModule({
    declarations: [Wheel, WinnerDialog],
    imports: [
        Title,
        
        CommonModule,
        FormsModule,
        RouterLink,

        MatButtonModule,
        MatDialogModule,
        MatIconModule
    ],
    providers: [
        WheelDataService
    ]
})
export class WheelModule { }