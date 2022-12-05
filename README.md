# React declarative-imperative bridge

This repository demonstrates a declarative-imperative bridge pattern (DIB) 
using custom elements.

## The problem

It is common that in an otherwise declarative application based around the 
React state we need to do something imperative. For instance, we may need to 
interactive with native imperative interfaces like the `HTMLMediaElement` 
API. Usually, in React applications, the `useEffect` and `useRef` hooks are 
used to embed the imperative code within the otherwise declarative component. 
This unnatural mix of imperative and declarative, however, creates additional 
complexity (the tension between the two worlds, boilerplate code, etc.).

## The solution

Custom elements provide us with an ability to observe attribute changes and 
react to them imperatively. This provides a natural way to bridge the gap 
between the declarative React code and the imperative native code. The React 
component merely sets the attributes and event listeners just like with any 
other HTML element, and bridging the gap is delegated to the custom element 
we call a 'bridge'.

## About the example

In the example code, we use the `<react-audio>` element as the bridge. In 
the provided code the custom element does not do any rendering of its own.
The element here serves *strictly* to facilitate bridging. This is not relevant 
to the DIB pattern. The bridge element could also render elements. That 
depends on the use case. A non-rendering bridge was chosen to simplify the 
example code, and also because it shows that React could retain control 
over the child elements with non-rendering bridges.

## Running the example

This example uses `esbuild`. To build the example, run:

```shell
npm run build
```

Then open `public/index.html` in your browser. No development server is 
required.
