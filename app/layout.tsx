import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'PaperBridge — Your next step, made clear',description:'Turn a confusing letter into a clear checklist and a reply you understand.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
