import { Component } from '@angular/core';

@Component({
    selector: 'app-title',
    styles: [`:host { display: flex; justify-content: center; }`],
    template: `<h1><ng-content></ng-content></h1>`,
})
export class Title {

}