import {request} from './request'
import {ServerResponse} from "@/api/ServerResponse.ts";

interface Pager {
    pageNo: number;
    pageSize: number;
    total: number;
}

interface Invitations {
    id: string,
    dateCreate: string,
    dateRegister: string,
    bindingUid: number,
}

interface InviteListRequest {
    pageNo: number,
    pageSize: number,
    keyword: string
}

type InviteListResponse = {
    list: Invitations[],
    pager: Pager
}

export default {
    list(requestData: InviteListRequest): Promise<ServerResponse<InviteListResponse>> {
        return request("post", null, requestData, false, "common/invites")
    }
}