import { EventEmitter } from '../base/Events';
import { IProduct } from '../../types';

export class CatalogModel extends EventEmitter {
    private products: IProduct[] = [];
    private preview: IProduct | null = null;

    setProducts(products: IProduct[]): void {
        this.products = products;
        this.emit('catalog:changed', { items: this.products });
    }

    getProducts(): IProduct[] {
        return [...this.products]; 
    }

    getProductById(id: string): IProduct | undefined {
        return this.products.find(p => p.id === id);
    }

    setPreview(product: IProduct | null): void {
        this.preview = product;
        this.emit('preview:changed', { product: this.preview });
    }

    getPreview(): IProduct | null {
        return this.preview;
    }
}