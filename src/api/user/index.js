import request from '../../utils/request';


export const login = query => {
    return request({
        url: '/account/login',
        method: 'post',
        data: query,
        headers: {
            'wj_cron': query.username,
        }
    });
};

export const register = query => {
    return request({
        url: '/account/register',
        method: 'post',
        data: query,
        headers: {
            'wj_cron': query.username,
        }
    });
};

export const getPublicKey = query => {
    return request({
        url: '/account/pubKey',
        method: 'get',
        headers: {
            'wj_cron': query.username,
        }
    });
}

export const generateRSA = query => {
    return request({
        url: '/account/crypt',
        method: 'post',
        headers: {
            'wj_cron': query.username,
        }
    });
}
