import { Box } from '@mui/material';
import { EventData, getWebsiteContent, useContent, WebsiteContent } from 'api/content';
import { InferGetServerSidePropsType } from 'next';


type ServerProps = InferGetServerSidePropsType<typeof getServerSideProps>;
export async function getServerSideProps({ req }) {
    return {
        props: {
            ...getWebsiteContent(),
        }
    }
}


export default function EventsPage(props: ServerProps) {
    const { events } = useContent(props).events;
    return <Box>
        {events.map(event => (
            <EventItem {...event} key={event.id} />
        ))}
    </Box>
}

function EventItem({ title, startsAt, endsAt }: EventData) {
    [startsAt, endsAt] = [startsAt, endsAt].map(o => new Date(o));
    return <Box>
        {title} starts at {startsAt.toLocaleString()} and ends at {endsAt.toLocaleString()}
    </Box>
}
