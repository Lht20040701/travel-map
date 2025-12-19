import { request } from './request'
import {Pager} from "@/api/Pager.ts";
import {ServerResponse} from "@/api/ServerResponse.ts";

// DTO
export interface ForumListRequest {
    keyword?:  string;
    category?: number;
    pageNo:   number;
    pageSize: number;
    isHot?: boolean;
}

// VO
export interface LuntanEntity {
    luntanId:    number;
    title:       string;
    uid:         number;
    routeId:     null;
    cardId:      number;
    replies:     number;
    views:       number;
    likes:       number;
    category:    number;
    isTop:       boolean;
    content:     null;
    latestReply: Date;
    publishTime: Date;
}

export interface ForumList {
    list: LuntanEntity[];
    pager: Pager;
}

export default {
    forumDetail(luntanId) { return request('get', null, null, false, `forum/detail/${luntanId}`)},
    forumList(requestData: ForumListRequest): Promise<ServerResponse<ForumList>> {
        return request('post', null, requestData, false, 'forum/list')
    },
    addForum(requestData) {
        return request('post', null, requestData, false, 'forum/add')
    },
    deleteForum(luntanId) {
        return request('delete', null, null, false, `forum/delete/${luntanId}`)
    },
}
