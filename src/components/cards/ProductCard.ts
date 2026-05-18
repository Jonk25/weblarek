import { BaseCard } from '../base/BaseCard';
import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';

export class ProductCard extends BaseCard {
    private events = new EventEmitter();

    constructor(container: HTMLElement) {
        super(container);
        
        this.container.addEventListener('click', (e) => {
            e.stopPropagation();
            const data = this.getData();
            if (data?.id) {
                this.emit<IProduct>('product:select', data as IProduct);
            }
        });
    }

    emit<T extends object>(event: string, data?: T): void {
        this.events.emit(event, data);
    }

    on<T extends object>(event: string, cb: (data: T) => void): void {
        this.events.on(event, cb);
    }
}