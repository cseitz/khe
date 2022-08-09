import { hi } from 'api';
import { What } from 'api/auth/client';

export default function Bruh() {
    return <div>
        <What />
        {hi}
    </div>
}