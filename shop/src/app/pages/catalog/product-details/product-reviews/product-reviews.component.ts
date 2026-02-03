import { Component, Input, OnInit, OnChanges, SimpleChanges, signal, computed, effect, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReviewsService } from './reviews.service';
import { Review, Reply, ReviewResponse } from './review.types';

@Component({
    selector: 'app-product-reviews',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './product-reviews.component.html',
    styleUrl: './product-reviews.component.css'
})
export class ProductReviewsComponent implements OnInit, OnChanges {
    // Input using modern API if possible, but keeping standard for safety with older v21 decorators
    @Input({ required: true }) productId!: number;

    // Modern Angular Signals for reactive state
    reviews = signal<Review[]>([]);
    averageRating = signal<number>(0);
    totalReviews = signal<number>(0);
    loading = signal<boolean>(false);
    errorMessage = signal<string>('');

    // Pagination state
    currentPage = signal<number>(1);
    pageSize = signal<number>(5);
    totalCount = signal<number>(0);

    // Sorting and Filtering state
    selectedSort = signal<string>('date_desc');
    filterWithComments = signal<boolean>(false);

    // Form state
    newReviewRating = signal<number>(0);
    newReviewComment = signal<string>('');
    submittingReview = signal<boolean>(false);

    sortOptions = [
        { label: 'Highest Rating', value: 'rating_desc' },
        { label: 'Lowest Rating', value: 'rating_asc' },
        { label: 'Newest', value: 'date_desc' },
        { label: 'Oldest', value: 'date_asc' },
        { label: 'Most Liked', value: 'likes_desc' }
    ];

    // Helper for destroyed stream
    private destroyRef = inject(DestroyRef);

    constructor(private reviewsService: ReviewsService) { }

    ngOnInit() {
        this.fetchReviews();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['productId'] && !changes['productId'].isFirstChange()) {
            this.currentPage.set(1);
            this.fetchReviews();
        }
    }

    fetchReviews() {
        if (!this.productId) return;

        this.loading.set(true);
        this.errorMessage.set('');

        this.reviewsService.getReviews(
            this.productId,
            this.currentPage(),
            this.pageSize(),
            this.selectedSort(),
            this.filterWithComments()
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (res: ReviewResponse) => {
                    // Map raw results to include UI-only properties
                    const mapped = res.results.map(r => ({ ...r, showReplies: false, replyInput: '' }));
                    this.reviews.set(mapped);
                    this.totalCount.set(res.count);
                    this.averageRating.set(res.average_rating || 0);
                    this.totalReviews.set(res.total_reviews_count || 0);
                    this.loading.set(false);
                },
                error: (err) => {
                    this.errorMessage.set('Failed to load reviews. Please try again.');
                    this.loading.set(false);
                    console.error('[ProductReviews] Load error:', err);
                }
            });
    }

    // Event Handlers
    onSortChange(event: any) {
        this.selectedSort.set(event.target.value);
        this.currentPage.set(1);
        this.fetchReviews();
    }

    onFilterToggle() {
        this.filterWithComments.update(v => !v);
        this.currentPage.set(1);
        this.fetchReviews();
    }

    onPageChange(page: number) {
        this.currentPage.set(page);
        this.fetchReviews();
    }

    onPageSizeChange(event: any) {
        this.pageSize.set(+event.target.value);
        this.currentPage.set(1);
        this.fetchReviews();
    }

    // Review Actions
    setRating(rating: number) {
        this.newReviewRating.set(rating);
    }

    submitReview() {
        const rating = this.newReviewRating();
        const comment = this.newReviewComment();

        if (rating === 0) {
            alert('Please select a rating.');
            return;
        }

        this.submittingReview.set(true);
        this.reviewsService.addReview(this.productId, rating, comment)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (review) => {
                    // Optimization: Unshift into local signals for instant feedback
                    this.reviews.update(current => [{ ...review, showReplies: false, replyInput: '' }, ...current]);
                    this.newReviewRating.set(0);
                    this.newReviewComment.set('');
                    this.submittingReview.set(false);
                    // Optional: full refresh to get updated server-side counts/avg
                    // this.fetchReviews(); 
                },
                error: () => {
                    alert('Failed to submit review.');
                    this.submittingReview.set(false);
                }
            });
    }

    likeReview(review: Review) {
        this.reviewsService.likeReview(review.id)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: () => {
                    // Reactive update of the object in the signal array
                    this.reviews.update(list => list.map(r => {
                        if (r.id === review.id) {
                            const isLiked = !r.is_liked_by_user;
                            return {
                                ...r,
                                is_liked_by_user: isLiked,
                                likes_count: r.likes_count + (isLiked ? 1 : -1)
                            };
                        }
                        return r;
                    }));
                }
            });
    }

    toggleReplies(review: Review) {
        this.reviews.update(list => list.map(r =>
            r.id === review.id ? { ...r, showReplies: !r.showReplies } : r
        ));
    }

    submitReply(review: Review) {
        const comment = review.replyInput?.trim();
        if (!comment) return;

        this.reviewsService.replyToReview(review.id, comment)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (reply) => {
                    this.reviews.update(list => list.map(r => {
                        if (r.id === review.id) {
                            return {
                                ...r,
                                replies_count: r.replies_count + 1,
                                replies: [...(r.replies || []), reply],
                                replyInput: ''
                            };
                        }
                        return r;
                    }));
                },
                error: () => alert('Failed to post reply.')
            });
    }

    updateReplyInput(review: Review, value: string) {
        this.reviews.update(list => list.map(r =>
            r.id === review.id ? { ...r, replyInput: value } : r
        ));
    }

    // UI Helpers
    getStars(rating: number): string[] {
        const stars = [];
        const rounded = Math.round(rating);
        for (let i = 1; i <= 5; i++) {
            stars.push(i <= rounded ? '★' : '☆');
        }
        return stars;
    }

    // Computed Pagination
    totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
    pagesArray = computed(() => Array.from({ length: this.totalPages() }, (_, i) => i + 1));
}
