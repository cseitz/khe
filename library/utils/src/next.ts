import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType, InferGetStaticPropsType, NextComponentType } from 'next/types';
import { AppProps } from 'next/app';
import superjson from 'superjson';

/** @export 'next' */

export function ServerProps<T extends GetServerSideProps>(getter: T): InferGetServerSidePropsType<T> {
    return async function(...args: any[]) {
        // @ts-ignore
        const result = await getter(...args);
        if ('props' in result) {
            result.props = superjson.serialize(result.props);
        }
        return result;
    } as any;
}

export function StaticProps<T extends GetStaticProps>(getter: T): InferGetStaticPropsType<T> {
    return async function(...args: any[]) {
        // @ts-ignore
        const result = await getter(...args);
        if ('props' in result) {
            result.props = superjson.serialize(result.props);
        }
        return result;
    } as any;
}

export function withSuperJSON(App: (AppProps) => JSX.Element) {
    return function(_: AppProps) {
        const props = _.pageProps;
        console.log({ props })
        if (props && 'json' in props) {
            const result = superjson.deserialize(props);
            delete props.json;
            if ('meta' in props) {
                delete props.meta;
            }
            Object.assign(props, result);
        }
        return App(_);
    }
}
