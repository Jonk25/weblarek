import { IApi, IProductListResponse, IOrderRequest, IOrderResponse } from '../../types';

export class ShopApi {
    private readonly _api: IApi;

    constructor(api: IApi) {
        this._api = api;
    }

    // Получение списка товаров с сервера
    getProductList(): Promise<IProductListResponse> {
        return this._api.get<IProductListResponse>('/product/');
    }

    // Отправка заказа
    postOrder(order: IOrderRequest): Promise<IOrderResponse> {
        return this._api.post<IOrderResponse>('/order/', order, 'POST');
    }
}