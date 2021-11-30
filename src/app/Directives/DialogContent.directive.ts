import { Directive, ViewContainerRef } from "@angular/core";

@Directive(
{
    selector: '[dialogContent]'
})

export class DialogContentDirective
{
    constructor(public viewContainerRef: ViewContainerRef)
    {
    }
}