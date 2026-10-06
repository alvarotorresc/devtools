// "/" answers with a 302 to /es or /en for each visitor (see netlify/lib/root-language.ts).
import { rootRedirect } from '../lib/root-language.ts';

export default (request: Request): Response => rootRedirect(request);

export const config = { path: '/' };
