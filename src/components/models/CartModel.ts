import { EventEmitter } from '../../components/base/Events';
import { IProduct } from '../../types';

export class CartModel extends EventEmitter {
    private items: IProduct[] = [];

    addItem(product: IProduct): void {
        if (!this.hasItem(product.id)) {
            this.items.push(product);
            this.emit('cart:item-added', { product });
            this.emit('cart:changed', { 
                items: this.getItems(), 
                total: this.getTotalPrice(),
                count: this.getTotalCount()
            });
        }
    }

    removeItem(id: string): void {
        const index = this.items.findIndex(p => p.id === id);
        if (index !== -1) {
            const removed = this.items.splice(index, 1)[0];
            this.emit('cart:item-removed', { product: removed });
            this.emit('cart:changed', { 
                items: this.getItems(), 
                total: this.getTotalPrice(),
                count: this.getTotalCount()
            });
        }
    }

    clear(): void {
        if (this.items.length > 0) {
            this.items = [];
            this.emit('cart:cleared');
            this.emit('cart:changed', { items: [], total: 0, count: 0 });
        }
    }

    getItems(): IProduct[] {
        return [...this.items];
    }

    getTotalPrice(): number {
        return this.items.reduce((sum, item) => {
            return item.price !== null ? sum + item.price : sum;
        }, 0);
    }

    getTotalCount(): number {
        return this.items.length;
    }

    hasItem(id: string): boolean {
        return this.items.some(p => p.id === id);
    }
}