import request from '../../utils/request';


export const getShellJobList = query => {
    return request({
        url: '/cron/shell',
        method: 'get',
        params: query
    });
};

export const pingHost = query => {
    return request({
        url: '/cron/shell/ping',
        method: 'post',
        data: query
    });
}

export const addShellJob = query => {
    return request({
        url: '/cron/shell/create',
        method: 'post',
        data: query
    });
};
