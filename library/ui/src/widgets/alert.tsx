import { Alert, AlertProps, Box, Slide, Snackbar } from "@mui/material";
import { createRenderAuthority, mergeProps, RenderAuthority, useRenderAuthority } from "../hooks";
import { createContext, MutableRefObject, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { uniqueId } from "lodash";

/** @export 'widgets/alert' */

// Used to display alerts and feedback to users.

type AlertType = AlertProps['color'];
type IAlert = {
    id?: string;
    type?: AlertType;
    message: string;
    duration?: number;
    unique?: string;
} & IAltertInternal & AlertProps;
type AlertOrMessage = Partial<IAlert> | string;

type IAltertInternal = {
    context?: IAlertContext;
    stage?: number;
    height?: number;
    offset?: number;
    ref?: MutableRefObject<HTMLDivElement>;
    __proto__?: Partial<IAlert>;
    [key: string]: any;
}

interface IAlertContext {
    alerts: IAlert[]
    renderAuthority: RenderAuthority;
    base?: Partial<IAlert>;
}

const AlertGlobalContext = {
    alerts: [],
    renderAuthority: createRenderAuthority(),
}

const AlertContext = createContext<IAlertContext>(AlertGlobalContext);

function ConstructAlert(details?: AlertOrMessage, ...extra: AlertOrMessage[]): IAlert {
    if (typeof details == 'string')
        details = { message: details } as any;
    extra = extra.map(o => typeof o == 'string' ? { message: o } : o) as any;
    let combined = {};
    while (extra.length > 0) {
        Object.assign(combined, extra.pop())
    }
    Object.assign(combined, details);
    details = combined;
    if (!details.id)
        details.id = uniqueId('alert');
    if (this)
        details.__proto__ = details;
    if (details?.context)
        details = { ...(details.context?.base || {}), ...details };
    return details as IAlert;
}


export function useAlert(base?: Partial<IAlert>) {
    const context = useContext(AlertContext);
    if (base) return bindCreateAlert({ context, ...base });
    return bindCreateAlert({ context }) as typeof createAlert;
}

export function createAlert(...args: Partial<AlertOrMessage>[]) {
    const details = ConstructAlert(...args)
    if (!details.context) details.context = AlertGlobalContext;
    // console.log('alert', details);
    if (details.unique) {
        const uniques = details.context.alerts.filter(o => o.unique == details.unique);
        let foundActive = false;
        uniques.forEach(o => {
            if ((o?.stage || 0) == 0) o.stage = 4;
            else { o.stage = 3; foundActive = true; }
        })
        if (foundActive) details.noSlide = true;
    }
    details.context.alerts.push(details);
    details.context.renderAuthority.render();
    return true;
}

createAlert.success = createAlert.bind(null, { type: 'success' }) as typeof createAlert;
createAlert.info = createAlert.bind(null, { type: 'info' }) as typeof createAlert;
createAlert.warning = createAlert.bind(null, { type: 'warning' }) as typeof createAlert;
createAlert.error = createAlert.bind(null, { type: 'error' }) as typeof createAlert;

function bindCreateAlert(base: Partial<IAlert>) {
    const bound = createAlert.bind(null, base);
    bound.success = (bound?.success || createAlert.success).bind(null, base) as typeof createAlert;
    bound.info = (bound?.info || createAlert.info).bind(null, base) as typeof createAlert;
    bound.warning = (bound?.warning || createAlert.warning).bind(null, base) as typeof createAlert;
    bound.error = (bound?.error || createAlert.error).bind(null, base) as typeof createAlert;
    return bound as typeof createAlert;
}


export function AlertProvider(props: Partial<IAlert> & { children: any }) {
    const { children, ...base } = props;
    const renderAuthority = useRef(createRenderAuthority()).current;
    const alerts = useRef([]).current;
    const ctx: IAlertContext = useMemo(() => ({
        base,
        alerts,
        renderAuthority,
    }), []);
    return <AlertContext.Provider value={ctx}>
        {children}
        <AlertDisplay />
    </AlertContext.Provider>
}

function AlertDisplay() {
    const context = useContext(AlertContext);
    useRenderAuthority(context.renderAuthority);

    context.alerts = context.alerts.filter(o => !o.stage || o.stage < 4);
    const { alerts } = context;
    return <>
        {alerts.slice(0, 3).map((alert, index) => (
            <AlertItemDisplay alert={alert} key={alert.id} />
        ))}
    </>;
}

function AlertItemDisplay(props: { alert: IAlert }) {
    const { alert } = props;
    const { message, id, type, noSlide = false, duration = 6000, ...alertProps } = alert;
    const context = alert.context as NonNullable<typeof alert['context']>;
    const { alerts, renderAuthority } = context;
    const ref = useRef<HTMLDivElement>(null);
    useRenderAuthority(renderAuthority);
    useEffect(() => {
        // @ts-ignore
        alert.ref = ref;
    }, [ref]);
    const previousAlertIndex = alerts.findIndex(o => o.id == id) - 1;
    const previousAlert = previousAlertIndex >= 0 ? alerts[previousAlertIndex] : null;
    const [stage, setStage] = useState(alert?.stage || 0);
    // @ts-ignore
    if (alert.stage > stage) setStage(alert.stage);
    useLayoutEffect(() => {
        if (stage == 0) {
            // @ts-ignore
            alert.height = ref.current.offsetHeight + 10;
            setStage(1);
            setTimeout(function() {
                setStage(2);
            }, 500)
        }
        // @ts-ignore
        alert.offset = previousAlert ? previousAlert.offset + previousAlert.height + 0 : 0;
        // console.log(alert.id, alert.offset);
    }, [previousAlert?.height, previousAlert?.offset]);
    useEffect(() => {
        alert.stage = stage;
        // console.log('do render');
        if (stage >= 3) {
            alert.height = 0;
            const tmt = setTimeout(() => {
                // @ts-ignore
                ++alert.stage;
                renderAuthority.render();
            }, 100);
            renderAuthority.render();
            return () => clearTimeout(tmt);
        }
        renderAuthority.render();
    }, [stage]);
    // @ts-ignore
    alert.offset = previousAlert ? previousAlert.offset + previousAlert.height + 0 : 0;

    const onClose = function (event, reason?) {
        if (reason == 'clickaway') return;
        setStage(3);
    }


    const elem = <Alert {...mergeProps(alertProps, {
        onClose,
        color: type
    })}>
        {message}
    </Alert>;
    return <Snackbar {...{
        ref,
        open: stage <= 2,
        onClose,
        autoHideDuration: duration || 6000,
        sx: {
            mb: alert.offset + 'px',
            transition: (!noSlide && stage >= 1) || (noSlide && stage >= 2) ? 'margin-bottom 0.25s' : undefined,
        }
    }}>
        <Box>
            {!alert.noSlide ? <Slide in={stage >= 1} direction="right">{elem}</Slide> : elem}
        </Box>
    </Snackbar>
}

