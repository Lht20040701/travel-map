# 路书
骑行路线规划应用

一个基于 [高德地图API](https://lbs.amap.com/api/javascript-api-v2/documentation) 制作的地图 web 应用，可以分享路线、查看 gpx 路径、地图信息点分享、各市区县布局等。

> **注意**  
高德地图api只用作开发测试用，并不能用于实际使用，如果持续使用，高德官方会打电话给你，督促你购买商业使用授权，每年5w，不缴纳就会过段时间给你把服务停了。  
所以在未获取到授权之前，不要用在商业项目上，不然挺麻烦的。
> 如果你想找一个免费的地图使用，可以看一下 [OpenStreetMap](https://www.openstreetmap.org/) OSM  
是一个可以免费使用的地图，地图信息主要靠所有网友自行添加维护。
> 它的用法也非常简单，我准备下一步的地图应用在这个基础上做，可以看一下例子： https://github.com/KyleBing/map-OSM
在使用它的时候，需要遵循一定的使用要求。



路线分享  
<img width="2032" alt="Screenshot 2024-01-23 at 17 45 28" src="https://github.com/KyleBing/map/assets/12215982/19597ade-9f78-4fdc-a0db-b0fd78fca6b4">

gpx 路径 展示  
<img width="2032" alt="GPX" src="https://github.com/KyleBing/map/assets/12215982/293ac9e9-dc52-4224-b855-97c707cf07ea">

gpx 3D 路径展示  
![2024-05-06 13-52-05 2024-05-06 13_55_08](https://github.com/KyleBing/map/assets/12215982/1bd3033e-84cf-4d56-9b3f-22e6c46c94b8)

数据点展示  
<img width="2032" alt="Screenshot 2024-01-23 at 17 39 57" src="https://github.com/KyleBing/map/assets/12215982/9ef18183-a004-4e51-a547-49bcb9fdfbd9">

范围标记  
<img width="2032" alt="Screenshot 2024-01-23 at 17 40 29" src="https://github.com/KyleBing/map/assets/12215982/6deab80c-ebcd-49db-a3d9-c4d178869682">

市内区县展示  
<img width="2032" alt="Screenshot 2024-01-23 at 17 40 42" src="https://github.com/KyleBing/map/assets/12215982/5a1603cb-1ecf-4782-a22d-5e684cfc3653">

---

# 开发

## 一、获取 高德地图 API key
**注意**  
高德地图api只用作开发测试用，并不能用于实际使用，如果持续使用，高德官方会打电话给你，督促你购买商业使用授权，每年5w

## 二、使用

修改 `/src/mapConfig.js` 中的高德地图开发 key，获取地址： [https://console.amap.com/dev/key/app](https://console.amap.com/dev/key/app)

有两个，别选错了


<img width="646" alt="开发api key 版本" src="https://github.com/KyleBing/map/assets/12215982/f3c7a06c-08b6-42b1-b4fc-a56569b925b4">


```js
const key_web_js = ''   // web js key
const key_service = ''  // web服务 key

export {
    key_web_js,
    key_service
}
```

Web JS 在使用的时候还需要在服务器中设置对应的安全密钥，具体参见官方文档：
> [JS API 安全密钥使用 https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode](https://lbs.amap.com/api/javascript-api-v2/guide/abc/jscode)

## 三、后台程序

后台：[https://github.com/KyleBing/portal](https://github.com/KyleBing/portal)


## 四、用到的技术
- `vue3` + `pinia` + `router`
- `ts`
- 高德 API 2.0

## 五、历程
- 2021-06-28 init `vue2`
- 2024-07-26 `vite` + `ts` + `vue3`


## 六、todo
- [x] 点过多时，列表滚动 `2025-04-18`
