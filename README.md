# js-cake

This is a fork of the CoffeeScript `cake` tool that allows you to write your
Cakefile in JavaScript. It's useful for incrementally moving your code over to
JavaScript if you're already using `cake`.

For example, you can have a `Cakefile.js` file with these contents:

```js
task('do-thing', 'Do a thing', () => {
  console.log('Did a thing!');
});
```

And then invoke it via:

```
js-cake do-thing
```
