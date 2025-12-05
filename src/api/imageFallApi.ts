import { request } from './request'

export default {
    allImages() { return request('get', null, null, false, 'image/all') },
    addImage(requestData) { return request('post', null, requestData, false, 'image/addItemOption')}
}
