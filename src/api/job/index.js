import request from '../../utils/request';


export const getJobList = query => {
    return request({
        url: '/cron/http',
        method: 'get',
        params: query
    });
};

export const switchJob = query => {
    return request({
        url: '/cron/http/switch',
        method: 'post',
        params: query,
        headers: {
            'access_key': localStorage.getItem('access_key')
        }
    });
};

export const addJob = query => {
    return request({
        url: '/cron/http/create',
        method: 'post',
        data: query
    });
};

export const updateJob = query => {
    return request({
        url: '/cron/http/update',
        method: 'post',
        data: query
    });
};
