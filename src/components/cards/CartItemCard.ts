import { Component } from '../base/Component';  
import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';

export class CartItemCard extends Component<IProduct> {  
    private titleEl: HTMLElement;
    private priceEl: HTMLElement;
    private deleteBtn: HTMLElement;
    private events = new EventEmitter();
    private productData: Partial<IProduct> = {};

    constructor(container: HTMLElement) {
        super(container);
        
        this.titleEl = container.querySelector('.card__title')!; 
        this.priceEl = container.querySelector('.card__price')!;  
        this.deleteBtn = container.querySelector('.basket__item-delete')!;  

        if (!this.deleteBtn) {
            throw new Error('CartItemCard: не найдена кнопка .basket__item-delete');
        }

        this.deleteBtn.addEventListener('click', () => {
            this.emit<IProduct>('cart:item-remove', this.productData as IProduct);
        });
    }

    set index(value: number) {
        const indexEl = this.container.querySelector('.basket__item-index');
        if (indexEl) indexEl.textContent = String(value);
    }

    render(data?: Partial<IProduct>): HTMLElement {
        if (data) {
            this.productData = { ...this.productData, ...data }; 
            this.titleEl.textContent = data.title ?? '';
            this.priceEl.textContent = `${data.price ?? 0} синапсов`;
        }
        return this.container;
    }

    emit<T extends object>(event: string, data?: T): void {
        this.events.emit(event, data);
    }

    on<T extends object>(event: string, cb: (data: T) => void): void {
        this.events.on(event, cb);
    }
}