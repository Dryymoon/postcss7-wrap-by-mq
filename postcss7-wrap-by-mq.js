const postcss = require('postcss');

// plugin
module.exports = postcss.plugin('postcss7-wrap-by-mq', function (options) {
  return (css) => {
    options = options || {};

    const matchSelector = options.match || ':hover';
    const mediaQuery = options.mediaquery || '(min-width:1000px), (hover)';

    if (!matchSelector || !mediaQuery) return;

    // walk each rule in the stylesheet
    css.walkRules((rule) => {
      if (!rule.selector.includes(matchSelector)) return;

      const selectors = rule.selector.replace(/\r?\n|\r/g, ' ').split(',');

      // Build new selector with mediaquery

      const matchedSelectors = selectors
        .filter(
          function (selector) {
            return (selector.includes(matchSelector));
          });

      const newRule = rule.cloneBefore();

      newRule.selector = matchedSelectors.join(',');

      const newMediaRule = postcss.atRule({
        name: 'media',
        params: mediaQuery,
      });

      wrap(newRule, newMediaRule);

      // Delete or filter existed rule

      const notMatchedSelectors = selectors
        .filter(function (sel) {
          return !sel.includes(matchSelector);
        }).map(function (sel) {
          return sel.trim();
        });

      if (notMatchedSelectors.length > 0) {
        rule.selector = notMatchedSelectors.join(', ');
      } else {
        rule.remove();
      }
    });
  };
});

/*
@media (min-width:1000px), hover{
.item__link:hover{
  text-decoration:none;
  box-shadow:inset 0 0 0 0.07142857142857142em #e6e6e6, 0 0.14285714285714285em 0.42857142857142855em 0 rgba(0, 0, 0, .15);
} ==>
.item__link:hover{
    text-decoration:none;
    box-shadow:inset 0 0 0 0.07142857142857142em #e6e6e6, 0 0.14285714285714285em 0.42857142857142855em 0 rgba(0, 0, 0, .15);
  }
}
================================================
.item__link:hover .item__developerLogoWrap,
.item__link:hover .item__topicContainer{
  opacity:1;
} ==>

@media (min-width:1000px), hover{

.item__link:hover .item__developerLogoWrap, .item__link:hover .item__topicContainer{
    opacity:1;
  }
}

*/

function wrap(rule, wrappingWith) {
  rule.replaceWith(wrappingWith);
  wrappingWith.append(rule);
  wrappingWith.source = rule.source;
}
