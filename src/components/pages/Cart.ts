import { Component } from '../base/Component';
import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';

export class Cart extends Component<{ items: IProduct[]; total: number }> {
    private list: HTMLElement;
    private totalEl: HTMLElement;
    private checkoutBtn: HTMLButtonElement;
    private events = new EventEmitter();

    constructor(container: HTMLElement) {
        super(container);

        this.list = container.querySelector('.basket__list')!;
        this.totalEl = container.querySelector('.basket__price')!;
        this.checkoutBtn = container.querySelector('.basket__button') as HTMLButtonElement;

        if (!this.list || !this.totalEl || !this.checkoutBtn) {
            throw new Error(
                'Cart: не найдены обязательные элементы. ' +
                'Проверьте наличие: .basket__list, .basket__price, .basket__button'
            );
        }

        this.checkoutBtn.addEventListener('click', () => {
            this.emit('cart:checkout');
        });
    }

    render(data?: { items: IProduct[]; total: number }): HTMLElement {
        if (data) {
            this.list.innerHTML = '';
            
            if (data.items.length === 0) {
                this.checkoutBtn.disabled = true;
            } else {
                this.totalEl.textContent = `${data.total} синапсов`;
                this.checkoutBtn.disabled = false;
            }
        }
        return this.container;
    }

    addItem(card: HTMLElement): void {
        this.list.appendChild(card);
    }

    clear(): void {
        this.list.innerHTML = '';
    }

    emit<T extends object>(event: string, data?: T): void {
        this.events.emit(event, data);
    }

    on<T extends object>(event: string, cb: (data: T) => void): void {
        this.events.on(event, cb);
    }
}