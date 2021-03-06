import axios from 'axios'
import Cookies from 'js-cookie'
import { JSEncrypt } from 'jsencrypt'

const $publicKey = 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxesfHzXbRZ/QCYFr9uhj+OhYuvw7qJC5o6MCexJoNrxu6a9aLXvz9OMXIQMpvcbGua1E1MXcTiaHTRTphaSOYhtVNdef5EaTy/LHcovzNF05xTLI9/32239hMykJTWtp0z/IeZOBT6lVN30WQBvOfP7CnTyVHZ9jtPqW0OAQSPwIDAQAB'

const $axios = axios.create()

// 修改请求头
$axios.interceptors.request.use(request => {
  const userToken = Cookies.get('playerUserToken')
  if (userToken) {
    const encrypt = new JSEncrypt()
    // 设置公钥
    encrypt.setPublicKey($publicKey)
    const token = userToken.split('.')
    const token1 = encrypt.encrypt(token[0])
    const token2 = encrypt.encrypt(token[1])
    const token3 = encrypt.encrypt(token[2])
    request.headers.UserToken1 = token1
    request.headers.UserToken2 = token2
    request.headers.UserToken3 = token3
  }
  return request
}, error => {
  return Promise.reject(error)
})

export default $axios
