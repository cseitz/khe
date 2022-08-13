
import { createContext, useContext } from 'react'
import superjson from 'superjson';
import { SuperJSONResult } from 'superjson/dist/types';

/** @export 'content' */

export function getWebsiteContent() {
    const content = superjson.serialize(<WebsiteContent>{
        landing: {},
        about: {},
        faq: {
            questions: [
                { question: 'How do I do thing?', answer: 'just do it' },
                { question: 'What if I dont know how?', answer: 'then perish' },
            ]
        },
        footer: {

        },
        events: {
            title: 'Upcoming Events',
            subtitle: 'Sign up for them!',
            events: [
                {
                    id: '1',
                    startsAt: new Date('8/20/22 5:00 PM'),
                    endsAt: new Date('8/20/22 6:00 PM'),
                    title: 'Opening Ceremony',
                }
            ]
        }
    });
    return { content }
}


export const ContentContext = createContext<WebsiteContent>({} as any);

/** Fetches content that is mutable on the staff portal
 * - Used to customize the website without pushing new changes
 * - Only supports a small set of fields, primarily text-based.
 * - Effectively a wrapper around `useContext(ContentContext)`; but passed data is also assigned.
 * 
 * @param serverProps Primarily used by a page to pass in said content that is pulled during [getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props)
 */
export const useContent = function(serverProps?: Partial<WebsiteContent> | SuperJSONResult | { content: SuperJSONResult }) {
    const ctx = useContext(ContentContext);
    if (serverProps) {
        if ('json' in serverProps) {
            serverProps = superjson.deserialize(serverProps);
        } else if ('content' in serverProps) {
            serverProps = superjson.deserialize(serverProps.content);
        }
        Object.assign(ctx, serverProps);
    } else {
        if (Object.keys(ctx).length === 0) {
            throw new Error(`Content is not yet loaded! Must utilize getServerSideProps! Check out 'api/content.ts'!`)
        }
    }
    return ctx;
}


export type WebsiteContent = {
    landing: {

    },
    about: {

    },
    faq: {
        questions: FrequentlyAskedQuestion[]
    },
    footer: {

    },
    events: {
        title: string
        subtitle?: string
        events: EventData[]
    }
}


export type EventData = {
    startsAt: Date | string
    endsAt: Date | string
    title: string
    type?: string
    id: string
}

export type FrequentlyAskedQuestion = {
    question: string
    answer: string
}
