import { IProduct, IBuyer } from '../types';
import { CatalogModel } from '../components/models/CatalogModel';
import { CartModel } from '../components/models/CartModel';
import { BuyerModel } from '../components/models/BuyerModel';
import { Catalog } from '../components/Catalog';
import { Cart } from '../components/pages/Cart';
import { Modal } from '../components/Modal';
import { Counter } from '../components/ui/Counter';
import { SuccessMessage } from '../components/ui/SuccessMessage';
import { ProductCard } from '../components/cards/ProductCard';
import { ProductPreviewCard } from '../components/cards/ProductPreviewCard';
import { CartItemCard } from '../components/cards/CartItemCard';
import { OrderFormStep1 } from '../components/forms/OrderFormStep1';
import { OrderFormStep2 } from '../components/forms/OrderFormStep2';

interface IShopApi {
    getProductList(): Promise<{ items: IProduct[] }>;
    postOrder(order: { payment: string; email: string; phone: string; address: string; items: string[]; total: number }): Promise<{ id: string; total: number }>;
}

interface IPresenterDeps {
    api: IShopApi;
    catalogModel: CatalogModel;
    cartModel: CartModel;
    buyerModel: BuyerModel;
    catalogView: Catalog;
    cartView: Cart;
    modal: Modal;
    counterView: Counter;
    successMessage: SuccessMessage;
    orderFormStep1: OrderFormStep1;
    orderFormStep2: OrderFormStep2;
    productCardTemplate: HTMLTemplateElement;
    previewCardTemplate: HTMLTemplateElement;
    cartItemTemplate: HTMLTemplateElement;
}

export class MainPresenter {
    private api: IShopApi;
    private catalogModel: CatalogModel;
    private cartModel: CartModel;
    private buyerModel: BuyerModel;
    private catalogView: Catalog;
    private cartView: Cart;
    private modal: Modal;
    private counterView: Counter;
    private successMessage: SuccessMessage;
    private orderFormStep1: OrderFormStep1;
    private orderFormStep2: OrderFormStep2;
    private productCardTemplate: HTMLTemplateElement;
    private cartItemTemplate: HTMLTemplateElement;

    private previewCard: ProductPreviewCard;

    constructor(deps: IPresenterDeps) {
        this.api = deps.api;
        this.catalogModel = deps.catalogModel;
        this.cartModel = deps.cartModel;
        this.buyerModel = deps.buyerModel;
        this.catalogView = deps.catalogView;
        this.cartView = deps.cartView;
        this.modal = deps.modal;
        this.counterView = deps.counterView;
        this.successMessage = deps.successMessage;
        this.orderFormStep1 = deps.orderFormStep1;
        this.orderFormStep2 = deps.orderFormStep2;
        this.productCardTemplate = deps.productCardTemplate;
        this.cartItemTemplate = deps.cartItemTemplate;

        const previewContainer = deps.previewCardTemplate.content.firstElementChild as HTMLElement;
        this.previewCard = new ProductPreviewCard(previewContainer);
    }

    init(): void {
        this.subscribeToModels();
        this.subscribeToViews();
        this.loadCatalog();
    }

    private subscribeToModels(): void {
        this.catalogModel.on<{ items: IProduct[] }>('catalog:changed', ({ items }) => this.renderCatalog(items));

        this.catalogModel.on<{ product: IProduct | null }>('preview:changed', ({ product }) => {
            if (product) this.openPreviewModal(product);
            else this.modal.close();
        });

        this.cartModel.on<{ items: IProduct[]; total: number; count: number }>('cart:changed', ({ items, total, count }) => {
            this.counterView.render(count);
            this.renderCartList(items, total);
        });

        this.buyerModel.on('buyer:changed', () => {
            this.syncFormsWithData();
            this.validateAndUpdateForms();
        });
    }

    private subscribeToViews(): void {
        this.cartView.on('cart:checkout', () => this.openCheckoutStep1());

        this.orderFormStep1.on('order-step1:submit', () => this.openCheckoutStep2());
        this.orderFormStep2.on('order-step2:submit', () => this.processOrder());

        this.orderFormStep1.on('form:change', (data) => {
            const v = data as Partial<IBuyer> | undefined;
            if (v?.address !== undefined) this.buyerModel.setAddress(v.address);
            if (v?.payment !== undefined && v.payment !== null) this.buyerModel.setPayment(v.payment);
        });

        this.orderFormStep2.on('form:change', (data) => {
            const v = data as Partial<IBuyer> | undefined;
            if (v?.email !== undefined) this.buyerModel.setEmail(v.email);
            if (v?.phone !== undefined) this.buyerModel.setPhone(v.phone);
        });

        this.previewCard.on<IProduct>('product:toggle-cart', () => {
            const product = this.previewCard.getData() as IProduct;
            if (this.cartModel.hasItem(product.id)) {
                this.cartModel.removeItem(product.id);
            } else {
                this.cartModel.addItem(product);
            }
            this.previewCard.setButtonState(this.cartModel.hasItem(product.id));
        });

        this.successMessage.on('success:close', () => {
            this.modal.close();
            this.cartModel.clear();
            this.buyerModel.clear();
        });
    }

    private async loadCatalog(): Promise<void> {
        try {
            const { items } = await this.api.getProductList();
            this.catalogModel.setProducts(items);
        } catch (error) {
            console.error('Ошибка загрузки каталога:', error);
        }
    }

    private renderCatalog(products: IProduct[]): void {
        this.catalogView.clear();
        products.forEach(product => {
            const fragment = this.productCardTemplate.content.cloneNode(true) as DocumentFragment;
            const cardContainer = fragment.firstElementChild as HTMLElement;
            if (!cardContainer) return;
            const card = new ProductCard(cardContainer);
            card.render(product);
            card.on<IProduct>('product:select', (data) => this.catalogModel.setPreview(data));
            this.catalogView.addCard(card.render());
        });
    }

    private openPreviewModal(product: IProduct): void {
        this.previewCard.render(product);
        this.previewCard.setButtonState(this.cartModel.hasItem(product.id));
        this.modal.render(this.previewCard.render());
        this.modal.open();
    }

    public openCart(): void {
        this.modal.render(this.cartView.render());
        this.modal.open();
    }

    private renderCartList(items: IProduct[], total: number): void {
        this.cartView.render({ items, total });
        this.cartView.clear();
        items.forEach((product, index) => {
            const fragment = this.cartItemTemplate.content.cloneNode(true) as DocumentFragment;
            const cardContainer = fragment.firstElementChild as HTMLElement;
            if (!cardContainer) return;
            const cartItem = new CartItemCard(cardContainer);
            cartItem.render(product);
            cartItem.index = index + 1;
            cartItem.on<IProduct>('cart:item-remove', () => this.cartModel.removeItem(product.id));
            this.cartView.addItem(cartItem.render());
        });
    }

    private openCheckoutStep1(): void {
        this.modal.close();
        this.modal.render(this.orderFormStep1.render());
        this.modal.open();
    }

    private openCheckoutStep2(): void {
        this.modal.render(this.orderFormStep2.render());
    }

    private syncFormsWithData(): void {
        const data = this.buyerModel.getData();
        this.orderFormStep1.render({ address: data.address, payment: data.payment });
        this.orderFormStep2.render({ email: data.email, phone: data.phone });
    }

    private validateAndUpdateForms(): void {
        const errors = this.buyerModel.validate();

        this.orderFormStep1.errors = {
            ...(errors.address && { address: errors.address }),
            ...(errors.payment && { payment: errors.payment })
        };

        this.orderFormStep2.errors = {
            ...(errors.email && { email: errors.email }),
            ...(errors.phone && { phone: errors.phone })
        };
    }

    private async processOrder(): Promise<void> {
        const buyerData = this.buyerModel.getData();

        try {
            const order = {
                payment: buyerData.payment!,
                email: buyerData.email,
                phone: buyerData.phone,
                address: buyerData.address,
                items: this.cartModel.getItems().map(p => p.id),
                total: this.cartModel.getTotalPrice()
            };
            const response = await this.api.postOrder(order);
            this.successMessage.render({ id: response.id, total: response.total });
            this.modal.render(this.successMessage.render());
            this.cartModel.clear();
            this.buyerModel.clear();
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
        }
    }
}