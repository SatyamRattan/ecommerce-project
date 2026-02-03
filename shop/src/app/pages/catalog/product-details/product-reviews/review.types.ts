/**
 * Interface representing a reply to a review
 */
export interface Reply {
    id: number;
    review_id: number;
    user_name: string;
    comment: string;
    created_at: string;
}

/**
 * Interface representing a product review
 */
export interface Review {
    id: number;
    product_id: number;
    user_name: string;
    rating: number; // 1 to 5
    comment: string | null;
    likes_count: number;
    is_liked_by_user: boolean;
    replies_count: number;
    replies: Reply[];
    images?: string[]; // Media support
    created_at: string;
    // UI ONLY state
    showReplies?: boolean;
    replyInput?: string;
}

/**
 * Interface for the paginated reviews response
 */
export interface ReviewResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: Review[];
    average_rating?: number;
    total_reviews_count?: number;
}
