// true = Mini App не ходит на внешний Fun&Sun (CORS / мёртвый API с GitHub Pages).
// Когда появится свой бэкенд — поставь false.
export const USE_MOCK_FUNSUN = true

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
