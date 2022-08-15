import getConfig from 'next/config';
import Toolbelt from 'ts-toolbelt';
import { get, merge } from 'lodash';



export type ServerRuntimeConfig = ServerRuntime.Config;
namespace ServerRuntime {
    export type Config = {
        
        
    }
}

export type PublicRuntimeConfig = PublicRuntime.Config;
namespace PublicRuntime {
    export type Config = {
        mode: 'development' | 'production' | 'test';
        api: string;
    }
}



/** Retrieves an entry from PublicRuntimeConfig
 * @param path A list of keys to scope into a config entry.
 * 
 * Example: `{ path: { to: { entry: 'value' }}}`
 * - `Config('path', 'to', 'entry'): 'value'`
 */
 function Config<
 P extends Toolbelt.Object.Paths<PublicRuntimeConfig>
>(...path: P): Toolbelt.Object.Path<PublicRuntimeConfig, P> {
 if (process.env.NEXT_RUNTIME === 'edge') {
     console.log(process.env);
     // @ts-ignore
     return process.env[path.join('_').toUpperCase()];
 }
 return get(getConfig().publicRuntimeConfig, path);
}

/** Retrieves an entry from ServerRuntimeConfig or PublicRuntimeConfig
* @param path A list of keys to scope into a config entry.
* 
* Example: `{ path: { to: { entry: 'value' }}}`
* - `Config.Server('path', 'to', 'entry'): 'value'`
*/
Config.Server = function <
 P extends Toolbelt.Object.Paths<ServerRuntimeConfig & PublicRuntimeConfig>
>(...path: P): Toolbelt.Object.Path<ServerRuntimeConfig & PublicRuntimeConfig, P> {
 if (process.env.NEXT_RUNTIME === 'edge') {
     // @ts-ignore
     return process.env[path.join('_').toUpperCase()];
 }
 const merged = merge({}, getConfig().serverRuntimeConfig, getConfig().publicRuntimeConfig)
 return get(merged, path);
}

export { Config };
