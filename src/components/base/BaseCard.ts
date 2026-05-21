import { EventedComponent } from './EventedComponent';
import { IProduct } from '../../types';

export abstract class BaseCard extends EventedComponent<IProduct> {
    protected titleEl: HTMLElement;
    protected priceEl: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        this.titleEl = container.querySelector('.card__title')!;
        this.priceEl = container.querySelector('.card__price')!;
        
        if (!this.titleEl || !this.priceEl) {
            throw new Error('BaseCard: отсутствуют обязательные элементы');
        }
    }

    // 🔥 Единая сигнатура: данные опциональны, рендер безопасен
    render(data?: Partial<IProduct>): HTMLElement {
        if (!data) return this.container; // Защита от undefined
        
        this.title = data.title ?? '';
        this.price = data.price ?? null;
        return this.container;
    }

    set title(v: string) { this.titleEl.textContent = v; }
    
    set price(v: number | null) {
        this.priceEl.textContent = v === null ? 'Бесценно' : `${v} синапсов`;
    }
}