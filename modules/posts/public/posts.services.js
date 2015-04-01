'use strict';

angular.module('atwork.posts')
  .factory('appPosts', ['$resource',
    function($resource) {
      return {
        single: $resource('posts/:postId/:action', {
            postId: '@_id'
          }, {
            like: {
              method: 'POST',
              params: {action: 'like'}
            },
            unlike: {
              method: 'POST',
              params: {action: 'unlike'}
            },
            comment: {
              method: 'POST',
              params: {action: 'comment'}
            }
          }),
        feed: $resource('posts/'),
        timeline: $resource('posts/timeline/:userId')
      }
    }
  ])
  .filter('appPostFormat', [
    '$sce',
    function($sce) {
      return function(text) {
        var hashtags = new RegExp('#([A-Za-z0-9]+)', 'g');
        text = text.replace(hashtags, function(hashtag) {
          return '<a href="/feed/'+ hashtag.replace('#', '') +'">' + hashtag + '</a>'
        });

        var mentions = new RegExp('@([A-Za-z0-9_]+)', 'g');
        text = text.replace(mentions, function(mention) {
          return '<a href="/profile/'+ mention.replace('@', '') +'">' + mention + '</a>'
        });
        
        /**
         * Emoticons
         */
        var emots = [
          {
            key: ':)',
            value: 'fa-smile-o'
          }, {
            key: ':|',
            value: 'fa-meh-o'
          }, {
            key: ':(',
            value: 'fa-frown-o'
          }, {
            key: '(y)',
            value: 'fa-thumbs-o-up'
          }, {
            key: '(n)',
            value: 'fa-thumbs-o-down'
          }, {
            key: ':+1',
            value: 'fa-thumbs-up'
          }, {
            key: '(h)',
            value: 'fa-heart'
          }, {
            key: '(i)',
            value: 'fa-lightbulb-o'
          },
        ];

        var emotTemplate = '<md-inline-list-icon class="yellow fa {{emoticon}}"></md-inline-list-icon>';
        for (var i in emots) {
          var key = emots[i].key;
          var value = emots[i].value;
          text = text.replace(key, emotTemplate.replace('{{emoticon}}', value));
        };
        
        return $sce.trustAsHtml(text);
      };
    }
  ])
  ;
  