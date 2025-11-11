import {request} from "./request";
import { ServerResponse } from "./ServerResponse";

interface UploadTokenRequest {
    bucket: string
}

type UploadTokenResponse = String


export function getUploadToken(params: UploadTokenRequest): Promise<ServerResponse<UploadTokenResponse>> {
    return request('get', params, null,false, '/image-qiniu/')
}
