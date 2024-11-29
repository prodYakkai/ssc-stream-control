interface HttpResponse<T> {
    data: T;
    code: number;
    message?: string;
}
