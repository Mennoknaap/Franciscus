import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { Title } from "../components/title";
import { Home } from "./home";

@NgModule({
    declarations: [Home],
    imports: [
        Title,
        
        MatButtonModule,
    ],
})
export class HomeModule { }