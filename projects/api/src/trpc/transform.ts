import { isArray } from 'lodash';
import { Document } from 'mongoose';
import superjson from 'superjson';

function toObjects(data: any, depth = 0) {
    if (depth > 3) return data;
    const dp1 = depth + 1;
    if (isArray(data)) {
        return data.map(o => toObjects(o, dp1));
    }
    if (data instanceof Document) {
        return data.toObject();
    }
    if (typeof data == 'object' && String(data) === '[object Object]') {
        const mapped = {};
        for (const key in data) {
            mapped[key] = toObjects(data[key], dp1);
        }
        return mapped;
    }
    return data;
}


export const transformer = {
    input: {
        serialize: obj => obj ? superjson.serialize(obj) : obj,
        deserialize: superjson.deserialize,
    },
    output: {
        serialize: obj => superjson.serialize(toObjects(obj)),
        deserialize: str => superjson.deserialize(str),
    }
}