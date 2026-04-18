import type { SchemaTypeDefinition } from 'sanity';
import { post } from './post';
import { faq } from './faq';

export const schemaTypes: SchemaTypeDefinition[] = [post, faq];
