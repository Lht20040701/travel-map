interface ServerResponse<T>{
    message: string,
    success: boolean,
    data: T,
    error: string
}

export {
    type ServerResponse
}
