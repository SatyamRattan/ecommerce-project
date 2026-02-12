import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './about.html',
    styleUrl: './about.css'
})
export class About implements OnInit, OnDestroy {
    stats = [
        { label: 'Happy Customers', value: 0, target: 15000, suffix: '+' },
        { label: 'Premium Products', value: 0, target: 2500, suffix: '+' },
        { label: 'Stores Worldwide', value: 0, target: 50, suffix: '' },
        { label: 'Quality Awards', value: 0, target: 12, suffix: '' }
    ];

    private animationInterval: any;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.animateStats();
        }
    }

    ngOnDestroy(): void {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
    }

    private animateStats(): void {
        const duration = 2000; // 2 seconds
        const frameDuration = 1000 / 60; // 60 FPS
        const totalFrames = Math.round(duration / frameDuration);

        let frame = 0;
        this.animationInterval = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;

            this.stats.forEach(stat => {
                stat.value = Math.floor(stat.target * progress);
            });

            if (frame === totalFrames) {
                this.stats.forEach(stat => stat.value = stat.target);
                clearInterval(this.animationInterval);
            }
        }, frameDuration);
    }
}
