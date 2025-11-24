const key_web_js = '511a7ace139f9332a83c64086d925618' // web js key
const key_service = '1a6301adcd7795fc0bb502ee5d776852'  // web服务 key
// 管理地址在：https://console.amap.com/dev/key/app

// 七牛云 与 《标题日记》共用一个 仓库
// 地址： https://portal.qiniu.com/kodo/overview
const qiniu_img_base_url = 'http://t45y867uw.hb-bkt.clouddn.com/' // 空间域名，最后面带 `/`
const qiniu_bucket_name = 'travel-map-pointer-images' // 七牛云对象存储空间的名称
const thumbnail200_suffix = 'thumbnail_200px' // 七牛云缩略图样式名  200x200px 质量75
const thumbnail600_suffix = 'thumbnail_600px' // 七牛云缩略图样式名  600x600px 质量75
const thumbnail1000_suffix = 'thumbnail_1000px' // 七牛云缩略图样式名  1000x1000px 质量75
const thumbnail1500_suffix = 'thumbnail_1500px' // 七牛云缩略图样式名  1500x1500px 质量75

export {
    key_web_js,
    key_service,
    qiniu_img_base_url,
    qiniu_bucket_name,
    thumbnail200_suffix,
    thumbnail600_suffix,
    thumbnail1000_suffix,
    thumbnail1500_suffix,
}
