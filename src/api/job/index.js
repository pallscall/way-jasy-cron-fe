import request from '../utils/request';

export const fetchData = query => {
    return request({
        url: './table.json',
        method: 'get',
        params: query
    });
};

export const getJobList = query => {
    return request({
        url: '/cron',
        method: 'get',
        params: query
    });
};

export const switchJob = query => {
    return request({
        url: '/cron/switch',
        method: 'post',
        params: query
    });
};

export const addJob = query => {
    return request({
        url: '/cron/create',
        method: 'post',
        data: query
    });
};

export const updateJob = query => {
    return request({
        url: '/cron/update',
        method: 'post',
        data: query
    });
};
