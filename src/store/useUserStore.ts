import { defineStore } from 'pinia'
import { getToken, setToken, removeToken, getRefreshToken, setRefreshToken } from '../utils/auth'
import { Names } from './store-name'
import { getInfo, login, refreshToken } from '../api/user'
import { resetRouter } from '../router/index'
import { devLog } from '../utils/devLog'
export const useUserStore = defineStore(Names.USERSTORE, {
  state: () => {
    return {
      //用户身份列表
      role: [] as String[],
      //从cookie中获取token
      token: getToken(),
      refresh_token: getRefreshToken(),
      //用户名
      name: '',
      id: '',
    }
  },
  getters: {
  },
  actions: {
    login(userInfo: any) {
      const { id, password } = userInfo
      devLog("login is running")
      return new Promise((resolve, reject) => {
        login({ id: id.trim(), password: password }).then(response => {
          devLog("this is data", response.data)
          devLog("this is accesstoken", response.data.accessToken)
          devLog("this is token type", response.data.tokenType)
          // this.token = response.data.tokenType + " " + response.data.accessToken
          this.token = response.data.tokenType + " " + response.data.accessToken
          this.refresh_token = response.data.tokenType + " " + response.data.refreshToken
          devLog("this is token", this.token)
          setToken(this.token)
          setRefreshToken(this.refresh_token)
          resolve(response)
        }).catch(error => {
          devLog("cant login")
          reject(error)
        })
      })
    },
    getInfo() {
      return new Promise((resolve, reject) => {
        getInfo().then(response => {

          //response.data  = response
          const data = response.data
          if (!data) {
            reject("验证失败请重新登录")
          }
          devLog('this is userInfo', data)
          const { role, userName, id } = data
          if (!role || (role == '')) {
            reject('getInfo: roles must be a non-null String!')
          }
          this.role = []
          this.role.push(role.toString())
          devLog('this is role in userStore', this.role)
          this.name = userName
          this.id = id
          // if (role == 'Student') {
          //   this.id = StudentId
          // }
          // else if (role == 'Teacher') {
          //   this.id = TeacherId
          // }
          // else if (role == 'Admin') {
          //   this.id = AdminId
          // }
          //this.avatar = ico
          //this.phone = phone
          resolve(response)
        }).catch(error => {
          devLog("userinfo err")
          reject(error)
        })
      })
    },
    logout() {
      this.token = ''
      this.refresh_token = ''
      this.role = []
      removeToken()
      resetRouter()
    },
    //清除token
    resetToken() {
      this.token = ''
      this.role = []
      removeToken()
    },
    //刷新token
    refreshToken() {
      return new Promise<void>((resolve, reject) => {
        // refreshCookieToken()
        refreshToken(this.refresh_token.substring(7)).then(response => {
          devLog("this is refreshToken", this.refresh_token)
          devLog("this is response")
          // this.token = response.data.tokenType + " " + response.data.accessToken
          this.token = response.data.tokenType + " " + response.data.accessToken

          this.refresh_token = response.data.tokenType + " " + response.data.refreshToken
          setToken(this.token)
          setRefreshToken(this.refresh_token)
          devLog("refresh over")
          devLog("this is refresh step 2")
          resolve()
        }).catch(error => {
          console.error('token刷新失败', error);
        });

      })
    }
  }
})

