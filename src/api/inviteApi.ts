import {request} from './request'
export default {
    list(requestData) {return request("post", null, requestData, false, "common/invites")}
}