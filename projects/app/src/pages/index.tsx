import { getWebsiteContent, WebsiteContent } from 'api/content';
import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { Theme } from '../theme/index';
import { FAQ } from '../widgets/faq';
import Head from 'next/head';


type ServerProps = Awaited<ReturnType<typeof getServerSideProps>>['props'];
export async function getServerSideProps({ req }) {
    return {
        props: {
            ...getWebsiteContent(),
        }
    }
}


const Section = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh'
})

export default function Homepage({ landing, about, faq, footer }: ServerProps) {

    return <>
        <Head>
            <title>Kent Hack Enough</title>
        </Head>
        <Box>
            <Landing {...landing} />
            <About {...about} />
            <FrequentlyAskedQuestions {...faq} />
            <Footer {...footer} />
        </Box>
    </>
}


function Landing(props: WebsiteContent['landing']) {
    const theme = useTheme();
    return <Section sx={{ ...Theme.Background('primary'), textAlign: 'center' }}>
        <Typography>Landing</Typography>
    </Section>
}

function About(props: WebsiteContent['about']) {
    return <Section sx={{ backgroundColor: 'lightpink', textAlign: 'center' }}>
        <Typography>About</Typography>
    </Section>
}

function FrequentlyAskedQuestions(props: WebsiteContent['faq']) {
    return <Section sx={{ backgroundColor: 'cornsilk', alignContent: 'center' }}>
        <Typography>FAQ</Typography>
        <FAQ {...props} />
    </Section>
}

function Footer(props: WebsiteContent['footer']) {
    return <Typography>Footer</Typography>
}

