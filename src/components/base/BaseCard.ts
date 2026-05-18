import { Component } from './Component';
import { IProduct } from '../../types';
import { categoryMap, CDN_URL } from '../../utils/constants';

export abstract class BaseCard extends Component<IProduct> {
    protected titleEl: HTMLElement;
    protected imageEl: HTMLImageElement;
    protected priceEl: HTMLElement;
    protected buttonEl: HTMLButtonElement | null;
    protected categoryEl: HTMLElement;
    
    private productData: Partial<IProduct> = {};

    constructor(container: HTMLElement) {
        super(container);
        this.titleEl = container.querySelector('.card__title')!;
        this.imageEl = container.querySelector('.card__image')!;
        this.priceEl = container.querySelector('.card__price')!;
        this.categoryEl = container.querySelector('.card__category')!;
        this.buttonEl = container.querySelector('.card__button');
        
        if (!this.titleEl || !this.imageEl || !this.priceEl || !this.categoryEl) {
            throw new Error('BaseCard: отсутствуют обязательные элементы');
        }
    }

    render(data?: Partial<IProduct>): HTMLElement {
        if (data) {
            this.productData = { ...this.productData, ...data };
            this.title = data.title ?? '';
            this.image = data.image ?? '';
            this.price = data.price ?? null;
            this.category = data.category ?? '';
        }
        return this.container;
    }

    getData(): Partial<IProduct> {
        return { ...this.productData };
    }

    set title(v: string) { this.titleEl.textContent = v; }
    
    set image(v: string) { 
        const fullUrl = v.startsWith('http') ? v : `${CDN_URL}/${v}`;
        this.imageEl.src = fullUrl;
        this.imageEl.alt = this.titleEl.textContent || 'Товар';
    }
    
    set price(v: number | null) {
        if (v === null) {
            this.priceEl.textContent = 'Бесценно';
            if (this.buttonEl) {
                this.buttonEl.disabled = true;
                this.buttonEl.textContent = 'Недоступно';
            }
        } else {
            this.priceEl.textContent = `${v} синапсов`;
            if (this.buttonEl) {
                this.buttonEl.disabled = false;
                this.buttonEl.textContent = 'Купить';
            }
        }
    }
    
    set category(v: string) {
        this.categoryEl.textContent = v;
        const cssClass = (categoryMap as Record<string, string>)[v] ?? categoryMap['другое'];
        this.categoryEl.className = `card__category ${cssClass}`;
    }
}