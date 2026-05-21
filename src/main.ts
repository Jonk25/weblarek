import './scss/styles.scss';

import { CatalogModel } from './components/models/CatalogModel';
import { CartModel } from './components/models/CartModel';
import { BuyerModel } from './components/models/BuyerModel';

import { Api } from './components/base/Api';
import { ShopApi } from './components/models/ShopApi';
import { API_URL } from './utils/constants';

import { Catalog } from './components/Catalog';
import { Cart } from './components/pages/Cart';
import { Modal } from './components/Modal';
import { Counter } from './components/ui/Counter';
import { SuccessMessage } from './components/ui/SuccessMessage';
import { OrderFormStep1 } from './components/forms/OrderFormStep1';
import { OrderFormStep2 } from './components/forms/OrderFormStep2';

import { ProductCard } from './components/cards/ProductCard';
import { ProductPreviewCard } from './components/cards/ProductPreviewCard';
import { CartItemCard } from './components/cards/CartItemCard';

import { MainPresenter } from './presenters/MainPresenter';

document.addEventListener('DOMContentLoaded', async () => {

    const catalogModel = new CatalogModel();
    const cartModel = new CartModel();
    const buyerModel = new BuyerModel();

    const baseApi = new Api(API_URL);
    const shopApi = new ShopApi(baseApi);

    const gallery = document.querySelector('.gallery') as HTMLElement;
    const modalContainer = document.querySelector('#modal-container') as HTMLElement;
    const counterElement = document.querySelector('.header__basket-counter') as HTMLElement;

    if (!gallery || !modalContainer || !counterElement) {
        console.error('Не найдены обязательные элементы DOM');
        return;
    }

    const cardPreviewTpl = document.querySelector('#card-preview') as HTMLTemplateElement;
    const basketTpl = document.querySelector('#basket') as HTMLTemplateElement;
    const successTpl = document.querySelector('#success') as HTMLTemplateElement;
    const orderTpl = document.querySelector('#order') as HTMLTemplateElement;
    const contactsTpl = document.querySelector('#contacts') as HTMLTemplateElement;

    const getTemplateElement = (template: HTMLTemplateElement | null): HTMLElement => {
        if (!template) throw new Error('HTML-шаблон не найден в DOM');
        return (template.content.cloneNode(true) as DocumentFragment).firstElementChild as HTMLElement;
    };

    const catalogView = new Catalog(gallery);
    const counterView = new Counter(counterElement);
    const modalView = new Modal(modalContainer);
    const cartView = new Cart(getTemplateElement(basketTpl));
    const successView = new SuccessMessage(getTemplateElement(successTpl));
    const orderStep1View = new OrderFormStep1(getTemplateElement(orderTpl));
    const orderStep2View = new OrderFormStep2(getTemplateElement(contactsTpl));

    const cardFactory = {
        createCatalogCard: (container: HTMLElement) => new ProductCard(container),
        createPreviewCard: (container: HTMLElement) => new ProductPreviewCard(container),
        createCartItem: (container: HTMLElement) => new CartItemCard(container)
    };

    const presenter = new MainPresenter({
        api: shopApi,
        catalogModel,
        cartModel,
        buyerModel,
        catalogView,
        cartView,
        modal: modalView,
        counterView,
        successMessage: successView,
        orderFormStep1: orderStep1View,
        orderFormStep2: orderStep2View,
        previewCardTemplate: cardPreviewTpl,
        cardFactory
    });

    const basketIcon = document.querySelector('.header__basket') as HTMLElement;
    basketIcon?.addEventListener('click', () => presenter.openCart());

    presenter.init();

    try {
        const { items } = await shopApi.getProductList();
        catalogModel.setProducts(items);
    } catch (error) {
        console.error('Ошибка загрузки каталога:', error);
    }
});