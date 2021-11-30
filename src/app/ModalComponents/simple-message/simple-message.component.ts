import { Component, OnInit } from '@angular/core';

@Component(
{
    selector: 'app-simple-message',
    templateUrl: './simple-message.component.html',
    styleUrls: ['./simple-message.component.css']
})

export class SimpleMessageComponent implements OnInit 
{
    public Message: string;
    public Callback: () => void;
    
    constructor() 
    {
    }

    ngOnInit(): void 
    {
    }

    OnButtonClick() : void
    {
        console.log("SM button click");
        this.Callback();
    }
}
