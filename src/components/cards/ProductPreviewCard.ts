import { BaseCard } from '../base/BaseCard';
import { IProduct } from '../../types';
import { EventEmitter } from '../base/Events';

export class ProductPreviewCard extends BaseCard {
    private descEl: HTMLElement;  
    private events = new EventEmitter();

    constructor(container: HTMLElement) {
    super(container);
    
    this.descEl = container.querySelector('.card__text')!;  
    if (!this.descEl) {
        throw new Error('PreviewCard: не найден элемент .card__text');
    }

    this.buttonEl?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('🛒 Клик по кнопке "Купить/Удалить"');
        this.emit<IProduct>('product:toggle-cart', this.getData() as IProduct);
    });
}

    render(data?: Partial<IProduct>): HTMLElement {
        if (data) {
            super.render(data);
            this.descEl.textContent = data.description ?? '';
        }
        return this.container;
    }

    setButtonState(inCart: boolean): void {
        if (this.buttonEl) {
            this.buttonEl.textContent = inCart ? 'Удалить из корзины' : 'Купить';
        }
    }

    emit<T extends object>(event: string, data?: T): void {
        this.events.emit(event, data);
    }

    on<T extends object>(event: string, cb: (data: T) => void): void {
        this.events.on(event, cb);
    }
}