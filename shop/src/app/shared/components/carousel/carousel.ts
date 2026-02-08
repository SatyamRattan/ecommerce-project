import { Component, Input, OnInit, OnDestroy, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
    selector: 'app-carousel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './carousel.html',
    styleUrls: ['./carousel.css']
})
export class CarouselComponent implements OnInit, OnDestroy {
    @Input() images: string[] = [];
    @Input() autoSlide: boolean = true;
    @Input() interval: number = 3000;

    // State management using Signals
    currentIndex = signal(0);

    private timerId: any;
    private touchStartX: number = 0;
    private touchEndX: number = 0;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.startAutoSlide();
        }
    }

    ngOnDestroy(): void {
        this.stopAutoSlide();
    }

    next(): void {
        if (this.images.length === 0) return;
        this.currentIndex.update(idx => (idx + 1) % this.images.length);
    }

    prev(): void {
        if (this.images.length === 0) return;
        this.currentIndex.update(idx => (idx - 1 + this.images.length) % this.images.length);
    }

    goToSlide(index: number): void {
        this.currentIndex.set(index);
    }

    // --- Auto-slide logic ---
    startAutoSlide(): void {
        if (this.autoSlide) {
            this.stopAutoSlide();
            this.timerId = setInterval(() => {
                this.next();
            }, this.interval);
        }
    }

    stopAutoSlide(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

    pauseOnHover(): void {
        this.stopAutoSlide();
    }

    resumeOnLeave(): void {
        this.startAutoSlide();
    }

    // --- Swipe support logic ---
    onTouchStart(event: TouchEvent): void {
        this.touchStartX = event.changedTouches[0].screenX;
    }

    onTouchEnd(event: TouchEvent): void {
        this.touchEndX = event.changedTouches[0].screenX;
        this.handleSwipe();
    }

    private handleSwipe(): void {
        const swipeThreshold = 50;
        if (this.touchStartX - this.touchEndX > swipeThreshold) {
            this.next();
        } else if (this.touchEndX - this.touchStartX > swipeThreshold) {
            this.prev();
        }
    }
}
