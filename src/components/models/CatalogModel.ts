import { IProduct } from '../../types';

export class CatalogModel {
    private _products: IProduct[] = [];
    private _preview: IProduct | null = null;

    setProducts(products: IProduct[]): void {
        this._products = products;
    }

    getProducts(): IProduct[] {
        return this._products;
    }

    getProductById(id: string): IProduct | undefined {
        return this._products.find(product => product.id === id);
    }

    setPreview(product: IProduct): void {
        this._preview = product;
    }

    getPreview(): IProduct | null {
        return this._preview;
    }
}