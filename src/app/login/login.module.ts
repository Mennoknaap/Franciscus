import { NgModule } from "@angular/core";
import { Title } from "../components/title";
import { Login } from "./login";

@NgModule({
    declarations: [Login],
    imports: [Title],
})
export class LoginModule { }