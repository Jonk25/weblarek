import { ProductCardBase } from '../base/ProductCardBase';

export class ProductCard extends ProductCardBase {
    constructor(container: HTMLElement) {
        super(container);
        
        this.container.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.emit('product:select');
        });
    }
}