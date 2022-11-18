import { ContentTypeElements } from '@kontent-ai/management-sdk';

export function getElementFieldProps(element: ContentTypeElements.ContentTypeElementModel) {
  switch (element.type) {
    case 'text':
    case 'rich_text':
    case 'url_slug':
      return { type: 'unicode' };

    case 'custom':
      return { type: 'text' };

    case 'multiple_choice':
    case 'asset':
    case 'modular_content':
    case 'taxonomy':
      return {
        type: 'text',
        list: true,
      };

    case 'number':
      return { type: 'float' };

    case 'date_time':
      return { type: 'datetime' };

    case 'guidelines':
      return { type: 'copy' };

    default:
      return { type: 'text' };
  }
}
