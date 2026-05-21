import { IProduct, IBuyer, TPayment } from '../types';

export interface IApi {
    getProductList(): Promise<{ items: IProduct[] }>;
    postOrder(order: { payment: TPayment | null; email: string; phone: string; address: string; items: string[]; total: number }): Promise<{ id: string; total: number }>;
}

export interface IModelEvents {
    on(event: string, cb: (data?: any) => void): void;
}

export interface ICatalogModel extends IModelEvents {
    setProducts(items: IProduct[]): void;
    setPreview(product: IProduct): void;
}

export interface ICartModel extends IModelEvents {
    hasItem(id: string): boolean;
    addItem(product: IProduct): void;
    removeItem(id: string): void;
    getItems(): IProduct[];
    getTotalPrice(): number;
    clear(): void;
}

export interface IBuyerModel extends IModelEvents {
    getData(): IBuyer;
    setAddress(address: string): void;
    setPayment(payment: TPayment): void;
    setEmail(email: string): void;
    setPhone(phone: string): void;
    validate(): Record<string, string>;
    clear(): void;
}

export interface IView {
    on(event: string, cb: (data?: any) => void): void;
    render(data?: any): HTMLElement;
    clear?(): void;
}

export interface ICatalogView extends IView {
    clear(): void;
    addCard(card: HTMLElement): void;
}

export interface ICartView extends IView {
    clear(): void;
    addItem(card: HTMLElement): void;
}

export interface IModalView extends IView {
    open(): void;
    close(): void;
}

export interface IFormView extends IView {
    errors: Record<string, string>;
}

export interface ICounterView {
    render(count: number): void;
}

export interface ICardFactory {
    createCatalogCard(container: HTMLElement): IView & { on(event: 'product:select', cb: (data: IProduct) => void): void };
    createPreviewCard(container: HTMLElement): IView & { setButtonState(inCart: boolean): void; on(event: 'product:toggle-cart', cb: () => void): void };
    createCartItem(container: HTMLElement): IView & { index: number; on(event: 'cart:item-remove', cb: () => void): void };
}

interface IPresenterDeps {
    api: IApi;
    catalogModel: ICatalogModel;
    cartModel: ICartModel;
    buyerModel: IBuyerModel;
    catalogView: ICatalogView;
    cartView: ICartView;
    modal: IModalView;
    counterView: ICounterView;
    successMessage: IView & { on(event: 'success:close', cb: () => void): void };
    orderFormStep1: IFormView;
    orderFormStep2: IFormView;
    previewCardTemplate: HTMLTemplateElement;
    cardFactory: ICardFactory;
}

export class MainPresenter {
    private api: IApi;
    private catalogModel: ICatalogModel;
    private cartModel: ICartModel;
    private buyerModel: IBuyerModel;
    private catalogView: ICatalogView;
    private cartView: ICartView;
    private modal: IModalView;
    private counterView: ICounterView;
    private successMessage: IView & { on(event: 'success:close', cb: () => void): void };
    private orderFormStep1: IFormView;
    private orderFormStep2: IFormView;
    private previewCard: IView & { setButtonState(inCart: boolean): void; on(event: 'product:toggle-cart', cb: () => void): void };
    private cardFactory: ICardFactory;
    private currentProduct: IProduct | null = null;

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
        this.cardFactory = deps.cardFactory;

        const previewContainer = deps.previewCardTemplate.content.firstElementChild as HTMLElement;
        this.previewCard = deps.cardFactory.createPreviewCard(previewContainer);
    }

    init(): void {
        this.subscribeToModels();
        this.subscribeToViews();
        this.loadCatalog();
    }

    private subscribeToModels(): void {
        this.catalogModel.on('catalog:changed', ({ items }) => this.renderCatalog(items));
        this.catalogModel.on('preview:changed', ({ product }) => product ? this.openPreviewModal(product) : this.modal.close());
        this.cartModel.on('cart:changed', ({ items, total, count }) => {
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
            if (v?.email) this.buyerModel.setEmail(v.email);
            if (v?.phone) this.buyerModel.setPhone(v.phone);
        });

        this.previewCard.on('product:toggle-cart', () => {
            if (this.currentProduct) {
                if (this.cartModel.hasItem(this.currentProduct.id)) {
                    this.cartModel.removeItem(this.currentProduct.id);
                } else {
                    this.cartModel.addItem(this.currentProduct);
                }
                this.previewCard.setButtonState(this.cartModel.hasItem(this.currentProduct.id));
            }
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
            const tpl = document.querySelector('#card-catalog') as HTMLTemplateElement;
            if (!tpl) return;

            const fragment = tpl.content.cloneNode(true) as DocumentFragment;
            const cardContainer = fragment.firstElementChild as HTMLElement;
            if (!cardContainer) return;

            const card = this.cardFactory.createCatalogCard(cardContainer);
            card.render(product);
            card.on('product:select', () => this.catalogModel.setPreview(product));
            this.catalogView.addCard(card.render());
        });
    }

    private openPreviewModal(product: IProduct): void {
        this.currentProduct = product;
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
            const tpl = document.querySelector('#card-basket') as HTMLTemplateElement;
            if (!tpl) return;

            const fragment = tpl.content.cloneNode(true) as DocumentFragment;
            const cardContainer = fragment.firstElementChild as HTMLElement;
            if (!cardContainer) return;

            const cartItem = this.cardFactory.createCartItem(cardContainer);
            cartItem.render(product);
            cartItem.index = index + 1;
            cartItem.on('cart:item-remove', () => this.cartModel.removeItem(product.id));
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
        const data = this.buyerModel.getData();
        try {
            const order = {
                payment: data.payment!,
                email: data.email,
                phone: data.phone,
                address: data.address,
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