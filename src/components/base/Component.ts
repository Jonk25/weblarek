/**
 * Базовый компонент
 * @template T — тип данных, которые компонент может отображать
 */
export abstract class Component<T> {

    protected data: Partial<T> = {};

    protected constructor(protected readonly container: HTMLElement) {
    }

    // Возвращаем копию, чтобы внешние изменения не мутировали внутреннее состояние
    protected getData(): Partial<T> {
        return { ...this.data };
    }

    // Инструментарий для работы с DOM в дочерних компонентах

    // Установить изображение с альтернативным текстом
    protected setImage(element: HTMLImageElement, src: string, alt?: string) {
        if (element) {
            element.src = src;
            if (alt) {
                element.alt = alt;
            }
        }
    }

    // Вернуть корневой DOM-элемент и обновить данные
    render(data?: Partial<T>): HTMLElement {
        if (data) {
            Object.assign(this.data, data);
        }
        return this.container;
    }
}