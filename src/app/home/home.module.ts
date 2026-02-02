import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterLink } from "@angular/router";
import { Title } from "../components/title";
import { Home } from "./home";

@NgModule({
    declarations: [Home],
    imports: [
        Title,
        
        CommonModule,
        RouterLink,

        MatButtonModule,
        MatIconModule
    ],
})
export class HomeModule { }