var cardTemplate = '' +
    '<div class="post-card">' +
    '<a href="/posts/{{id}}">' +
    '<img class="card-thumbnail" src="{{thumbnail}}" alt="post thumbnail"/>' +
    '</a>' +
    '<div class="card-summary">' +
    '<table><tbody><tr><td>' +
    '<a href="/posts/categories/{{category_id}}">' +
    '<span class="card-category-name main-color">{{category_id}}</span>' +
    '</a>' +
    '<a href="/posts/{{id}}">' +
    '<div class="card-title normal-color">' +
    '{{title}}' +
    '</div>' +
    '</a>' +
    '<div class="card-info normal-color">' +
    '{{created_at}}' +
    '</div>' +
    '</td></tr></tbody></table>' +
    '</div>' +
    '</div>';

var ready = function () {

  var topSlider, header, bodyContainer, pagination, nextPage;
  var currentX, currentY;

  topSlider = document.getElementsByClassName('top-slider')[0];
  header = document.getElementsByClassName('root-header')[0];
  bodyContainer = document.getElementById('body-container');

  currentX = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
  currentY = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

  if (topSlider && header) {
    if (currentY >= topSlider.clientHeight) {
      bodyContainer.style.top = header.clientHeight + 16 + 'px';
      header.style.position = 'fixed';
    } else {
      bodyContainer.style.top = '16px';
      header.style.position = 'relative';
    }
  }

  window.onscroll = function (event) {
    var e = event || window.event;
    var pagination = document.getElementsByClassName('pagination')[0];
    var nextPage = document.querySelectorAll('.pagination .next a')[0];

    currentX = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
    currentY = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

    if (currentY && topSlider && header) {
      if (currentY > topSlider.clientHeight) {
        bodyContainer.style.top = header.clientHeight + 16 + 'px';
        header.style.position = 'fixed';
      } else {
        bodyContainer.style.top = '16px';
        header.style.position = 'relative';
      }
    }

    if (nextPage) {
      if (currentY + document.body.clientHeight > document.body.scrollHeight - 50) {
        var nextUrl, xhr, result;
        var pages, page, categories, categoryIdName, posts;

        nextPage.parentNode.setAttribute('class', '');
        nextUrl = nextPage.getAttribute('href');

        categories = {};
        categoryIdName = {};
        posts = {};

        if (nextUrl) {
          xhr = new XMLHttpRequest();
          xhr.open("GET", nextUrl);
          xhr.onreadystatechange = function () {
            var DONE, OK;

            DONE = 4;
            OK = 200;

            if (xhr.readyState != 4 || xhr.status != 200) {
              return;
            }

            result = JSON.parse(xhr.responseText);

            pages = result.pages;
            page = result.page;

            posts = result.posts;
            categories = result.categories;

            var categoryCounter = 0;
            for (; categoryCounter < categories.length; categoryCounter++) {
              var idStr = categories[categoryCounter].id;
              categoryIdName[idStr] = categories[categoryCounter].name;
            }

            if (posts) {
              var templateArr;
              var ul, liArr, pageNumber;

              templateArr = [];

              postCounter = 0;
              for (; postCounter < posts.length; postCounter++) {
                var template = cardTemplate;
                var post = posts[postCounter];
                var key = '';

                while (template.match(/(?:\{{2})(\w{1,50})+(?:\}{2})/)) {
                  key = template.match(/(?:\{{2})(\w{1,50})+(?:\}{2})/)[1];
                  if (key === 'created_at') {
                    var date = post[key];
                    var dateStr = '';
                    var monthStrArr = ['JAN', 'FAB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
                    dateStr = '' +
                        monthStrArr[(date.match(/(?:\d{4}-)(\d{2})(?:-\d{2})+/)[1] >> 0) - 1] + ' ' +
                        date.match(/(?:\d{4}-\d{2}-)(\d{2})/)[1] + '. ' +
                        date.match(/(\d{4})(?:-\d{2}-\d{2})/)[1];
                    template = template.replace(/(?:\{{2})(\w{1,50})+(?:\}{2})/, dateStr);
                  } else {
                    template = template.replace(/(?:\{{2})(\w{1,50})+(?:\}{2})/, post[key]);
                  }
                }

                while (template.match(/(?:<span[^>]*>)(\d{1,4})+(?:\<\/span\>)/)) {
                  key = template.match(/(?:<span[^>]*>)(\d{1,4})+(?:\<\/span\>)/)[1];
                  template = template.replace(/(?:<span[^>]*>)(\d{1,4})+(?:\<\/span\>)/, '<span class="card-category-name main-color"> ' + categoryIdName[key] + ' </span>');
                }
                templateArr.push(template);
              }

              bodyContainer.insertAdjacentHTML('beforeend', templateArr.join(''));
              bodyContainer.removeChild(pagination);

              ul = document.createElement('ul');
              ul.setAttribute('class', 'list-layout pagination none');

              liArr = [];

              i = page;
              for (; i < pages; i++) {
                var li = document.createElement('li');
                var a = document.createElement('a');
                if (i === page) {
                  li.setAttribute('class', 'active');
                } else if (i === page + 1) {
                  li.setAttribute('class', 'next');
                }
                a.setAttribute('href', '/?page=' + i);
                li.appendChild(a);
                ul.appendChild(li);
              }

              bodyContainer.insertAdjacentHTML('beforeend', ul.outerHTML);
            }
          };
          xhr.send();
        }
      }
    }
  };
};

