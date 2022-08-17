import { Box, Button } from '@mui/material';
import { TestModal, useModal } from 'ui/widgets/modal';


export default function ModalTestPage() {
    const modal = useModal(TestModal);
    return <Box>
        <TestModal keepMounted />
        eeey
        <Button onClick={() => modal.open({ msg: 'hey there! ' + String(Math.random()) })}>Open Modal</Button>
    </Box>
}