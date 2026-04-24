import './scss/styles.scss';

import { CatalogModel } from './components/models/CatalogModel';
import { CartModel } from './components/models/CartModel';
import { BuyerModel } from './components/models/BuyerModel';

import { apiProducts } from './utils/data';

import { Api } from './components/base/Api';
import { ShopApi } from './components/models/ShopApi';

import { API_URL } from './utils/constants';

const catalog = new CatalogModel();
catalog.setProducts(apiProducts.items);
console.log('1. Массив товаров каталога (тестовый):', catalog.getProducts());
console.log('2. Товар с id "2":', catalog.getProductById('2'));
console.log('3. Товар с id "99" (не существует):', catalog.getProductById('99'));

catalog.setPreview(apiProducts.items[0]);
console.log('4. Товар для предпросмотра:', catalog.getPreview());

const cart = new CartModel();
cart.addItem(apiProducts.items[0]);
cart.addItem(apiProducts.items[1]);
console.log('5. Товары в корзине:', cart.getItems());
console.log('6. Количество:', cart.getTotalCount());
console.log('7. Общая стоимость:', cart.getTotalPrice());
console.log('8. Есть товар с id "1"?', cart.hasItem('1'));
console.log('9. Есть товар с id "3"?', cart.hasItem('3'));

cart.removeItem(apiProducts.items[0].id);
console.log('10. После удаления:', cart.getItems());
cart.clear();
console.log('11. После очистки:', cart.getItems());

const buyer = new BuyerModel();
buyer.setAddress('ул. Пушкина');
buyer.setEmail('test@test.com');
console.log('12. Данные покупателя:', buyer.getData());
console.log('13. Ошибки валидации (не хватает payment и phone):', buyer.validate());

buyer.setPayment('card'); 
buyer.setPhone('+79991234567');
console.log('14. После полного заполнения:');
console.log('15. Данные:', buyer.getData());
console.log('16. Ошибки (должны быть пустым объектом):', buyer.validate());

buyer.clear();
console.log('17. После очистки:', buyer.getData());

const baseApi = new Api(API_URL);
const shopApi = new ShopApi(baseApi);

try {
    const data = await shopApi.getProductList();
    console.log('Ответ сервера /product/:', data);
    catalog.setProducts(data.items);
    console.log('Каталог после загрузки с сервера:', catalog.getProducts());
} catch (err) {
    console.error('Ошибка получения товаров:', err);
}