import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './loader.component.html',
    styleUrl: './loader.component.scss'
})
export class LoaderComponent {
    gifSrc: string = '';

    ngOnInit() {
        this.gifSrc = `cute-heart.gif?t=${new Date().getTime()}`;
    }
}
