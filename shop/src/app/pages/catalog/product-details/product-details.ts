import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Api } from '../../../services/api';
import { CommonModule } from '@angular/common';
import { Cart } from '../../../services/cart';
import { Wishlist } from '../../../services/wishlist';
import { ProductReviewsComponent } from './product-reviews/product-reviews.component';

import { Product, ProductVariant } from '../../../models/product.model';

@Component({
    standalone: true,
    selector: 'app-product-details',
    imports: [CommonModule, ProductReviewsComponent],
    templateUrl: './product-details.html',
    styleUrl: './product-details.css',
})
export class ProductDetails {
    product: Product | null = null;
    groupedVariants: { [key: string]: ProductVariant[] } = {};
    selectedVariant: ProductVariant | null = null;
    selectedImage: string = '';

    constructor(
        private route: ActivatedRoute,
        private api: Api,
        private cartService: Cart,
        public wishlist: Wishlist
    ) {
        const id = this.route.snapshot.params['id'];

        this.api.getProduct(id).subscribe((res: any) => {
            this.product = Array.isArray(res)
                ? res[0]
                : (res && res.results ? res.results[0] : res);

            if (this.product) {
                this.selectedImage = this.product.media?.[0]?.file || this.product.image_url || '';
                if (this.product.variants && this.product.variants.length > 0) {
                    this.groupVariants(this.product.variants);
                    const firstVariant = this.product.variants[0];
                    this.selectVariant(firstVariant);
                }
            }
        });
    }

    groupVariants(variants: ProductVariant[]) {
        this.groupedVariants = {};
        variants.forEach(variant => {
            const type = variant.variant_type || 'Options';
            if (!this.groupedVariants[type]) {
                this.groupedVariants[type] = [];
            }
            this.groupedVariants[type].push(variant);
        });
    }

    selectVariant(variant: ProductVariant) {
        this.selectedVariant = variant;

        if (variant.images && variant.images.length > 0) {
            this.selectedImage = variant.images[0].image;
        } else {
            this.selectedImage = this.product?.media?.[0]?.file || this.product?.image_url || '';
        }
    }

    /**
     * Getter for dynamic price display.
     * Switches live based on selection.
     */
    get displayPrice(): number | string {
        if (this.selectedVariant) {
            return this.selectedVariant.variant_price;
        }
        return this.product?.discount_price || this.product?.base_price || this.product?.price || 0;
    }

    get hasVariants(): boolean {
        return Object.keys(this.groupedVariants).length > 0;
    }

    /**
     * Add to Cart request sends specific payload keys:
     * { product_id, variant_id, quantity }
     */
    addToCart() {
        if (!this.product) return;

        if (this.hasVariants && !this.selectedVariant) {
            if (typeof alert !== 'undefined') {
                alert('Please select a variant');
            }
            return;
        }

        const variant_id = this.selectedVariant?.id || null;

        console.log('[ProductDetails] Add to Cart Payload:', {
            product_id: this.product.id,
            variant_id: variant_id,
            quantity: 1
        });

        this.cartService.addToCart(this.product.id, 1, variant_id).subscribe({
            next: () => {
                if (typeof alert !== 'undefined') {
                    alert('Added to cart!');
                }
            },
            error: (err) => {
                console.error('Add to cart error:', err);
                const detail = err.error?.detail || err.error?.message || err.message || 'Unknown error';
                if (typeof alert !== 'undefined') {
                    alert(`Failed to add to cart: ${detail}`);
                }
            }
        });
    }

    toggleWishlist() {
        if (!this.product) return;

        // Use variant ID if available, otherwise product ID
        const productId = this.product.id;
        const variantId = this.selectedVariant?.id || null;

        this.wishlist.toggleWishlist(Number(productId), variantId ? Number(variantId) : null).subscribe({
            next: (res) => console.log(res.message),
            error: (err) => { }
        });
    }
}
