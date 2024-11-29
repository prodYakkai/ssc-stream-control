const resWrap = (data?: unknown, code?: number, message?: string) => {
    return {
        code: code || 0,
        message: message || '',
        data: data || {}
    }
}

export default resWrap;