import {request} from "./request";
import { ServerResponse } from "./ServerResponse";

export interface CommentEntity {
    commentId: number
    luntanId: number
    content: string
    uid: number
    parentId: number
    commentTime: string
}

export interface CommentAddRequest {
    luntanId: number
    content: string
    parentId: number
}

export default {
    addComment(requestData: CommentAddRequest) {
        return request('post', null, requestData, false, 'comment/add')
    },
    deleteComment(commentId: number) {
        return request('delete', null, null, false, `comment/delete/${commentId})`)
    },
    getBundleComment(commentId: number) {
        return request('get', null, null, false, `comment/parent/${commentId})`)
    }
}