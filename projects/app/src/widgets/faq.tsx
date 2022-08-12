import { Accordion, AccordionDetails, AccordionSummary, Box } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SyntheticEvent, useState } from 'react';
import { WebsiteContent } from 'api/content';




export function FAQ(props: WebsiteContent['faq']) {
    const { questions } = props;
    const [expanded, setExpanded] = useState<number | null>(null);

    const handleChange = (question) => (event: SyntheticEvent, newExpanded: boolean) => {
        setExpanded(newExpanded ? question : null);
    }

    return <Box sx={{ maxWidth: 700, mx: 'auto' }}>
        {questions.map(({ question, answer }, i) => (
            <Accordion expanded={expanded === i} onChange={handleChange(i)} key={question}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {question}
                </AccordionSummary>
                <AccordionDetails>
                    {answer}
                </AccordionDetails>
            </Accordion>
        ))}
    </Box>
}