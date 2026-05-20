import { ProductCardBase } from '../base/ProductCardBase';
import { IProduct } from '../../types';

export class ProductCard extends ProductCardBase {
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

}