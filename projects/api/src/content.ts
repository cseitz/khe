

/** @export 'content' */

export function getWebsiteContent(): WebsiteContent {
    return {
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
                    startsAt: new Date('8/20/22 5:00 PM').toUTCString(),
                    endsAt: new Date('8/20/22 6:00 PM').toUTCString(),
                    title: 'Opening Ceremony',
                }
            ]
        }
    }
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