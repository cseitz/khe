import { ContentContext, getWebsiteContent, useContent, WebsiteContent } from 'api/content';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { Theme } from '../theme/index';
import { FAQ } from '../widgets/faq';
import Head from 'next/head';
import Link from 'next/link';
import { Schedule } from '../widgets/schedule';
import { ServerProps } from 'utils/next';

export const getServerSideProps = ServerProps(async ({}) => {
    const content = getWebsiteContent();
    return {
        props: {
            content,
        }
    }
})


const Section = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '50px',
    paddingBottom: '50px',
})

const FullSection = styled(Section)({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',

})

export default function Homepage({ content }: typeof getServerSideProps) {
    const { landing, about, faq, footer } = useContent(content);
    return <>
        <Head>
            <title>Kent Hack Enough</title>
        </Head>
        <Box>
            <Landing />
            <About />
            <FrequentlyAskedQuestions />
            <Footer />
        </Box>
    </>
}


function Landing(props: {}) {
    const {} = useContent();
    const theme = useTheme();
    return <FullSection sx={{ ...Theme.Background('primary'), textAlign: 'center' }}>
        <Typography>Landing</Typography>
    </FullSection>
}

function About(props: {}) {
    const {} = useContent();
    return <Section sx={{ backgroundColor: 'lightpink', textAlign: 'center' }}>
        <Typography>About</Typography>
        <Schedule.Preview />
    </Section>
}

function FrequentlyAskedQuestions(props: {}) {
    const { faq } = useContent();
    return <Section id="faq" sx={{ backgroundColor: 'cornsilk', alignContent: 'center', p: 5, minHeight: '80vh' }}>
        <Typography variant='h4' sx={{ textAlign: 'center', pt: 2, pb: 5 }}>Frequently Asked Questions</Typography>
        <Box>
            <FAQ {...faq} />
            <Box sx={{ py: 8, textAlign: 'center' }}>
                <Typography sx={{ pb: 1 }}>Still have questions?</Typography>
                <Link href='/contact'>
                    <Button variant='contained' color='inherit'>Contact Us</Button>
                </Link>
            </Box>
        </Box>
    </Section>
}

function Footer(props: {}) {
    const {} = useContent();
    return <Typography>Footer</Typography>
}

