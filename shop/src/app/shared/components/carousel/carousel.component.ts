import { Component, Input, signal, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-carousel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './carousel.component.html',
    styleUrl: './carousel.component.css'
})
export class CarouselComponent implements OnInit, OnDestroy {
    @Input() images: string[] = [];
    @Input() autoSlide: boolean = false;
    @Input() interval: number = 3000;

    currentIndex = signal(0);
    private timerId: any;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnInit() {
        if (this.autoSlide && isPlatformBrowser(this.platformId)) {
            this.startTimer();
        }
    }

    ngOnDestroy() {
        this.stopTimer();
    }

    private startTimer() {
        this.stopTimer(); // Ensure no multiple timers
        this.timerId = setInterval(() => {
            this.next();
        }, this.interval);
    }

    private stopTimer() {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

    next() {
        this.currentIndex.update(i => (i + 1) % this.images.length);
    }

    prev() {
        this.currentIndex.update(i => (i - 1 + this.images.length) % this.images.length);
    }

    goTo(index: number) {
        this.currentIndex.set(index);
        if (this.autoSlide) {
            this.startTimer(); // Reset timer on manual interaction
        }
    }

    // Optional: Pause on hover
    onMouseEnter() {
        if (this.autoSlide) this.stopTimer();
    }

    onMouseLeave() {
        if (this.autoSlide) this.startTimer();
    }
}
