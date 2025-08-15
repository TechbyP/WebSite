import React from 'react';
import parse, { DOMNode, Element, domToReact } from 'html-react-parser';

const parseHtmlText = (htmlString: string): React.ReactNode => {
  return parse(htmlString, {
    replace: (domNode: DOMNode) => {
      if (domNode.type === 'tag') {
        const el = domNode as Element;

        if (el.name === 'strong') {
          return (
            <strong className="font-bold">
              {domToReact(el.children)}
            </strong>
          );
        }

        if (el.name === 'p') {
          return (
            <p className={el.attribs.class}>
              {domToReact(el.children)}
            </p>
          );
        }
      }
    },
  });
};

export default parseHtmlText;
