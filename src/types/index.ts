export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export type TPayment = 'online' | 'cash'; // или 'card' | 'cash' – уточни по макету

export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}

export interface IBuyer {
    payment: TPayment;
    email: string;
    phone: string;
    address: string;
}

// Ответ сервера на запрос списка товаров
export interface IProductListResponse {
    items: IProduct[];
}

// Данные, отправляемые при оформлении заказа
export interface IOrderRequest {
    payment: TPayment;
    email: string;
    phone: string;
    address: string;
    items: string[]; 
    total: number;   
}

// Ответ сервера после успешного оформления заказа
export interface IOrderResponse {
    id: string;  
    total: number;
}
