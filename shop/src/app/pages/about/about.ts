import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-about',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './about.html',
    styleUrl: './about.css',
})
export class About implements OnInit {
    // Stats for the trust section
    stats = [
        { value: 0, target: 10000, label: 'Happy Customers', suffix: '+' },
        { value: 0, target: 5000, label: 'Products', suffix: '+' },
        { value: 0, target: 25000, label: 'Orders Delivered', suffix: '+' },
        { value: 0, target: 98, label: 'Satisfaction Rate', suffix: '%' }
    ];

    ngOnInit() {
        this.animateStats();
    }

    animateStats() {
        this.stats.forEach(stat => {
            const duration = 2000; // 2 seconds
            const steps = 50;
            const increment = stat.target / steps;
            let current = 0;
            const interval = setInterval(() => {
                current += increment;
                if (current >= stat.target) {
                    stat.value = stat.target;
                    clearInterval(interval);
                } else {
                    stat.value = Math.floor(current);
                }
            }, duration / steps);
        });
    }
}
