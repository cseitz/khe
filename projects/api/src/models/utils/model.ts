import { model, models, Schema, connect } from 'mongoose';
import { Config } from '../../../config';

console.log(Config.Server('mongo'))
connect(Config.Server('mongo'));

export function buildModel<Type>(name: string, schema: Schema): Type {
    if (name in models) {
        return models[name] as Type;
    }
    return model(name, schema) as Type;
}
