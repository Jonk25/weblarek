export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type TPayment = 'card' | 'cash';

export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IBuyer {
    payment: TPayment | null;   
    email: string;
    phone: string;
    address: string;
}

// Ответ сервера на запрос списка товаров
export interface IProductListResponse {
    total: number;       
    items: IProduct[];
}

// Данные, отправляемые при оформлении заказа
export interface IOrderRequest extends IBuyer {
    items: string[];     // массив id товаров
    total: number;       // итоговая сумма
}

// Ответ сервера после успешного оформления заказа
export interface IOrderResponse {
    id: string;
    total: number;
}

// Тип для ошибок валидации полей покупателя
export type TBuyerErrors = Partial<Record<keyof IBuyer, string>>;