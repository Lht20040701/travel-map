import {request} from './request'
import {ServerResponse} from "@/api/ServerResponse.ts";

export interface Pager {
    pageNo: number;
    pageSize: number;
    total: number;
}

export interface Invitations {
    id: string,
    dateCreate: string,
    dateRegister: string,
    bindingUid: number,
}

export interface InviteListRequest {
    pageNo: number,
    pageSize: number,
    keyword: string
}

export type InviteListResponse = {
    list: Invitations[],
    pager: Pager
}

export default {
    list(requestData: InviteListRequest): Promise<ServerResponse<InviteListResponse>> {
        return request("post", null, requestData, false, "common/invites")
    }
}