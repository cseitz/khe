import { Box, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import Head from 'next/head';

function getDetails() {
    return {
        landing: {

        },
        about: {

        }
    }
}

export async function getServerSideProps({ req }) {

    return {
        props: {
            ...getDetails(),
        }
    }
}


const Section = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    height: '100vh'
})

export default function Homepage({ landing, about }: ReturnType<typeof getDetails>) {

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


function Landing() {
    const theme = useTheme();
    return <Section sx={{ backgroundColor: theme.palette.primary.light, textAlign: 'center' }}>
        <Typography>Landing</Typography>
    </Section>
}

function About() {
    return <Section sx={{ backgroundColor: 'lightpink', textAlign: 'center' }}>
        <Typography>About</Typography>
    </Section>
}

function FrequentlyAskedQuestions() {
    return <Section sx={{ backgroundColor: 'cornsilk', alignContent: 'center' }}>
        <Typography>FAQ</Typography>
    </Section>
}

function Footer() {
    return <Typography>Footer</Typography>
}

