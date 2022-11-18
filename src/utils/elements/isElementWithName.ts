import { ContentTypeElements } from '@kontent-ai/management-sdk';

export const isElementWithName = <Element extends ContentTypeElements.ContentTypeElementModel>(element: Element): element is Exclude<Element, ElementWithoutName> =>
  !['guidelines', 'snippet', 'taxonomy'].includes(element.type);

type ElementWithoutName = ContentTypeElements.IGuidelinesElement |
  ContentTypeElements.ITaxonomyElement |
  ContentTypeElements.ISnippetElement;
