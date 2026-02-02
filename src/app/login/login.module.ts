import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { Title } from "../components/title";
import { Login } from "./login";

@NgModule({
    declarations: [Login],
    imports: [Title, MatButtonModule],
})
export class LoginModule { }