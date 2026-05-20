import { ProductCardBase } from '../base/ProductCardBase';
import { IProduct } from '../../types';

export class ProductPreviewCard extends ProductCardBase {
    private descEl: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        
        this.descEl = container.querySelector('.card__text')!;
        if (!this.descEl) {
            throw new Error('PreviewCard: не найден элемент .card__text');
        }

        this.buttonEl?.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.emit<IProduct>('product:toggle-cart', this.getData() as IProduct);  
        });
    }

    override render(data?: Partial<IProduct>): HTMLElement {
        super.render(data);
        if (data) {
            this.descEl.textContent = data.description ?? '';
        }
        return this.container;
    }

    setButtonState(inCart: boolean): void {
        if (this.buttonEl) {
            if (this.buttonEl.disabled) {
                this.buttonEl.textContent = 'Недоступно';
            } else {
                this.buttonEl.textContent = inCart ? 'Удалить из корзины' : 'Купить';
            }
        }
    }
}