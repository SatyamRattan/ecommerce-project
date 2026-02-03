export interface ProductMedia {
    id: number;
    media_type: string;
    file: string;
}

export interface ProductVariant {
    id: number;
    variant_type: string;
    variant_value: string;
    variant_price: number | string;
    stock: string | number;
}

export interface Product {
    id: number;
    name: string;
    price: string;
    base_price?: string | number;
    discount_price?: string | number;
    media: ProductMedia[];
    variants?: ProductVariant[];
    image_url?: string;
    category_name?: string;
    stock?: number;
    description?: string;
}
