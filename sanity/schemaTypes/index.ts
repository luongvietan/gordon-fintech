import type { SchemaTypeDefinition } from 'sanity';
import { post } from './post';
import { faq } from './faq';
import { category } from './category';

export const schemaTypes: SchemaTypeDefinition[] = [post, faq, category];
