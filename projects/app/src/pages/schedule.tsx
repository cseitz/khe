import { Box } from '@mui/material';
import { EventData, getWebsiteContent, useContent, WebsiteContent } from 'api/content';
import { InferGetServerSidePropsType } from 'next';
import { ServerProps } from 'utils/next';


export const getServerSideProps = ServerProps(async ({}) => {
    const content = await getWebsiteContent();
    return {
        props: {
            content,
        }
    }
});


export default function SchedulePage({ content}: typeof getServerSideProps) {
    const { events } = useContent(content).events;
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
