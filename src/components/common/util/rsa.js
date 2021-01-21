import {JSEncrypt} from 'jsencrypt'
export const getRSA = (pk, pwd) => {
    let jse = new JSEncrypt()
    jse.setPublicKey(pk)
    return jse.encrypt(pwd)
}
