interface ServerResponse<T>{
    message: string,
    success: boolean,
    data: T
}

export {
    type ServerResponse
}
