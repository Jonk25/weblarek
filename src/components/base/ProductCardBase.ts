import { BaseCard } from './BaseCard';
import { IProduct } from '../../types';
import { categoryMap, CDN_URL } from '../../utils/constants';

export abstract class ProductCardBase extends BaseCard {
    protected imageEl: HTMLImageElement;
    protected categoryEl: HTMLElement;
    protected buttonEl: HTMLButtonElement | null;

    constructor(container: HTMLElement) {
        super(container);
        
        this.imageEl = container.querySelector('.card__image')!;
        this.categoryEl = container.querySelector('.card__category')!;
        this.buttonEl = container.querySelector('.card__button');

        if (!this.imageEl || !this.categoryEl) {
            throw new Error('ProductCardBase: отсутствуют image или category');
        }
    }

    override render(data?: Partial<IProduct>): HTMLElement {
        super.render(data);
        if (data) {
            this.image = data.image ?? '';
            this.category = data.category ?? '';
        }
        return this.container;
    }

    set image(v: string) {
        const fullUrl = v.startsWith('http') ? v : `${CDN_URL}/${v}`;
        this.imageEl.src = fullUrl;
        this.imageEl.alt = this.titleEl.textContent || 'Товар';
    }
    
    set category(v: string) {
        this.categoryEl.textContent = v;
        const cssClass = (categoryMap as Record<string, string>)[v] ?? categoryMap['другое'];
        this.categoryEl.className = `card__category ${cssClass}`;
    }
}