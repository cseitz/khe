import { Box, Card, Modal, ModalProps, Paper } from '@mui/material'
import { uniqueId } from 'lodash';
import { ContextType, createContext, useContext, useId, useRef, useState } from 'react'

/** @export 'widgets/modal' */

const ModalProviderContext = createContext<Record<string, ReturnType<typeof useModalProvider>>>({});

export function ModalProvider(props: { children: any }) {
    const ctx = useRef<ContextType<typeof ModalProviderContext>>({});
    return <ModalProviderContext.Provider value={ctx.current}>
        {props.children}
    </ModalProviderContext.Provider>
}

function useModalProvider<Props>(modalType: string) {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<Props>(null as any);

    function open(props: Props) {
        setData(props);
        setIsOpen(true);
    }

    function close() {
        setIsOpen(false);
    }

    return {
        isOpen,
        data,
        open,
        close,
    }
}


export function buildModal<Props>(Component: (props: Props) => JSX.Element) {
    const modalType = uniqueId('modalType');
    const render = function (modalProps: Omit<ModalProps, 'children' | 'open'>) {
        const ctx = useModalProvider<Props>(modalType);
        const providers = useContext(ModalProviderContext);
        if (modalType in providers) {
            Object.assign(providers[modalType], ctx);
        } else {
            providers[modalType] = ctx;
        }

        if (!ctx.data) return <></>
        return <Modal open={ctx.isOpen} onClose={() => ctx.close()}>
            <Component {...ctx.data as any} />
        </Modal>
    }

    const result = Object.assign(render, {
        modalType
    })

    return result as (typeof result & {
        Props: Props
    })
}


function useRender() {
    const [renderCount, setRenderCount] = useState(0);
    return () => setRenderCount(renderCount + 1);
}


export function useModal<
    T extends ReturnType<typeof buildModal>,
    Props = T['Props']
>(modal: T) {
    const modalType = modal.modalType;
    const ctx = useContext(ModalProviderContext)[modalType];
    const render = useRender();

    // const check = () => {
    //     if (!ctx || !ctx?.open) {
    //         render();
    //         return false;
    //     }
    //     return true;
    // }

    const operations = {
        open(props: Props) {
            ctx.open(props);
        },
        close() {
            ctx.close();
        }
    }


    /** All this ensures stuff gets called, even if not yet in context */
    const [pendingOps, setPendingOps] = useState<any[]>([]);
    const op = function<Key extends keyof typeof operations>(op: Key) {
        return function(...args: any) {
            if (!ctx) {
                setPendingOps([...pendingOps, [op, args]]);
            } else {
                // @ts-ignore
                operations[op](...args);
            }
        } as typeof operations[Key];
    }
    if (pendingOps.length > 0 && ctx) {
        const ops = [...pendingOps];
        setPendingOps([]);
        for (const [key, args] of ops) {
            operations[key](...args);
        }
    }


    return {
        open: op('open'),
        close: op('close'),
    }
}

export const TestModal = buildModal((props: { msg: string }) => {
    return <Box sx={{ maxWidth: 600, mx: 'auto', mt: '10vh', px: 1 }}>
        <Card sx={{ p: 2 }}>
            Modal: {props.msg}
        </Card>
    </Box>
})

