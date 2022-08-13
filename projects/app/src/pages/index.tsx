import { ContentContext, getWebsiteContent, useContent, WebsiteContent } from 'api/content';
import { Box, Button, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import { Theme } from '../theme/index';
import { FAQ } from '../widgets/faq';
import Head from 'next/head';
import Link from 'next/link';
import { Schedule } from '../widgets/schedule';
import { useContext } from 'react';

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
    paddingTop: '50px',
    paddingBottom: '50px',
})

const FullSection = styled(Section)({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',

})

export default function Homepage(props: ServerProps) {
    const { landing, about, faq, footer } = useContent(props);
    return <>
        <Head>
            <title>Kent Hack Enough</title>
        </Head>
        <Box>
            {/* <Landing {...landing} />
            <About {...about} />
            <FrequentlyAskedQuestions {...faq} />
            <Footer {...footer} /> */}
            <Landing />
            <About />
            <FrequentlyAskedQuestions />
            <Footer />
        </Box>
    </>
}


// function Landing(props: WebsiteContent['landing']) {
function Landing(props: {}) {
    const {} = useContent();
    const theme = useTheme();
    return <FullSection sx={{ ...Theme.Background('primary'), textAlign: 'center' }}>
        <Typography>Landing</Typography>
    </FullSection>
}

// function About(props: WebsiteContent['about']) {
function About(props: {}) {
    const {} = useContent();
    return <Section sx={{ backgroundColor: 'lightpink', textAlign: 'center' }}>
        <Typography>About</Typography>
        
    </Section>
}

// function FrequentlyAskedQuestions(props: WebsiteContent['faq']) {
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

// function Footer(props: WebsiteContent['footer']) {
function Footer(props: {}) {
    const {} = useContent();
    return <Typography>Footer</Typography>
}

