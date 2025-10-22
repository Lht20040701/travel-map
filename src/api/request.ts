import axios from "axios";
import {getAuthorization} from "@/utility";
import {ServerResponse} from "@/api/ServerResponse.ts";
import {ElLoading, ElMessage} from "element-plus";


const LOADING_OPTION = {
    lock: true,
    text: "载入中，请稍候...",
    background: "rgba(0, 0, 0, 0.3)"
}

// 判断项目环境，动态调整BASE_URL
const BASE_URL: string = process.env.NODE_ENV === 'development' ? '/dev/' : 'http://localhost/portal/' // 生产环境时是 ../portal

// 再封装axios
function request(
    method: 'get' | 'post' | 'put' | 'delete',              // 请求方式
    params: any,                                            // url参数
    requestData: any,                                       // 请求体数据
    showLoading = false,                           // 是否显示加载层
    url: string                                             // 请求地址
): Promise<ServerResponse> {
    let layerLoading = null
    // 加载遮罩层-ElLoading 来自 element-plus：https://element-plus.org/zh-CN/component/loading
    if (showLoading) layerLoading = ElLoading.service(LOADING_OPTION)

    let headers = {}
    /*
    * 所有 requestData 都会自动添加  authorization 信息
    * 给 requestData 添加 authorization 内部的数据： username email uid 等等
    * */
    if (url !== 'user/Login' && url !== 'user/Register') { // 注册和登录时不添加 Token 数据
        // object.assign：https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
        Object.assign(headers, {
            'Diary-Token': getAuthorization() && getAuthorization().token,
            'Diary-Uid': getAuthorization() && getAuthorization().uid
        })
    }

    // 使用promise包装axios
    return new Promise((resolve, reject) => {
        axios({
            url: BASE_URL + url,
            method,
            data: requestData,
            params,
            headers,
            withCredentials: true
        })
            .then(res => {
                if (showLoading && layerLoading) layerLoading.close()
                if (res.status === 200) {
                    if (res.data.success) {
                        resolve(res.data) // fulfilled状态，把res.data返回
                    } else {
                        ElMessage.error({
                            message: res.data.message || 'Error'
                        })
                        reject(res.data) // rejected状态，这里如果返回的是 null
                    }
                } else {
                    reject(res.data)
                    console.log('request err: ', res.data) // 如果演示模式，不用显示网络请求错误
                }
            })
            .catch(err => {
                if (showLoading && layerLoading) layerLoading.close()
                ElMessage.error({
                    message: err.message
                })
                console.log(err, err.message)
                reject(err)
            })
    })
}


export {
    request
}
