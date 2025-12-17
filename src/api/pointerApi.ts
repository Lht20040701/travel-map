import {request} from './request'
import {ServerResponse} from "@/api/ServerResponse.ts";
import {Pager} from "@/api/Pager.ts";

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

export interface MapPointerAndUser {
    id: number,
    name: string,
    pointers: string,
    note: string,
    area: string,
    dateCreate: string,
    dateModify: string,
    thumbUp: number,
    isPublic: number,
    uid: number,
    wx: string,
    nickname: string,
    username: string,
}

export interface ModifyPointer {
    img: string;
    name: string;
    note: string;
    position: number[];
}

export interface ModifyRequest {
    area: string;
    date_create: string;
    date_modify: string;
    id: number;
    is_public: number;
    name: string;
    nickname?: string;
    note: string;
    pointerArray?: ModifyPointer[];
    pointers: string;
    thumb_up: number;
    uid: number;
    username?: string;
    video_link?: string;
    wx?: string;
}

export type ModifyResponse = string

export interface ListRequest {
    dateRange?: string[];
    keyword?: string;
    pageNo: number;
    pageSize: number;
}

export interface ListResponse {
    list: MapPointerAndUser[];
    pager: Pager;
}

export default {
    add(requestData: AddRequest): Promise<ServerResponse<AddResponse>> {
        return request('post', null, requestData, false, 'map-pointer/add')
    },
    list(requestData: ListRequest): Promise<ServerResponse<ListResponse>>  {
        return request('post', null, requestData, false, 'map-pointer/list')
    },
    modify(requestData: ModifyRequest): Promise<ServerResponse<ModifyResponse>> {
        return request('put', null, requestData, false, 'map-pointer/modify')
    },
    delete(requestData) {
        return request('delete', null, requestData, false, 'map-pointer/delete')
    },
    detail(params) {
        return request('get', params, null, false, 'map-pointer/detail')
    },
}
