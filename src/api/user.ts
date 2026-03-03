import request from '../utils/request'
//获取用户信息
export function getInfo() {
    return request({
        url: '/User/UserInfo',
        method: 'get',
    })
}

//用户登录
export function login(data: any) {
    return request({
        url: '/User/Login',
        method: 'post',
        data
    })
}

// export function logout(token: string) {
//     return request()
// }

export function refreshToken(refreshToken:any){
    return request({
        url: 'User/refresh',
        method: 'post',
        data: {
            refreshToken: refreshToken
        }
    })
}

export function getCode(email:any){
    return request({
        url: '/User/forgotPassword',
        method: 'post',
        data: {
            email: email
        }
    })
}

export function addEmail(email:any){
    return request({
        url: '/User/AddEmail',
        method: 'post',
        params: {
            email: email
        }
    })
}

export function resetPassword(email:any,newPassword:any,resetCode:any){
    return request({
        url: '/User/resetPassword',
        method: 'post',
        data: {
            email: email,
            resetCode:resetCode,
            newPassword:newPassword
        }
    })
}