import {request} from './request'
import {ServerResponse} from "@/api/ServerResponse.ts";

export interface AddRequest {
     area: string;
     is_public: number;
     name: string;
     note: string;
     pointers: string;
     thumb_up: number;
     video_link: string;
}

export interface AddResponse {
    id: number;
}

export default {
    add(requestData: AddRequest): Promise<ServerResponse<AddResponse>> {
        return request('post', null, requestData, false, 'map-pointer/add')
    },
    list(requestData) {
        return request('post', null, requestData, false, 'map-pointer/list')
    },
    modify(requestData) {
        return request('put', null, requestData, false, 'map-pointer/modify')
    },
    delete(requestData) {
        return request('delete', null, requestData, false, 'map-pointer/delete')
    },
    detail(params) {
        return request('get', params, null, false, 'map-pointer/detail')
    },
}
