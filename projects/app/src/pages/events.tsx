import { Box } from '@mui/material';
import { EventData, getWebsiteContent, WebsiteContent } from 'api/content';


type ServerProps = Awaited<ReturnType<typeof getServerSideProps>>['props'];
export async function getServerSideProps({ req }) {
    return {
        props: {
            ...getWebsiteContent(),
        }
    }
}


export default function EventsPage({ events: { title, subtitle, events} }: ServerProps) {

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
