import { BaseCard } from '../base/BaseCard'; 
import { IProduct } from '../../types';

export class CartItemCard extends BaseCard {
    private deleteBtn: HTMLElement;

    constructor(container: HTMLElement) {
        super(container); 
        
        this.deleteBtn = container.querySelector('.basket__item-delete')!;
        if (!this.deleteBtn) {
            throw new Error('CartItemCard: не найдена кнопка .basket__item-delete');
        }

        this.deleteBtn.addEventListener('click', () => {
            this.emit<IProduct>('cart:item-remove', this.getData() as IProduct);
        });
    }

    set index(value: number) {
        const indexEl = this.container.querySelector('.basket__item-index');
        if (indexEl) indexEl.textContent = String(value);
    }

    override render(data?: Partial<IProduct>): HTMLElement {
        super.render(data); 
        return this.container;
    }
}