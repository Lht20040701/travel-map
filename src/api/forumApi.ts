import { request } from './request'

export default {
    forumDetail(luntanId) { return request('get', null, null, false, `forum/detail/${luntanId}`)}
}
