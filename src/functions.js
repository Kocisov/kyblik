export default [
  {
    name: 'isNumber',
    use: false,
    fn: `function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n)
    }\n`
  },
  {
    name: 'random',
    use: false,
    fn: `function random(start, end) {
      return Math.floor(Math.random() * (start - end + 1) + end);
    }\n`
  },
  {
    name: 'fl',
    use: false,
    fn: `function fl(obj) {
      var b = obj.first, l = obj.second, c = obj.content
      if (b === l) {
        return c
      }
      return false
    }`
  },
  {
    // https://www.npmjs.com/package/debounce
    name: 'debounce',
    use: false,
    fn: `function debounce(func, wait, immediate) {
      var timeout, args, context, timestamp, result;
      if (null == wait) wait = 100;

      function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
          timeout = setTimeout(later, wait - last);
        } else {
          timeout = null;
          if (!immediate) {
            result = func.apply(context, args);
            context = args = null;
          }
        }
      }

      var debounced = function() {
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
          result = func.apply(context, args);
          context = args = null;
        }

        return result;
      };

      debounced.clear = function() {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
      };

      return debounced;
    }\n`
  }
];
