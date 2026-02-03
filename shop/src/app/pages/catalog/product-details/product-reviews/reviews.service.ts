import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, Reply, ReviewResponse } from './review.types';

@Injectable({
    providedIn: 'root'
})
export class ReviewsService {
    private BASE_URL = 'http://127.0.0.1:8000/api/catalog';

    constructor(private http: HttpClient) { }

    /**
     * Fetches reviews for a specific product with pagination, sorting, and filtering.
     */
    getReviews(
        productId: number,
        page: number = 1,
        pageSize: number = 10,
        sort: string = 'date_desc',
        filterWithComments: boolean = false
    ): Observable<ReviewResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('page_size', pageSize.toString())
            .set('sort', sort);

        if (filterWithComments) {
            params = params.set('has_comment', 'true');
        }

        return this.http.get<ReviewResponse>(`${this.BASE_URL}/products/${productId}/reviews/`, { params });
    }

    /**
     * Submits a new review for a product.
     */
    addReview(productId: number, rating: number, comment: string): Observable<Review> {
        return this.http.post<Review>(`${this.BASE_URL}/productreviews/`, {
            product: productId,
            rating,
            comment
        });
    }

    /**
     * Toggles a like on a review.
     */
    likeReview(reviewId: number): Observable<any> {
        return this.http.post(`${this.BASE_URL}/productreviews/${reviewId}/like/`, {});
    }

    /**
     * Submits a reply to a review.
     */
    replyToReview(reviewId: number, comment: string): Observable<Reply> {
        return this.http.post<Reply>(`${this.BASE_URL}/productreviews/${reviewId}/reply/`, {
            comment
        });
    }
}
