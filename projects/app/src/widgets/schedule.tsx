import { Box } from '@mui/material'


namespace Full {

    export function Schedule() {

        return <Box>
            schedule
        </Box>
    }
}

namespace Preview {

    export function Schedule() {

        return <Box>
            schedule preview
        </Box>
    }
}


export const Schedule = Object.assign(Full.Schedule, {
    Preview: Preview.Schedule,
});