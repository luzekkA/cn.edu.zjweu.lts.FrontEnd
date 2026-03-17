import { settings, Env } from "../settings";
import { useUserStore } from "../store/useUserStore";
import { getToken } from "./auth";
import { ElMessage} from "element-plus";
import axios, { AxiosInstance } from 'axios'
import { devLog } from "./devLog";

let baseURL = ''
if (settings.env == Env.Mock) {
    baseURL = settings.mockURL
}
else if (settings.env == Env.Dev) {
    baseURL = settings.baseURL
}
const service: AxiosInstance = axios.create({
    baseURL: baseURL,
    // timeout: 5000
})

service.interceptors.request.use(
    (config: any) => {
        // 在发送请求之前做些什么
        const userStore = useUserStore()
        // const userstore = getUserStore();
        if (userStore.token) {
            // config.headers['Authorization'] = getToken()
            config.headers['Authorization'] = getToken()
        }
        return config;
    },
    (error: any) => {
        devLog("request is err")
        // 处理请求错误
        console.log(error)
        return Promise.reject(error)
    },

)

let retryCount = 0;
const MAX_RETRY_COUNT = 3;
service.interceptors.response.use(
    (response: any) => {
        const userStore = useUserStore()
        let res = response
        let code
        devLog("this is response", res);
        if (response.data.code != null) {
            devLog("this response is usual", res)
            code = response.data.code
        }
        else {
            devLog("this response is from identity", res)
            code = response.status
        }

        devLog("this is code", code)
        // 对响应数据做点什么
        if (code != 200) {
            ElMessage.error(res.message || 'Error')

            // if (code == 401 || code == 50012 || code == 50014) {
            //     devLog("unAuth")
            //     if (userStore.refresh_token == '') {
            //         // to re-login
            //         ElMessageBox.confirm('你已经被登出，你可以取消以留在此页面，或者再次登录', '登出确认', {
            //             confirmButtonText: '重新登录',
            //             cancelButtonText: '取消登录',
            //             type: 'warning'
            //         }).then(() => {
            //             userStore.resetToken()
            //             location.reload()
            //         })
            //     }
            //     else{
            //         userStore.refreshToken()
            //         location.reload()
            //     }

            // }
            if (res && res.message) {
                return Promise.reject(new Error(res.message));
            } else {
                return Promise.reject(new Error('Error'));
            }
        } else {
            return res;
        }
    },
    async (error: any) => {
        // 处理响应错误
        // devLog("dsafdsafsdafdsafdsafdsafdas")
        console.log('err' + error)
        if (error.response) {
            if (error.response.status == 401 && retryCount < MAX_RETRY_COUNT) {
                retryCount++;
                devLog("401 err")
                const userStore = useUserStore()
                if (userStore.token != '') {

                    // const refreshTokenPromise = new Promise<void>(resolve => {
                    //     devLog("this is refresh step 1")
                    //     userStore.refreshToken()
                    //     // 在适当的时机解析Promise
                    //     resolve()
                    //   })
                    // await refreshTokenPromise
                    devLog("this is refresh step 1")
                    await userStore.refreshToken()
                    // userStore.refreshToken()
                    devLog("New token:", getToken())
                    error.config.headers['Authorization'] = getToken();
                    devLog("Resending request with new token")
                    return service(error.config)


                }
            }
        }
        devLog("reject by request")
        ElMessage.error(error.message || 'Error')
        return error;
    },
);

export default service;

