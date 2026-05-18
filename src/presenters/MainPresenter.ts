import { IProduct, IBuyer } from '../types';
import { CatalogModel } from '../components/models/CatalogModel';
import { CartModel } from '../components/models/CartModel';
import { BuyerModel } from '../components/models/BuyerModel';
import { ShopApi } from '../components/models/ShopApi';
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

interface IPresenterDeps {
    api: ShopApi;
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
    private api: ShopApi;
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
    private previewCardTemplate: HTMLTemplateElement;
    private cartItemTemplate: HTMLTemplateElement;

    private isCartOpen = false;
    private currentStep: 1 | 2 = 1;

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
        this.previewCardTemplate = deps.previewCardTemplate;
        this.cartItemTemplate = deps.cartItemTemplate;
    }

    init(): void {
        this.subscribeToModels();
        this.subscribeToViews();
        this.loadCatalog();
    }

    private subscribeToModels(): void {
        this.catalogModel.on<{ items: IProduct[] }>('catalog:changed', ({ items }) => {
            this.renderCatalog(items);
        });

        this.catalogModel.on<{ product: IProduct | null }>('preview:changed', ({ product }) => {
            if (product) {
                this.openPreviewModal(product);
            } else {
                this.modal.close();
            }
        });

        this.cartModel.on<{ items: IProduct[]; total: number; count: number }>('cart:changed', ({ items, total, count }) => {
            this.counterView.render(count);
            if (this.isCartOpen) {
                this.renderCartList(items, total);
            }
        });
    }

    private subscribeToViews(): void {
        this.cartView.on('cart:checkout', () => this.openCheckoutStep1());

        this.orderFormStep1.on('form:submit', (values: Partial<IBuyer>) => {
            this.buyerModel.setAddress(values.address ?? '');
            if (values.payment) this.buyerModel.setPayment(values.payment);
            this.openCheckoutStep2();
        });

        this.orderFormStep2.on('form:submit', (values: Partial<IBuyer>) => {
            this.buyerModel.setEmail(values.email ?? '');
            this.buyerModel.setPhone(values.phone ?? '');
            this.processOrder();
        });

        this.orderFormStep1.on('form:change', (values: Partial<IBuyer>) => {
            this.buyerModel.setAddress(values.address ?? '');
            if (values.payment) this.buyerModel.setPayment(values.payment);
        });

        this.orderFormStep2.on('form:change', (values: Partial<IBuyer>) => {
            this.buyerModel.setEmail(values.email ?? '');
            this.buyerModel.setPhone(values.phone ?? '');
        });

        this.successMessage.on('success:close', () => {
            this.modal.close();
            this.cartModel.clear();
            this.buyerModel.clear();
            this.currentStep = 1;
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
        const fragment = this.previewCardTemplate.content.cloneNode(true) as DocumentFragment;
        const cardContainer = fragment.firstElementChild as HTMLElement;
        if (!cardContainer) return;

        const previewCard = new ProductPreviewCard(cardContainer);
        previewCard.render(product);
        previewCard.setButtonState(this.cartModel.hasItem(product.id));

        previewCard.on<IProduct>('product:toggle-cart', () => {
            if (this.cartModel.hasItem(product.id)) {
                this.cartModel.removeItem(product.id);
            } else {
                this.cartModel.addItem(product);
            }
            previewCard.setButtonState(this.cartModel.hasItem(product.id));
        });

        this.modal.render(previewCard.render());
        this.modal.open();
    }

    public openCart(): void {
        this.cartView.render({
            items: this.cartModel.getItems(),
            total: this.cartModel.getTotalPrice()
        });

        this.cartView.clear();
        this.cartModel.getItems().forEach((product, index) => {
            const fragment = this.cartItemTemplate.content.cloneNode(true) as DocumentFragment;
            const cardContainer = fragment.firstElementChild as HTMLElement;
            if (!cardContainer) return;

            const cartItem = new CartItemCard(cardContainer);
            cartItem.render(product);
            cartItem.index = index;
            cartItem.on<IProduct>('cart:item-remove', () => this.cartModel.removeItem(product.id));
            this.cartView.addItem(cartItem.render());
        });

        this.modal.render(this.cartView.render());
        this.modal.open();
        this.isCartOpen = true;
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
            cartItem.index = index;
            cartItem.on<IProduct>('cart:item-remove', () => this.cartModel.removeItem(product.id));
            this.cartView.addItem(cartItem.render());
        });
    }

    private openCheckoutStep1(): void {
        this.modal.close();
        this.isCartOpen = false;

        this.orderFormStep1.render({
            address: this.buyerModel.getData().address,
            payment: this.buyerModel.getData().payment
        });

        this.modal.render(this.orderFormStep1.render());
        this.modal.open();
        this.currentStep = 1;
    }

    private openCheckoutStep2(): void {
        this.orderFormStep2.render({
            email: this.buyerModel.getData().email,
            phone: this.buyerModel.getData().phone
        });

        this.modal.render(this.orderFormStep2.render());
        this.currentStep = 2;
    }

    private async processOrder(): Promise<void> {
        const buyerData = this.buyerModel.getData();
        const errors = this.buyerModel.validate();

        if (Object.keys(errors).length > 0) {
            if (this.currentStep === 1) {
                this.orderFormStep1.errors = {
                    address: errors.address ?? '',
                    payment: errors.payment ?? ''
                };
            } else {
                this.orderFormStep2.errors = {
                    email: errors.email ?? '',
                    phone: errors.phone ?? ''
                };
            }
            return;
        }

        try {
            const order = {
                payment: buyerData.payment,
                email: buyerData.email,
                phone: buyerData.phone,
                address: buyerData.address,
                items: this.cartModel.getItems().map(p => p.id),
                total: this.cartModel.getTotalPrice()
            };

            const response = await this.api.postOrder(order);

            this.successMessage.render({
                id: response.id,
                total: response.total
            });

            this.modal.render(this.successMessage.render());
            this.cartModel.clear();
            this.buyerModel.clear();
        } catch (error) {
            console.error('Ошибка оформления заказа:', error);
        }
    }
}